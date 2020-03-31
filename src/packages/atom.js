// const at = cubec.atom(
//   [model, model, model]
// );

// atom.toChunk();
// atom.toData();
// atom.all();
// atom.pop(modelNames);
// atom.use(modelNames, ignores);

import ATOM from '../constant/atom.define';
// import ERRORS from '../constant/errors.define';
import defined from '../utils/defined';
import filters from '../utils/atom/filters';
import model from './model';
import {on, off, emit} from '../utils/universalEvent';
import {
  _extend,
  _clone,
  _slice,
  _has,
  _index,
  _isArray,
  _isBool,
  _isFn,
  _define,
  _eachArray,
  _map,
  _idt,
  _noop,
  _createPrivate,
  broken_array,
  broken_object,
} from '../utils/usestruct';

let amid = 0;
const namePrefix = "__at";

const createPushEmitter = function(){
  return emit.call(this, "change", this.toChunk());
};

const atom = function(options=broken_object){
  const config = _extend(_clone(ATOM.DEFAULT_OPTION), options);

  const list = [];
  const listenList = [];
  const push = createPushEmitter.bind(this);

  defined(this, {
    name: config.name,
    _mid: namePrefix+amid++,
    _asl: _createPrivate(list, broken_array),
    _asi: _createPrivate(listenList, broken_array),
    _asp: _createPrivate(push, _noop),
  });

  _define(this, "length", {
    set: ()=>list.length,
    get: ()=>list.length,
    enumerable: false,
    configurable: false,
  });

  _extend(this, config, ATOM.IGNORE_KEYWORDS);

  this.use(config.use, config.ignore, true);
};

atom.prototype = {
  constructor: atom,

  all(){
    return _slice(this._asl(_idt));
  },

  use(models, ignores, isStatic){
    if(_isBool(ignores)){
      isStatic = ignores;
      ignores = [];
    }

    const push = this._asp(_idt);
    const list = this._asl(_idt);
    const listenList = this._asi(_idt);
    const useModels = filters(
      atom,
      _isArray(models) ? models : [models],
      list
    );
    const useIgnores = filters(
      atom,
      _isArray(ignores) ? ignores : [ignores],
      useModels,
      true
    );

    if(useModels.length){
      list.push.apply(list, useModels);

      const listenModels = useModels.filter(function(m){
        const allowed = !_has(useIgnores, m);

        if(allowed){
          if(m instanceof model)
            m.on("change", push);
          else if(m instanceof atom)
            m.subscribe(push);
        }

        return allowed;
      });

      listenList.push.apply(listenList, listenModels);

      if(!isStatic) push();

    }

    return this;
  },

  pop(models, isStatic=false){
    const push = this._asp(_idt);
    const list = this._asl(_idt);
    const listenList = this._asi(_idt);
    const useModels = filters(
      atom,
      _isArray(models) ? models : [models],
      list,
      true
    );

    if(useModels.length){
      useModels.forEach(function(m){
        const findInList = _index(list, m);
        const findInListenList = _index(listenList, m);

        list.splice(findInList, 1);

        if(findInListenList != null){
          if(m instanceof model)
            m.off("change", push);
          else if(m instanceof atom)
            m.unsubscribe(push);

          listenList.splice(findInListenList, 1);
        }
      });

      if(!isStatic) push();
    }

    return this;
  },

  subscribe(fn){
    if(_isFn(fn))
      on.call(this, "change", fn);
    return this;
  },

  unsubscribe(fn){
    if(_isFn(fn))
      off.call(this, "change", fn);
    return this;
  },

  get(){
    return this.toChunk();
  },

  toChunk(){
    const res = {};

    _eachArray(this.all(), function(m){
      res[m.name || m._mid] = m.get();
    });

    return res;
  },

  toData(){
    return _map(this.all(), function(m){
      return m.get();
    });
  }

};

export default atom;
