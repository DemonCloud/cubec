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
  _isString,
  _isBool,
  _isObject,
  _isArray,
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
  _slice,
  _not,
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

function defaultParse() {
  let args = _slice(arguments);
  let res = {};

  try {
    if (args.length > 1) _eachArray(args, data => (res = _merge(res, data)));
    else res = args[0];
  } catch (error) {
    console.error(ERRORS.MODEL_DEFAULT_PARSE);
    this.emit('catch', [error]);
    return false;
  }

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

  if (identify_existname) {
    store.ram[this.name] = this;
  }

  _extend(this, config, MODEL.IGNORE_KEYWORDS)
    .emit('init')
    .off('init');
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
    off.apply(this,arguments);
    let changeDetect = this._asc(_idt);

    if(type &&
      _isString(type) &&
      changeReg.test(type) &&
      changeDetect.indexOf(type)>=-1 &&
      !_hasEvent(this, type)){
      _not(changeDetect, type);
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
    let data = this._ast(_cool, _idt);

    return _clone(key || key === 0 ? _get(data, key, by) : data);
  },

  set(key, val, isStatic) {
    if (modelLockStatus(this)) return this;

    let ref;
    let assert = this._ast(_cool, _idt);
    let assertram = this._ash(_idt);
    let argslength = arguments.length;
    let single = !_isPrim(key) && _isObject(key);

    if (argslength) {
      if (single) {
        // single pointer select
        isStatic = val;

        if (
          (ref = key) &&
          !_eq(assert, ref) &&
          modelMultipleVerify(ref, this)
        ) {
          // create history
          let prevData = _clone(assert);

          if (this.history) assertram.push(_clone(assert));
          // change data
          this._c(ref, _idt, (this.change = true));
          if (this._s) store.set(this.name, ref);

          if (!isStatic){
            let currentData = _clone(ref);
            modelChangeDetecter(this,currentData,prevData);
          }
        }
      } else {
        if (
          !_eq(_get(assert, key), val) &&
          modelSingleVerify(key, val, this)
        ) {
          // create history
          let prevData = _clone(assert);
          if (this.history) assertram.push(_clone(assert));
          _set(assert, key, val, (this.change = true));
          if (this._s) store.set(this.name, assert);


          if (!isStatic) {
            let currentData = _clone(assert);
            modelChangeDetecter(this,currentData,prevData,key);
          }
        }
      }
    }

    return this;
  },

  remove(prop, rmStatic) {
    if (modelLockStatus(this)) return this;

    let assert = this._ast(_cool, _idt),
      assertram = this._ash(_idt);

    if (_isPrim(prop) && prop != null) {
      // create history
      let prevData = _clone(assert);
      if (this.history) assertram.push(_clone(assert));
      _rm(assert, prop);
      if (this._s) store.set(this.name, assert);

      if (!rmStatic) {
        let currentData = _clone(assert);

        this.emit('remove:' + prop);
        modelChangeDetecter(this,currentData,prevData,prop);
      }
    }

    return this;
  },

  clear(clearStatic) {
    let empty = {};

    this.set(empty, clearStatic);

    if (this._ast(_cool, _idt) === empty && !clearStatic)
      this.emit('clear');

    return this;
  },

  push(events){
    if(_isString(events)){
      events = events.split(",");
    }

    if(_isArray(events)){
      this.emit(events.join(","),[this.get()]);
    }

    return this;
  },

  back(isStatic) {
    if (modelLockStatus(this) || !this.history) return this;

    let ram = this._ash(_idt),
      source;

    if (ram.length && (source = ram.pop())) {
      let prevData = this.get();

      this._c(source, _idt, (this.change = true));

      if (!isStatic){
        let currentData = _clone(source);
        this.emit('back', [currentData]);
        modelChangeDetecter(this,currentData,prevData);
      }
    }

    return this;
  },

  toJSON() {
    return JSON.stringify(this.get());
  },

  ajax(config = {}) {
    let conf = _merge(
      {
        type: 'get',
        async: true,
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

    let actions = [];
    let urls = _isArray(this.url)
      ? this.url
      : _isString(this.url)
        ? [this.url]
        : [];

    let params = _isArray(param) ? param : _isObject(param) ? [param] : [];

    let parse = this.parse || defaultParse;

    _eachArray(urls, (url, i) => {
      actions.push(modelFetch.call(this, 'fetch', url, params[i], header));
    });

    if (actions.length === 1) {
      actions[0]
        .then(
          datas => {
            let source = parse.call(this, datas);

            if (source) {
              this.emit('fetch:success', [source]);
              this.set(source);
            }
          },
          error => {
            this.emit('fetch:error', [error]);
            console.error(error);
          },
        )
        .catch(error => {
          this.emit('catch', [error]);
          console.error(error);
        });
    } else if (actions.length > 1) {
      Promise.all(actions)
        .then(
          datas => {
            let source = parse.apply(this, datas);

            if (source) {
              this.emit('fetch:success', [source]);
              this.set(source);
            }
          },
          error => {
            this.emit('fetch:error', [error]);
            console.error(error);
          },
        )
        .catch(error => {
          this.emit('catch', [error]);
          console.error(error);
        });
    }

    return this;
  },

  sync(url, header) {
    if (_isString(url)) {
      return modelPipe.call(
        this,
        'sync',
        url,
        this.get(),
        _noop,
        _noop,
        header,
      );
    }

    return this;
  },

  merge(data, isStatic) {
    if (data instanceof model) {
      data = data.get();
    }

    if (_isObject(data) && data != null) {
      this.set(_merge(this.get(), data), isStatic);
    }

    return this;
  },

  transTo(md, isStatic, ft) {
    if (_isFn(isStatic)) {
      ft = isStatic;
      isStatic = false;
    }

    let trans = _isFn(ft) ? ft : _cool;

    if (md instanceof model) {
      md.set(trans(this.get()), isStatic);
    }

    return this;
  },

  seek(keys, needCombined){

    if(keys){

      if(_isString(keys)){
        keys = [keys];
      }

      if(_isArray(keys)){
        const resource = modelSeek(this.get(),keys);
        return needCombined ? modelCombined(resource) : resource;
      }
    }

    return {};
  }
};

export default model;
