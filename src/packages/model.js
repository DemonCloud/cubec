// chore: model redesign
//
// model({
//   name: "model",
//   url: "/api/usermodel",
//   lock: true,
//   store: true,
//   history: true,
//   data: {
//     a: 1,
//     b: 2
//   }
// });
//
// model.link;
// linkRegister()
//
// model.link(model.set)
//   .validate()
//   .catch()

// model.link(model.fetch)
//   .parse(()=>{})
//   .param(()=>{})
//   .catch(()=>{})
import MODEL from '../constant/model.define';
import ERRORS from '../constant/errors.define';

import store from '../lib/store';
import defined from '../utils/defined';
import modelLockStatus from '../utils/model/lockstatus';
import modelChangeDetector from '../utils/model/changeDetector';
import modelUpdate from '../utils/model/update';
import { createLink } from '../utils/model/linkSystem';
import {on, off, emit, registerEvent} from '../utils/universalEvent';
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
  _isFn,
  _eachObject,
  _cool,
  _get,
  _set,
  _rm,
  _hasEvent,
  _isPrim,
  _eq,
} from '../utils/usestruct';

let mid = 0;
const changeReg = /^change:([\w\S]+)$/;

const model = function(option) {
  const config = _extend(_clone(MODEL.DEFAULT_OPTION), option || {});

  if (!_isPlainObject(config.data) && !_isArray(config.data))
    throw new Error(ERRORS.MODEL_UNEXPECT);

  let cdata = config.data || {};

  const identify_existname = _isString(config.name);
  const identify_usestore = _isBool(config.store) && config.store && identify_existname;
  const identify_usehistory = _isBool(config.history) && config.history;
  let identify_lock = (this.isLock = !!config.lock);

  let historyRAM = [];
  let changeDetect = [];
  const events = _isPlainObject(config.events) ? config.events : {};
  const initlize_data = identify_usestore ? store.get(config.name) || cdata : cdata;

  cdata = cdata === initlize_data ? cdata : _clone(initlize_data);

  _eachObject(
    events,
    registerEvent,
    defined(this, {
      name: identify_existname ? config.name : void 0,
      _mid: mid++,
      _ast: (todo, v) => {
        const pass = _isFn(todo) ? todo : _cool;
        return v === _idt ? pass(cdata) : {};
      },
      _asl: v => (v === _idt ? identify_lock : null),
      _ash: v => (v === _idt ? historyRAM : []),
      _asc: v => (v === _idt ? changeDetect : []),
      _l: (state, v) => (v === _idt ? (this.isLock = identify_lock = !!state) : void 0),
      _c: (newdata, v) => (v === _idt ? (cdata = newdata) : {}),
      _s: identify_usestore,
      _h: identify_usehistory
    }),
  );

  if (identify_existname) store.ram[config.name] = this;

  _extend(this, config, MODEL.IGNORE_KEYWORDS).emit('init').off('init');
};


