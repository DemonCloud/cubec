import MODEL from '../constant/model.define';
import ERRORS from '../constant/errors.define';

import store from '../lib/store';
import defined from '../utils/defined';
import modelMultipleVerify from '../utils/model/multipleVerify';
import modelSingleVerify from '../utils/model/singleVerify';
import modelPipe from '../utils/model/pipe';
import modelFetch from '../utils/model/fetch';
import modelLockStatus from '../utils/model/lockstatus';
import modelSeek from '../utils/model/seek';
import modelCombined from '../utils/model/combined';
import {on, off, emit, registerEvent} from '../utils/universalEvent';
import {
  _extend,
  _idt,
  _clone,
  _every,
  _isString,
  _isBool,
  _isObject,
  _isArray,
  _isArrayLike,
  _isNumber,
  _isFn,
  _eachObject,
  _eachArray,
  _cool,
  _size,
  _get,
  _set,
  _rm,
  _merge,
  _noop,
  _hasEvent,
  _isPrim,
  _eq,
} from '../utils/usestruct';

let mid = 0;
const changeReg = /^change:([a-zA-Z0-9_$.]+)$/;
const replaceChangeReg = /^change:/;

// C.Model
// A tool for storing data that uses a model to efficiently manage data structures while keeping the code clear and concise.
// Model has a written convention that the data stored by the model must be a standard JSON object.
// This special data format is because the model only cares about the data structure
// how to store data, how to communicate with the server, and how to persist locally.

// make fetch parse function
function makeParse(fn, model){
  return function(fetchData){
    let res;

    try {
      res = fn.call(this, fetchData);
    } catch (error) {
      console.error(ERRORS.MODEL_DEFAULT_PARSE);
      this.emit('catch', [error]);
      return false;
    }

    return res;
  }.bind(model);
}

// default fetch parse
function defaultParse(data){
  let res = data;

  if(_isArray(data)) res = { fetchMutipleData: data };

  return res;
}

const model = function(option = {}) {
  const config = _extend(_clone(MODEL.DEFAULT_OPTION), option);

  if (!_isObject(config.data) || _isArray(config.data))
    throw new Error(ERRORS.MODEL_UNEXPECT);

  const events = config.events;
  const verify = config.verify;

  const identify_existname = _isString(config.name);
  const identify_usestore =
    _isBool(config.store) && config.store && identify_existname;
  let identify_lock = (this.isLock = !!config.lock);

  let ram = [];
  let changeDetect = [];

  let cdata = config.data || {};
  let initlize_data = identify_usestore
    ? store.get(config.name) || cdata
    : cdata;

  cdata = _clone(initlize_data);

  _eachObject(
    events,
    registerEvent,
    defined(this, {
      name: identify_existname ? config.name : void 0,

      _ast: (todo, v) => {
        const pass = _isFn(todo) ? todo : _cool;
        return v === _idt ? pass(cdata) : {};
      },

      _mid: mid++,

      _asl: v => v === _idt ? identify_lock : null,

      _asv: v => v === _idt ? verify : {},

      _ash: v => v === _idt ? ram : [],

      _asc: v => v === _idt ? changeDetect : [],

      _v: !!_size(verify),

      _l: (state, v) =>
        v === _idt ? (this.isLock = identify_lock = !!state) : void 0,

      _c: (newdata, v) => v === _idt ? (cdata = newdata) : {},

      _s: identify_usestore,
    }),
  );

  if (identify_existname)
    store.ram[this.name] = this;

  _extend(this, config, MODEL.IGNORE_KEYWORDS).emit('init').off('init');
};

