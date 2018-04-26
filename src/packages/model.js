import MODEL from '../constant/model.define';
import ERRORS from '../constant/errors.define';

import struct from 'ax-struct-js';
import store from './store';
import registerEvent from '../utils/registerEvent';
import modelDefined from '../utils/modelDefined';
import modelMultipleVerify from '../utils/modelMultipleVerify';
import modelSingleVerify from '../utils/modelSingleVerify';
import modelPipe from '../utils/modelPipe';
import {on, off, emit} from '../utils/universalEvent';

const _identify = struct.broken;
const _extend = struct.extend();
const _clone = struct.clone();
const _isString = struct.type('string');
const _isBool = struct.type('bool');
const _isObject = struct.type('object');
const _isArray = struct.type('array');
const _isPrim = struct.type('prim');
const _isFn = struct.type('function');
const _each = struct.each('object');
const _cool = struct.cool();
const _size = struct.size();
const _get = struct.prop('get');
const _set = struct.prop('set');
const _rm = struct.prop('rm');
const _merge = struct.merge();
const _noop = struct.noop();
const _link = struct.link();
const _eq = struct.eq();

// C.Model
// A tool for storing data that uses a model to efficiently manage data structures while keeping the code clear and concise.
// Model has a written convention that the data stored by the model must be a standard JSON object.
// This special data format is because the model only cares about the data structure
// how to store data, how to communicate with the server, and how to persist locally.
const model = function(option = {}) {
  const config = _extend(_clone(MODEL.DEFAULT_OPTION), option);

  if (!_isObject(config.data) || _isArray(config.data))
    throw new Error(ERRORS.MODEL_UNEXPECT);

  const events = config.events;
  const verify = config.verify;

  const identify_existname = _isString(config.name);
  const identify_usestore =
    _isBool(config.store) && config.store && identify_existname;
  let identify_lock = this.isLock = !!config.lock;

  let ram = [];
  let cdata = config.data || {};
  let initlize_data = identify_usestore
    ? store.get(config.name) || cdata
    : cdata;

  _each(
    events,
    registerEvent,
    modelDefined(this, {
      name: identify_existname ? config.name : void 0,

      _ast: (todo, v) => {
        const pass = _isFn(todo) ? todo : _cool;
        return v === _identify ? pass(cdata) : {};
      },

      _asl: v => (v === _identify ? this.isLock : null),

      _asv: v => (v === _identify ? verify : {}),

      _ash: v => (v === _identify ? ram : []),

      _v: !!_size(verify),

      _l: (state, v) =>
        v === _identify ? (this.isLock = identify_lock = !!state) : void 0,

      _c: (newdata, v) => (v === _identify ? (cdata = newdata) : {}),

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

model.prototype = {
  constructor: model,

  on: on,
  off: off,
  emit: emit,

  lock: function() {
    this._l(true, _identify);
    return this.emit('lock');
  },

  unlock: function() {
    this._l(false, _identify);
    return this.emit('unlock');
  },

  get: function(key, by) {
    let data = this._ast(_cool, _identify);

    return _clone(key || key === 0 ? _get(data, key, by) : data);
  },

  set: function(key, val, isStatic) {
    if (this.isLock) return this;

    let ref;
    let assert = this._ast(_cool, _identify);
    let assertram = this._ash(_identify);
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
          assertram.push(_clone(assert));

          this._c(ref, _identify, (this.change = true));

          if (this._s) store.set(this.name, ref);

          if (!isStatic) this.emit('change', [_clone(ref)]);
        }
      } else {
        if (!_eq(_get(assert, key), val) && modelSingleVerify(key, val, this)) {
          // create history
          assertram.push(_clone(assert));

          _set(assert, key, val, (this.change = true));

          if (this._s) store.set(this.name, assert);

          if (!isStatic) {
            this.emit('change', [_clone(assert)]);

            var pkey = key.split('.'),
              tkey = pkey[0],
              tval = {};

            tval[tkey] = _clone(assert[tkey]);

            if (pkey.length > 1) this.emit('change:' + tkey, [tval]);

            this.emit('change:' + key, [tval]);
          }
        }
      }
    }

    return this;
  },

  remove: function(prop, rmStatic) {
    if (this.isLock) return this;

    var assert = this._ast(_cool, _identify),
      assertram = this._ash(_identify);

    if (_isPrim(prop) && prop != null) {
      // create history
      assertram.push(_clone(assert));

      _rm(assert, prop);

      if (this._s) store.set(this.name, assert);

      if (!rmStatic) {
        this.emit('change', [_clone(assert)]);

        var pkey = prop.split('.'),
          tkey = pkey[0],
          tval = {};

        tval[tkey] = _clone(assert[tkey]);

        if (pkey.length > 1) this.emit('change:' + tkey, [tval]);

        this.emit('change:' + prop, [tval]);
        this.emit('remove:' + prop);
      }
    }

    return this;
  },

  clear: function(clearStatic) {
    let empty = {};

    this.set(empty, clearStatic);

    if (this._ast(_cool, _identify) === empty && !clearStatic)
      this.emit('clear');

    return this;
  },

  back: function(isStatic) {
    if (this._asl(_identify) === void 0) return this;

    let ram = this._ash(_identify),
      source;

    if (ram.length && (source = ram.pop())) {
      this._c(source, _identify, (this.change = true));

      if (!isStatic) this.emit('change,back', [source]);
    }

    return this;
  },

  pipe: function(config) {
    if (_isObject(config)) {
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
    }

    return this;
  },

  send: function(url, header) {
    if (_isObject(url)) {
      header = url;
      url = null;
    }

    return this.pipe({
      type: 'send',
      url: url || this.url,
      param: this.get(),
      header: header,
    });
  },

  fetch: function(param, byFilter, header) {
    if (_isFn(param)) {
      header = byFilter;
      byFilter = param;
      param = {};
    }

    return this.pipe({
      type: 'fetch',
      url: this.url,
      param: this.get(),
      success: _link(
        _isFn(byFilter) ? byFilter : JSON.parse,
        this.set.bind(this),
      ),
      header: header,
    });
  },

  sync: function(url, header) {
    if (_isObject(url)) {
      header = url;
      url = null;
    }

    return this.pipe({
      type: 'sync',
      url: url || this.url,
      param: this.get(),
      header: header,
    });
  },

  toJSON: function() {
    return JSON.stringify(this.get());
  },
};

export default model;
