// chore: model redesign
//
// model({
//   name: "model",
//   plugin: [],
//   data: {}
// });

import MODEL from '../constant/model.define';
import ERRORS from '../constant/errors.define';

import '../utils/model/links';
import storePlugin from '../utils/model/plugins/store';
import historyPlugin from '../utils/model/plugins/history';

import defined from '../utils/defined';
import modelLockStatus from '../utils/model/lockstatus';
import modelChangeDetector from '../utils/model/changeDetector';
import modelRequest from '../utils/model/request';
import { createLink, registerLink } from '../utils/model/linkSystem';
import { createPlugin, parsePlugin } from '../utils/model/pluginSystem';
import { on, off, emit, registerEvent } from '../utils/universalEvent';
import { isIE } from '../utils/adapter';
import {
  _extend,
  _idt,
  _clone,
  _toString,
  _isString,
  _isObject,
  _isPlainObject,
  _isArray,
  _isNumber,
  _isFn,
  _eachObject,
  _createPrivate,
  _cool,
  _get,
  _set,
  _rm,
  _hasEvent,
  _isPrim,
  _eq,

  broken_array,
  broken_object,
} from '../utils/usestruct';

let mid = 0;
const changeReg = /^change:[\S]+$/;

const model = function(option=broken_object) {
  // get merged config
  const config = _extend(_clone(MODEL.DEFAULT_OPTION), option);

  if (!_isPlainObject(config.data) && !_isArray(config.data))
    throw new Error(ERRORS.MODEL_UNEXPECT);

  let selfData = _clone(config.data);

  let identify_lock = (this.isLocked = !!config.lock);

  const changeDetect = [];

  // defined property
  defined(this, {
    name: config.name ? _toString(config.name) : void 0,

    _mid: mid++,

    _ast: function(todo, v){
      const pass = _isFn(todo) ? todo : _cool;

      return (todo === _idt || v === _idt) ?
        pass(selfData) : broken_object;
    },

    _asl: function(v){
      return v === _idt ? identify_lock : null;
    },

    _asc: _createPrivate(changeDetect, broken_array),

    _l: function(state, v){
      return v === _idt ? (this.isLocked = identify_lock = !!state) : void 0;
    }.bind(this),

    _c: function(newdata, v){
      return v === _idt ? (selfData = newdata) : broken_object;
    },
  });

  // register Events
  _eachObject(
    config.events,
    registerEvent,
    parsePlugin(this, config)
  );

  _extend(this, config, MODEL.IGNORE_KEYWORDS).
    emit('init').
    off('init');
};


const modelProtoType = {
  constructor: model,

  emit,

  on(type, callback){
    if (modelLockStatus(this)) return;

    if(type && _isString(type)){
      if(changeReg.test(type)){
        let changeDetect = this._asc(_idt);
        if(changeDetect.indexOf(type) === -1){
          changeDetect.push(type);
        }
      }
      return on.call(this, type, callback);
    }

    return this;
  },

  off(type, callback){
    if (modelLockStatus(this)) return;

    let changeDetect = this._asc(_idt);
    const findIndex = changeDetect.indexOf(type);

    if(type &&
      _isString(type) &&
      changeReg.test(type) &&
      findIndex > -1 &&
      !_hasEvent(this, type)){
      changeDetect.splice(findIndex,1);
    }else if(type == null){
      changeDetect.splice(0,changeDetect.length);
    }

    return off.call(this, type, callback);
  },

  lock() {
    this._l(true, _idt);

    this.emit('lock');

    return this;
  },

  unlock() {
    this._l(false, _idt);

    this.emit('unlock');

    return this;
  },

  get(key) {
    // get data not use clone
    let res;

    if(!key && key !== 0){
      res = this._ast(_clone, _idt);
    }else if(_isFn(key)){
      res = key(this._ast(_clone, _idt));
    }else{
      const assert = this._ast(_idt);
      // made it immutable
      res = _clone(_get(assert, _toString(key)));
    }

    return res;
  },

  set(key, val, isStatic) {
    if (modelLockStatus(this)) return;

    let res;

    const assert = res = this._ast(_idt);
    const argslength = arguments.length;
    const useKeyword = argslength >= 2 && (_isNumber(key) || _isString(key));
    // undefinedArgs
    const undefinedArgs = (key == null) || (key !== key);
    const singleTypeObject = _isObject(key);
    const singleTypeFunc = _isFn(key);
    const single = !useKeyword && (singleTypeObject || singleTypeFunc);

    if (argslength && !undefinedArgs) {
      if (single) {
        // single pointer select
        isStatic = val;

        // support function
        res = key instanceof model ? key.get() :
          singleTypeFunc ? key(this.get()) : _clone(key);

        if (!_eq(assert, res)){
          // change data
          this._c(res, _idt, (this.change = true));

          // trigger set event
          this.emit("set", [res, isStatic]);

          if (!isStatic){
            modelChangeDetector(this,  _clone(res), assert);
          }
        }

      // multiple set(key,val)
      } else if (!_eq(_get(assert, key), val)) {
        const prevData = _clone(assert);

        res = _set(assert, key, _clone(val), (this.change = true));

        // trigger set event
        this.emit("set", [res, isStatic]);

        if (!isStatic){
          modelChangeDetector(this, _clone(res), prevData, key);
        }
      }

    }

    return res;
  },

  remove(prop, isStatic) {
    if (modelLockStatus(this)) return;

    const assert = this._ast(_idt);

    if (_isPrim(prop) && prop != null) {
      // create history
      const prevData = _clone(assert);

      _rm(assert, prop);

      const currentData = _clone(assert);

      if(!_eq(currentData, prevData)){
        this.emit('remove', [assert, isStatic]);

        if (!isStatic){
          modelChangeDetector(this, currentData, prevData, prop);
        }

      }

      return currentData;
    }

    return assert;
  },

  extend(method={}){
    if(method && _isPlainObject(method))
      _extend(this, method, MODEL.IGNORE_KEYWORDS);
    return this;
  },

  // create link form LinkSystem
  link(proto){
    if(proto &&
       _isFn(proto) &&
       this[proto.name] === proto)
      return createLink(this, proto.name);
  },

  // send request with model params
  request(options, idt, runtimeLinks, solveLinks, catchLinks){
    options = _isPlainObject(options) ? options : {};

    solveLinks = idt === _idt ? (solveLinks || broken_array) : null;
    catchLinks = idt === _idt ? (catchLinks || broken_array) : null;
    runtimeLinks = idt === _idt ? (runtimeLinks || broken_array) : null;

    return modelRequest(this, options, runtimeLinks, solveLinks, catchLinks);
  }
};

// FUCK DEAD Internet Explorer!! FUCK FUCK FUCK
// if is under Internet Explorer IE(8-11). auto add function name
if(isIE && Function.prototype.name == null)
  _eachObject(modelProtoType, function(proto, keyName){ proto.name = keyName; });

model.prototype = modelProtoType;

model.link = registerLink;

model.plugin = createPlugin;

// build inside model plugin
createPlugin("store", storePlugin);
createPlugin("history", historyPlugin);

export default model;

