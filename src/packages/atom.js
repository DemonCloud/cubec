import ATOM from '../constant/atom.define';
import ERRORS from '../constant/errors.define';

import struct from '../lib/struct';
import store from './store';
import model from './model';
import {on, off, emit} from '../utils/universalEvent';
import defined from '../utils/defined';
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
const _isFn = struct.type('function');
const _isString = struct.type('string');
const _isBool = struct.type('boolean');
const _isArray = struct.type('array');
const _isArrayLike = struct.type("arraylike");
const _cool = struct.cool();
const _every = struct.every();
const _each = struct.each('array');
const _map = struct.map();
const _size = struct.size();
const _identify = struct.broken;
const _noop = struct.noop();
const _isModel = function(m){ return m instanceof model; };

let atid = 0;

const outAtomList = function(LIST,model,isConnecty,transmit){
  const idx = _index(LIST, _isString(model) ? atomAssertModel(model) : model);

  if(_isNumber(idx)){
    let m = LIST.splice(idx, 1).pop();

    if(_isModel(m) && isConnecty)
      m.off("change", transmit);
  }
};

const atom = function(option = {}) {
  const config = _extend(_clone(ATOM.DEFAULT_OPTION), option);
  const _transmit = function(){ this.transmit(); }.bind(this);
  const _isConnectivity = !!config.connect;
  let LIST = [];

  defined(this, {
    _mid: "_at"+atid++,
    _assert : (todo, v) => (v === _identify ? todo(LIST) : []),
    _transmit : (v) => (v === _identify ? _transmit : _noop),
    _connecty : (v) => (v === _identify ? _isConnectivity : null)
  });

  _extend(this.use(config.use,true), config, ATOM.IGNORE_KEYWORDS);
};

const stom = function(prevatom, list = [], connect) {
  let c = new atom({ use: list, connect });
  c.back = () => prevatom;

  return c;
};

atom.prototype = {
  constructor: atom,

  all: function() {
    return this._assert(_slice, _identify);
  },

  use: function(list, isStatic) {
    const cLIST = this._assert(_cool,_identify);
    const transmit = this._transmit(_identify);
    const isConnecty = this._connecty(_identify);
    const prevLen = cLIST.length;

    // single model use
    if(_isModel(list) && !_has(cLIST,list)){
      cLIST.push(list);
      if(isConnecty) list.on("change",transmit);

    // mutilp models use
    }else if(_isArrayLike(list) && _every(list,_isModel)){
      _each(list, function(M){
        if(!_has(cLIST,M)){
          cLIST.push(M);
          if(isConnecty) M.on("change",transmit);
        }
      });

    // model name use
    }else if(_isString(list) || (_isArray(list) && _every(list, _isString))){
      atomAssertMake.call(this, list, function(LIST, name, M) {
        if ((M = store.ram[name]) && !_has(LIST, M)){
          LIST.push(M);
          if(isConnecty) M.on("change",transmit);
        }
      });
    }

    if(prevLen !== cLIST.length && !isStatic){
      this.transmit();
    }

    return this;
  },

  transmit: function(args=[]){
    let transData = this.toChunk();

    if(_isString(this.preset) && this.preset){
      transData = { [this.preset] : transData };
    }

    return emit.call(this,"change",[transData,...args]);
  },

  out: function(list,isStatic) {
    const cLIST = this._assert(_cool,_identify);
    const isConnecty = this._connecty(_identify);
    const transmit = this._transmit(_identify);
    const prevLen = cLIST.length;

    // single model out
    if(_isModel(list) && !_has(cLIST,list)){
      outAtomList(cLIST, list, isConnecty, transmit);

    // mutilp models out
    }else if(_isArrayLike(list) && _every(list,_isModel)){
      _each(list, function(M){
        outAtomList(cLIST, M, isConnecty, transmit);
      });

    // model name out
    }else if(_isString(list) || (_isArray(list) && _every(list, _isString))){
      atomAssertMake.call(this, list, function(LIST, name) {
        outAtomList(LIST, name, isConnecty, transmit);
      });
    }

    if(prevLen !== cLIST.length && !isStatic){
      this.transmit();
    }

    return this;
  },

  getModelByNames: function(name) {
    let res;

    if (name == null) res = this.all();
    else if (_isString(name)) res = _one(this.all(), atomAssertModel(name));
    else if (_isArray(name) && _size(name)) {
      res = _map(name, n => this.getModelByNames(n));
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

    let ma = this.getModelByNames(a);
    let mb = this.getModelByNames(b);

    if (!ma || !mb) {
      throw new Error(ERRORS.ATOM_MISSING_MODELINSTANCE);
    }

    let tmp = ma.get();
    ma.set(mb.get(), swapStatic);
    mb.set(tmp, swapStatic);

    return this;
  },

  select: function(match, connect=false) {
    return stom(this, atomAssertMatch(this.all(), match), connect);
  },

  subscribe: function(fn){
    if(_isFn(fn))
      on.call(this,"change",fn);
    return this;
  },

  unsubscribe: function(fn){
    if(_isBool(fn) && fn){
      off.call(this,"change");
    }else if(_isFn(fn)){
      off.call(this,"change",fn);
    }

    return this;
  },

  reset: function(isStatic=true){
    this.unsubscribe(true);
    this.out(this.all(), isStatic);
    return this;
  },

  toData: function() {
    return _map(this._assert(_cool, _identify), m => m.get());
  },

  toChunk: function() {
    let res = {};

    this.of(m => {
      if(m.name) res[m.name] = m.get();
    });

    return res;
  },
};

export default atom;