function modelChangeDetecter(model,currentData,prevData,preset){
  const res = [];
  const detectList = model._asc(_idt);
  model.emit("change", [currentData,prevData]);

  if(detectList.length){
    if(preset && _isString(preset)){
      const currentPath = `change:${preset}`;
      const testReg = new RegExp(`^${currentPath}\\.([a-zA-Z_$0-9])+`);

      _eachArray(detectList, function(path){
        if(currentPath === path || testReg.test(path)){
          const spath = path.replace(replaceChangeReg,'');
          const cv = _get(currentData,spath);
          const pv = _get(prevData,spath);

          if(!_eq(cv,pv)) res.push([path,[cv,pv]]);
        }
      });
    }else{
      _eachArray(detectList, function(path){
        const spath = path.replace(replaceChangeReg,'');
        const cv = _get(currentData,spath);
        const pv = _get(prevData,spath);

        if(!_eq(cv,pv)) res.push([path,[cv,pv]]);
      });
    }
  }

  _eachArray(res,function([event,args]){
    model.emit(event,args);
  });

  return model;
}

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

  off(type,callback){
    if (modelLockStatus(this)) return this;

    off.apply(this,arguments);
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

    return this;
  },

  lock() {
    this._l(true, _idt);
    return this.emit('lock');
  },

  unlock() {
    this._l(false, _idt);
    return this.emit('unlock');
  },

  get(key, by) {
    const data = this._ast(_clone, _idt);

    return (key || key === 0) ? (_isFn(key) ? key(this.get()) : _get(data, key, by)) : data;
  },

  set(key, val, isStatic) {
    if (modelLockStatus(this)) return this;

    let ref;
    const assert = this._ast(_cool, _idt);
    const assertram = this._ash(_idt);
    const argslength = arguments.length;
    const useKeyword = argslength >= 2 && (_isNumber(key) || _isString(key));
    const undefinedArgs = (key == null) || (useKeyword && val===void 0);
    const single = !useKeyword && (_isObject(key) || _isFn(key));

    if (argslength && !undefinedArgs) {
      if (single) {
        // single pointer select
        isStatic = val;
        key = key instanceof model ? key.get() : (_isFn(key) ? key(this.get()) : key);

        if (
          (ref = key) &&
          !_eq(assert, ref) &&
          modelMultipleVerify(ref, this)
        ) {
          // create history
          const prevData = _clone(assert);

          // save history
          if (this.history) assertram.push(_clone(assert));

          // change data
          this._c(_clone(ref), _idt, (this.change = true));

          // save store
          if (this._s) store.set(this.name, ref);

          if (!isStatic){
            const currentData = _clone(ref);
            modelChangeDetecter(this,currentData,prevData);
          }
        }

      } else {

        if (
          !_eq(_get(assert, key), val) &&
          modelSingleVerify(key, val, this)
        ) {
          // create history
          const prevData = _clone(assert);

          if (this.history) assertram.push(_clone(assert));

          _set(assert, key, _clone(val), (this.change = true));

          if (this._s) store.set(this.name, assert);

          if (!isStatic) {
            const currentData = _clone(assert);
            modelChangeDetecter(this,currentData,prevData,key);
          }
        }

      }
    }

    return this;
  },

  remove(prop, rmStatic) {
    if (modelLockStatus(this)) return this;

    const assert = this._ast(_cool, _idt);
    const assertram = this._ash(_idt);

    if (_isPrim(prop) && prop != null) {
      // create history
      const prevData = _clone(assert);

      if (this.history) assertram.push(_clone(assert));

      _rm(assert, prop);

      if (this._s) store.set(this.name, assert);

      if (!rmStatic) {
        const currentData = _clone(assert);

        modelChangeDetecter(this,currentData,prevData,prop);

        this.emit('remove:' + prop, [currentData]);
      }
    }

    return this;
  },

  clear(clearStatic) {
    if (modelLockStatus(this)) return this;

    const empty = {};

    this.set(empty, clearStatic);

    this.clearStore();

    if (this._ast(_cool, _idt) === empty && !clearStatic)
      this.emit('clear');

    return this;
  },

  clearStore(){
    if (modelLockStatus(this)) return this;

    if(this._s) store.rm(this.name);

    return this;
  },

  push(events){
    if(_isString(events))
      events = events.split(",");

    if(_isArray(events)){
      const data = this.get();

      this.emit(events.join(","), [data,_clone(data)]);
    }

    return this;
  },

  back(isStatic) {
    if (modelLockStatus(this) || !this.history) return this;

    let ram = this._ash(_idt), source;

    if (ram.length && (source = ram.pop())) {
      let prevData = this.get();

      this._c(source, _idt, (this.change = true));

      if (!isStatic){
        let currentData = _clone(source);
        this.emit('back', [currentData,prevData]);
        modelChangeDetecter(this,currentData,prevData);
      }
    }

    return this;
  },

  toJSON() {
    return JSON.stringify(this.get());
  },

  ajax(config = {}) {
    let conf = _extend(
      {
        type: 'get',
        async: true,
        url: this.url || "/",
        param: this.param || this.get(),
        header: this.header,
        success: _noop,
        error: _noop,
      },
      config,
    );

    return modelPipe.call(
      this,
      conf.type,
      conf.url,
      conf.param,
      conf.success,
      conf.error,
      conf.header,
    );
  },

  fetch(param, header) {
    param = param || this.param;

    const actions = [];
    const urls = _isArray(this.url)
      ? this.url
      : _isString(this.url)
        ? [this.url]
        : [];

    const params = _isArray(param) ? param : _isObject(param) ? [param] : [];
    const parse = makeParse((_isFn(this.parse) ? this.parse : defaultParse), this);

    _eachArray(urls, (url, i) =>
      actions.push(
        modelFetch.call(this, 'fetch', url, _isArrayLike(params) ? params[i] : params, header)
      )
    );

    (actions.length === 1 ?
    // single fetch request
    actions[0] :
    // mutilple fetch request
    Promise.all(actions)).then(
    datas => {
      const source = parse(datas);

      if(source != null && _isObject(source)) {
        this.emit('fetch:success', [source]);
        this.set(source);
      }
    },
    error => {
      this.emit('fetch:error', [error]);
      console.error(error);

    }).catch(
    error => {
      this.emit('catch:request:fetch', [error]);
      this.emit('catch', [error]);
      console.error(error);
    });

    return this;
  },

  sync(url, header) {
    if(url && _isObject(url) && _size(url)){
      header = url;
      url = this.url;
    }

    return modelPipe.call(
      this,
      'sync',
      url || this.url,
      this.get(),
      _noop,
      _noop,
      header,
    );
  },

  merge(data, isStatic) {
    if (data instanceof model)
      data = data.get();

    if (data && _isObject(data))
      this.set(_merge(this.get(), data), isStatic);

    return this;
  },

  transTo(md, isStatic, ft) {
    if (_isFn(isStatic)) {
      ft = isStatic;
      isStatic = false;
    }

    let trans = _isFn(ft) ? ft : _cool;

    if (md instanceof model)
      md.set(trans(this.get()), isStatic);

    return this;
  },

  seek(keys, needCombined){
    let res = {};

    if(keys && (_isString(keys) || (_isArray(keys) && _every(keys, _isString)))){
      const resource = modelSeek(this.get(),_isString(keys) ? [keys] : keys);

      res = needCombined ? modelCombined(resource) : resource;
    }

    return res;
  }
};

export default model;
