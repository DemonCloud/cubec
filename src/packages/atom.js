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
  _noop
} from '../utils/usestruct';

let amid = 0;
const namePrefix = "__at";

const atom = function(options){
  const config = _extend(_clone(ATOM.DEFAULT_OPTION), options);
  const push = ()=>emit.call(this, "change", this.toChunk());
  const list = [];
  const listenList = [];

  defined(this, {
    name: config.name,
    _mid: namePrefix+amid++,
    _asl: v => (v === _idt ? list : []),
    _asi: v => (v === _idt ? listenList : []),
    _asp: v => (v === _idt ? push : _noop),
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

    const _atom = this;
    const push = _atom._asp(_idt);
    const list = _atom._asl(_idt);
    const listenList = _atom._asi(_idt);
    const useModels = filters(_isArray(models) ? models : [models], list);
    const useIgnores = filters(_isArray(ignores) ? ignores : [ignores], useModels, true);

    if(useModels.length){
      list.push.apply(list, useModels);

      const listenModels = useModels.filter(function(model){
        const allow = !_has(useIgnores, model);
        if(allow) model.on("change", push);
        return allow;
      });

      listenList.push.apply(listenList, listenModels);

      if(!isStatic) push();
    }

    return this;
  },

  pop(models, isStatic=false){
    const _atom = this;
    const push = _atom._asp(_idt);
    const list = _atom._asl(_idt);
    const listenList = _atom._asi(_idt);
    const useModels = filters(_isArray(models) ? models : [models], list, true);

    if(useModels.length){
      useModels.forEach(function(model){
        const findInList = _index(list, model);
        const findInListenList = _index(listenList, model);

        list.splice(findInList, 1);
        if(findInListenList != null){
          model.off("change", push);
          listenList.splice(findInListenList, 1);
        }
      });

      if(!isStatic) push();
    }

    return this;
  },

  subscribe(fn){
    if(_isFn(fn)) on.call(this, "change", fn);
    return this;
  },

  unsubscribe(fn){
    if(_isFn(fn)) off.call(this, "change", fn);
    return this;
  },

  toChunk(){
    const res = {};
    _eachArray(this.all(), function(model){
      res[model.name || model._mid] = model.get();
    });

    return res;
  },

  toData(){
    return _map(this.all(), function(model){
      return model.get();
    });
  }

};

export default atom;
