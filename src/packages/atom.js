import ATOM from '../constant/atom.define';
import ERRORS from '../constant/errors.define';

import struct from '../lib/struct';
import store from './store';
import {on, off, emit} from '../utils/universalEvent';
import atomAssertMake from '../utils/atomAssertMake';
import atomAssertModel from '../utils/atomAssertModel';
import atomAssertMatch from '../utils/atomAssertMatch';
import atomTargetWith from '../utils/atomTargetWith';

const _extend = struct.extend();
const _clone = struct.clone();
const _slice = struct.slice();
const _has = struct.has();
const _index = struct.index();
const _one = struct.index('one');
const _isNumber = struct.type('number');
const _isFn = struct.type('func');
const _isString = struct.type('string');
const _isArray = struct.type('array');
const _cool = struct.cool();
const _each = struct.each('array');
const _map = struct.map();
const _size = struct.size();
const _identify = struct.broken;

const atom = function(option = {}) {
  const config = _extend(_clone(ATOM.DEFAULT_OPTION), option);
  let LIST = [];

  this._assert = (todo, v) => (v === _identify ? todo(LIST) : []);

  _extend(this.use(config.use), config, ATOM.IGNORE_KEYWORDS);
};

const stom = function(atom, list = []) {
  let c = atom({use: list});

  c.back = () => atom;

  return c;
};

atom.prototype = {
  constructor: atom,

  on: on,
  off: off,
  emit: emit,

  all: function() {
    return this._assert(_slice, _identify);
  },

  use: function(list) {
    return atomAssertMake.call(this, list, function(LIST, name, M) {
      if ((M = store.ram[name]) && !_has(LIST, M)) LIST.push(M);
    });
  },

  out: function(list) {
    return atomAssertMake.call(this, list, function(LIST, name) {
      const finder = _index(LIST, atomAssertModel(name));
      if (_isNumber(finder)) LIST.splice(finder, 1);
    });
  },

  get: function(name) {
    let res;

    if (name === void 0) res = this.all();
    else if (_isString(name)) res = _one(this.all(), atomAssertModel(name));
    else if (_isArray(name) && _size(name)) {
      res = _map(name, n => this.get(n));
      if (_size(res) === 1) res = res[0];
    }

    return res;
  },

  of: function(func, args) {
    _each(this.all(), _isFn(func) ? func : atomTargetWith(func, args));

    return this;
  },

  swap: function(a, b, swapStatic) {
    if (!a || !b || !_isString(a) || !_isString(b))
      throw new Error(ERRORS.ATOM_UNDEFINED_MODELNAME);

    let ma = this.get(a);
    let mb = this.get(b);

    if (!ma || !mb) {
      throw new Error(ERRORS.ATOM_MISSING_MODELINSTANCE);
    }

    let tmp = ma.get();
    ma.set(mb.get(), swapStatic);
    mb.set(tmp, swapStatic);

    return this;
  },

  select: function(match) {
    return stom(this, atomAssertMatch(this.all(), match));
  },

  toData: function() {
    return _map(this._assert(_cool, _identify), m => m.get());
  },

  toChunk: function() {
    let res = {};
    this.of(m => (res[m.name] = m.get()));
    return res;
  },
};

export default atom;