model.prototype = {
  constructor: model,

  emit,

  on(type){
    if (modelLockStatus(this)) return this;

    if(type && _isString(type)){
      if(changeReg.test(type)){
        let changeDetect = this._asc(_idt);
        if(changeDetect.indexOf(type) === -1){
          changeDetect.push(type);
        }
      }
      return on.apply(this,arguments);
    }
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

    return off.apply(this,arguments);
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
    const data = this._ast(_clone, _idt);

    return (key || key === 0) ?
      (_isFn(key) ? key(data) :
      _get(data, _toString(key))) :
      data;
  },

  set(key, val, isStatic) {
    if (modelLockStatus(this)) return this;

    const assert = this._ast(_cool, _idt);
    const assertram = this._ash(_idt);
    const argslength = arguments.length;
    const useKeyword = argslength >= 2 && (_isNumber(key) || _isString(key));
    const undefinedArgs = (key == null) || (useKeyword && val===void 0);
    const single = !useKeyword && (_isObject(key) || _isFn(key));

    let ref;
    let currentData = assert;

    if (argslength && !undefinedArgs) {

      if (single) {
        // single pointer select
        isStatic = val;

        key = key instanceof model ? key.get() : (_isFn(key) ? key(this.get()) : key);

        if (
          (ref = key) &&
          !_eq(assert, ref)
          // && modelMultipleVerify(ref, this)
        ) {
          // create history
          const prevData = _clone(assert);

          // save history
          if (this._h) assertram.push(_clone(assert));

          // change data
          this._c(_clone(ref), _idt, (this.change = true));

          // save store
          if (this._s) store.set(this.name, ref);

          if (!isStatic){
            currentData = _clone(ref);
            modelChangeDetector(this,currentData,prevData);
          }
        }

      // multiple key,val
      } else if (
        !_eq(_get(assert, key), val)
          // && modelSingleVerify(key, val, this)
      ) {
        // create history
        const prevData = _clone(assert);

        if (this._h) assertram.push(_clone(assert));

        _set(assert, key, _clone(val), (this.change = true));

        if (this._s) store.set(this.name, assert);

        if (!isStatic) {
          currentData = _clone(assert);
          modelChangeDetector(this,currentData,prevData,key);
        }
      }

    }

    return _clone(currentData);
  },


  remove(prop, isStatic) {
    if (modelLockStatus(this)) return this;

    const assert = this._ast(_cool, _idt);
    const assertram = this._ash(_idt);

    if (_isPrim(prop) && prop != null) {
      // create history
      const prevData = _clone(assert);

      if (this._h) assertram.push(_clone(assert));

      _rm(assert, prop);

      if (this._s) store.set(this.name, assert);

      if (!isStatic) {
        const currentData = _clone(assert);
        modelChangeDetector(this,currentData,prevData,prop);
        this.emit('remove:' + prop, [currentData]);
      }
    }

    return _clone(assert);
  },

//   seek(keys, needCombined){
//     let res = {};

//     if(keys && (_isString(keys) || (_isArray(keys) && _every(keys, _isString)))){
//       const resource = modelSeek(this.get(),_isString(keys) ? [keys] : keys);

//       res = needCombined ? modelCombined(resource) : resource;
//     }

//     return res;
//   },

  clearStore(){
    if (modelLockStatus(this)) return this;

    if(this._s) store.rm(this.name);

    return this;
  },

  back(pos, isStatic) {
    if (modelLockStatus(this) || !this._h) return this;

    if(!_isNumber(pos)){
      isStatic = !!pos;
      pos = -1;
    }

    const ram = this._ash(_idt);
    const existHistory = ram.length;
    let source;
    let index;

    if(existHistory){
      index = pos < 0 ?
        Math.min(0, (existHistory+pos)) :
        Math.max(pos, existHistory-1);
      source = ram[index];
      ram.splice(index);
    }

    if(source){
      const prevData = this.get();

      this._c(source, _idt, (this.change = true));

      if (!isStatic){
        const currentData = _clone(source);
        modelChangeDetector(this,currentData,prevData);
        this.emit('back', [currentData,prevData]);
      }
    }

    return source ? _clone(source) : source;
  },

  link(proto){
    if(proto && proto.name)
      return createLink(this, proto.name);
  },

  // update model data from fetch request remote url
  update(options, idt, runtimeLinks, solveLinks, catchLinks){
    options = _isPlainObject(options) ? options : {};
    solveLinks = idt === _idt ? (solveLinks || MODEL.LINKPERSET) : null;
    catchLinks = idt === _idt ? (catchLinks || MODEL.LINKPERSET) : null;
    runtimeLinks = idt === _idt ? (runtimeLinks || MODEL.LINKPERSET) : null;

    return modelUpdate(this, options, runtimeLinks, solveLinks, catchLinks);
  },

  // send request with model params
  request(options, idt, runtimeLinks, solveLinks, catchLinks){
    solveLinks = idt === _idt ? (solveLinks || MODEL.LINKPERSET) : null;
    catchLinks = idt === _idt ? (catchLinks || MODEL.LINKPERSET) : null;
    runtimeLinks = idt === _idt ? (runtimeLinks || MODEL.LINKPERSET) : null;

    return modelRequest(this, options, runtimeLinks, solveLinks, catchLinks);
  }
};

export default model;
