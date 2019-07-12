import ATOM from '../constant/atom.define';
import ERRORS from '../constant/errors.define';

import store from '../lib/store';
import model from './model';
import defined from '../utils/defined';
import {on, off, emit} from '../utils/universalEvent';
import atomAssertMake from '../utils/atom/assertMake';
import atomAssertModel from '../utils/atom/assertModel';
import atomAssertMatch from '../utils/atom/assertMatch';
import atomTargetWith from '../utils/atom/targetWith';
import {
  _extend,
  _clone,
  _slice,
  _has,
  _index,
  _one,
  _isArrayLike,
  _isString,
  _isNumber,
  _isArray,
  _isBool,
  _isFn,
  _cool,
  _every,
  _eachArray,
  _map,
  _size,
  _idt,
  _ayc,
  _get,
  _noop
} from '../utils/usestruct';

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

const activeFetchSign = function(number){
  return number === 1;
};

const atom = function(option = {}) {
  const config = _extend(_clone(ATOM.DEFAULT_OPTION), option);
  const _isConnectivity = !!config.connect;
  const _transmit = function(){ this.transmit(); }.bind(this);

  let LIST = [];
  let inFetchAll = false;

  defined(this, {
    _mid: "_at"+atid++,
    _assert : (todo, v) => v === _idt ? todo(LIST) : [],
    _transmit : v => v === _idt ? _transmit : _noop,
    _connecty : v => v === _idt ? _isConnectivity : null,
    _inFetchAll : v => v === _idt ? inFetchAll : null,
    _setFetchState: (state, v) => v==_idt ? (inFetchAll=!!state) : null
  });

  _extend(this.use(config.use,true), config, ATOM.IGNORE_KEYWORDS);
};

const stom = function(prevatom, list = [], connect) {
  let c = new atom(
    prevatom.preset ?
    { use: list, connect } :
    { use: list, connect, perset: prevatom.perset }
  );

  c.back = () => prevatom;

  return c;
};

atom.prototype = {
  constructor: atom,

  all() {
    return this._assert(_slice, _idt);
  },

  use(list, isStatic) {
    const cLIST = this._assert(_cool,_idt);
    const transmit = this._transmit(_idt);
    const isConnecty = this._connecty(_idt);
    const prevLen = cLIST.length;

    // single model use
    if(_isModel(list) && !_has(cLIST,list)){
      cLIST.push(list);
      if(isConnecty) list.on("change",transmit);

    // mutilp models use
    }else if(_isArrayLike(list) && _every(list,_isModel)){
      _eachArray(list, function(M){
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

  transmit(args=[]) {
    const _inFetchAll = this._inFetchAll(_idt);

    if(!_inFetchAll){
      let transData = this.toChunk();

      if(this.preset && _isString(this.preset))
        transData = { [this.preset] : transData };

      return emit.call(this,"change",[transData,...args]);
    }

    return this;
  },

  out(list,isStatic) {
    const cLIST = this._assert(_cool,_idt);
    const isConnecty = this._connecty(_idt);
    const transmit = this._transmit(_idt);
    const prevLen = cLIST.length;

    // single model out
    if(_isModel(list) && _has(cLIST,list)){
      outAtomList(cLIST, list, isConnecty, transmit);

    // mutilp models out
    }else if(_isArrayLike(list) && _every(list,_isModel)){
      _eachArray(list, function(M){
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

  getModelByNames(name) {
    let res;

    if (name == null) res = this.all();
    else if (_isString(name)) res = _one(this.all(), atomAssertModel(name));
    else if (_isArray(name) && _size(name)) {
      res = _map(name, n => this.getModelByNames(n));
      if (_size(res) === 1) res = res[0];
    }

    return res;
  },

  of(func, args) {
    _eachArray(this.all(), _isFn(func) ? func : atomTargetWith(func, args));

    return this;
  },

  select(match, connect=false) {
    return stom(this, atomAssertMatch(this.all(), match), connect, this);
  },

  subscribe(fn) {
    if(_isFn(fn))
      on.call(this,"change",fn);
    return this;
  },

  unsubscribe(fn) {
    if(_isBool(fn) && fn){
      off.call(this,"change");
    }else if(_isFn(fn)){
      off.call(this,"change",fn);
    }

    return this;
  },

  reset(isStatic=true) {
    this.unsubscribe(true);
    this.out(this.all(), isStatic);
    return this;
  },

  fetchAll(models, params, header){
    if((!_isString(models) && !_isArrayLike(models)) ||
       (_isArrayLike(models) && !_every(models, _isString))){
      header = params;
      params = models;
      models = this.all().map(model=>(model.name || model._mid));
    }

    if(_isString(models))
      models = [models];

    const activeModels = this.all().filter(m=>{
      const name = m.name || m._mid;
      return _has(models, name) && (_isString(m.url) || (_isArray(m.url) && _every(m.url, _isString)));
    });

    // include fetchModel
    if(activeModels.length){
      let sign = [];

      this._setFetchState(true, _idt);

      _eachArray(activeModels, m=>{
        const index = sign.length;

        const trigger = ()=>{
          sign[index] = 1;

          m.off("fetch:error", trigger);
          m.off("fetch:success", trigger);

          if(_every(sign, activeFetchSign)){
            _ayc(()=>{
              this._setFetchState(false, _idt);
              this.transmit();
            });
          }
        };

        // push sign
        sign.push(0);

        m.on("fetch:error", trigger);
        m.on("fetch:success", trigger);
        m.fetch(params ? _get(params, (m.name || m._mid)) : {}, header);
      });

    }

    return this;
  },

  toData() {
    return _map(this._assert(_cool, _idt), m => m.get());
  },

  toChunk() {
    let res = {};
    this.of(m => res[m.name || m._mid] = m.get());

    return res;
  },
};

export default atom;
