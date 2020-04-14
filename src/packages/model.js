// chore: model redesign
//
// model({
//   name: "model",
//   url: "/api/usermodel",
//   lock: true,
//   store: true,
//   history: true,
//   data: {}
// });
import MODEL from '../constant/model.define';
import ERRORS from '../constant/errors.define';

import '../utils/model/links';
import store from '../lib/store';
import defined from '../utils/defined';
import modelLockStatus from '../utils/model/lockstatus';
import modelChangeDetector from '../utils/model/changeDetector';
import modelUpdate from '../utils/model/update';
import modelRequest from '../utils/model/request';
import { createLink, registerLink } from '../utils/model/linkSystem';
import { on, off, emit, registerEvent } from '../utils/universalEvent';
import { isIE } from '../utils/adapter';
import {
  _extend,
  _idt,
  _clone,
  _toString,
  _isString,
  _isBool,
  _isObject,
  _isPlainObject,
  _isArray,
  _isNumber,
  _isInt,
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
const changeReg = /^change:([\w\S]+)$/;

const model = function(option=broken_object) {
  const config = _extend(_clone(MODEL.DEFAULT_OPTION), option);

  if (!_isPlainObject(config.data) && !_isArray(config.data))
    throw new Error(ERRORS.MODEL_UNEXPECT);

  let cdata = config.data || {};

  let identify_lock = (this.isLock = !!config.lock);
  const identify_existname = _isString(config.name);
  const identify_usestore = _isBool(config.store) && config.store && identify_existname;
  const identify_usehistory = _isBool(config.history) && config.history;

  const historyRAM = [];
  const changeDetect = [];
  const events = _isPlainObject(config.events) ? config.events : broken_object;
  const initlize_data = identify_usestore ? store.get(config.name) || cdata : cdata;

  // create immutable data
  cdata = cdata === initlize_data ? cdata : _clone(initlize_data);

  _eachObject(
    events,
    registerEvent,
    defined(this, {
      name: identify_existname ? config.name : void 0,
      _mid: mid++,
      _ast: function(todo, v){
        const pass = _isFn(todo) ? todo : _cool;
        return v === _idt ? pass(cdata) : broken_object;
      },
      _asl: function(v){ return v === _idt ? identify_lock : null; },
      _ash: _createPrivate(historyRAM, broken_array),
      _asc: _createPrivate(changeDetect, broken_array),
      _l: function(state, v){ return v === _idt ? (this.isLock = identify_lock = !!state) : void 0; },
      _c: function(newdata, v){ return v === _idt ? (cdata = newdata) : broken_object; },
      _s: identify_usestore,
      _h: identify_usehistory
    }),
  );

  _extend(this, config, MODEL.IGNORE_KEYWORDS).emit('init').off('init');
};


const modelProtoType = {
  constructor: model,

  emit,

  on(type, callback){
    if (modelLockStatus(this)) return this;

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
    if (modelLockStatus(this)) return this;

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
      const assert = this._ast(_cool, _idt);
      // made it immutable
      res = _clone(_get(assert, _toString(key)));
    }

    return res;
  },

  set(key, val, isStatic) {
    if (modelLockStatus(this)) return;

    let res;

    const assert = this._ast(_cool, _idt);
    const assertram = this._ash(_idt);
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
          singleTypeFunc ? key(this.get()) : key;

        if (
          !_eq(assert, res)
          // && modelMultipleVerify(ref, this)
        ) {
          // create history
          if (this._h) assertram.push(assert);

          // change data
          this._c(_clone(res), _idt, (this.change = true));

          // save store
          if (this._s) store.set(this.name, res);

          if (!isStatic) modelChangeDetector(this, _clone(res), _clone(assert));
        }

      // multiple set(key,val)
      } else if (
        !_eq(_get(assert, key), val)
          // && modelSingleVerify(key, val, this)
      ) {
        // create history
        if (this._h) assertram.push(_clone(assert));

        const prevData = _clone(assert);

        res = _set(assert, key, _clone(val), (this.change = true));

        if (this._s) store.set(this.name, res);

        if (!isStatic) modelChangeDetector(this, _clone(res), prevData, key);
      }

    }

    return res;
  },

  remove(prop, isStatic) {
    if (modelLockStatus(this)) return;

    const assertram = this._ash(_idt);
    const assert = this._ast(_cool, _idt);

    if (_isPrim(prop) && prop != null) {
      // create history
      const prevData = _clone(assert);

      if (this._h) assertram.push(_clone(assert));

      _rm(assert, prop);

      if (this._s) store.set(this.name, assert);

      if (!isStatic) {
        let currentData = _clone(assert);

        modelChangeDetector(this, currentData, prevData, prop);

        if(!_eq(currentData, prevData))
          this.emit('remove:' + prop, [currentData]);

        return currentData;
      }

    }

    return _clone(assert);
  },

  clearStore(){
    if (modelLockStatus(this)) return this;
    if(this._s) store.rm(this.name);
    return this;
  },

  syncStore(isStatic){
    if (modelLockStatus(this)) return this;
    if(this._s && this.name){
      const syncStoreData = store.get(this.name);

      if(syncStoreData){
        this.set(syncStoreData, !!isStatic);
      }
    }

    return this;
  },

  extend(method={}){
    if(method && _isPlainObject(method))
      _extend(this, method, MODEL.IGNORE_KEYWORDS);
    return this;
  },

  // back prev data-set history
  back(pos, isStatic) {
    if (modelLockStatus(this) || !this._h) return;

    if(!_isInt(pos)){
      isStatic = !!pos;
      pos = -1;
    }

    const ram = this._ash(_idt);
    const assert = this._ast(_cool, _idt);
    const existHistory = ram.length;
    let currentData = _clone(assert);
    let source;
    let index;

    if(existHistory){
      index = pos < 0 ?
        Math.max(0, (existHistory + pos)) :
        Math.min(pos, existHistory-1);
      source = ram[index];
      ram.splice(index);
    }

    if(source){
      const prevData = this.get();

      currentData = _clone(source);

      this._c(source, _idt, (this.change = true));

      if (this._s) store.set(this.name, source);

      if (!isStatic){
        modelChangeDetector(this,currentData,prevData);

        this.emit('back', [currentData,prevData]);
      }
    }

    return currentData;
  },

  // create link form LinkSystem
  link(proto){
    if(proto &&
       _isFn(proto) &&
       this[proto.name] === proto)
      return createLink(this, proto.name);
  },

  // update model data from fetch request remote url
  update(options, idt, runtimeLinks, solveLinks, catchLinks){
    if(options === _idt){
      catchLinks = solveLinks;
      solveLinks = runtimeLinks;
      runtimeLinks = idt;
      idt = _idt;
      options = {};
    }

    options = _isPlainObject(options) ? options : {};

    solveLinks = idt === _idt ? (solveLinks || MODEL.LINKPERSET) : null;
    catchLinks = idt === _idt ? (catchLinks || MODEL.LINKPERSET) : null;
    runtimeLinks = idt === _idt ? (runtimeLinks || MODEL.LINKPERSET) : null;

    return modelUpdate(this, options, runtimeLinks, solveLinks, catchLinks);
  },

  // send request with model params
  request(options, idt, runtimeLinks, solveLinks, catchLinks){
    options = _isPlainObject(options) ? options : {};

    solveLinks = idt === _idt ? (solveLinks || MODEL.LINKPERSET) : null;
    catchLinks = idt === _idt ? (catchLinks || MODEL.LINKPERSET) : null;
    runtimeLinks = idt === _idt ? (runtimeLinks || MODEL.LINKPERSET) : null;

    return modelRequest(this, options, runtimeLinks, solveLinks, catchLinks);
  }
};

// FUCK DEAD Internet Explorer!! FUCK FUCK FUCK
// if is under Internet Explorer IE(8-11). auto add function name
if(isIE && Function.prototype.name == null)
  _eachObject(modelProtoType, function(proto, keyName){ proto.name = keyName; });

model.prototype = modelProtoType;

model.link = registerLink;

export default model;
