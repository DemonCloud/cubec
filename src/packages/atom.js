// const at = cubec.atom(
//   use: [model, model, model, atom]
//   ignore: []
// );
// atom.toChunk(path | [paths...] | filterFunc(dataChunk));
// atom.all();
// atom.pop(modelNames|[modelNames...]);
// atom.use(modelNames|[modelNames...], ignores|[ignores...]);

import ATOM from '../constant/atom.define';
// import ERRORS from '../constant/errors.define';
import defined from '../utils/defined';
import filters from '../utils/atom/filters';
import chunkPathParser from '../utils/atom/chunkPathParser';
import { on, off, emit } from '../utils/universalEvent';
import {
  _extend,
  _clone,
  _slice,
  _has,
  _index,
  _isArray,
  _trim,
  _isBool,
  _isString,
  _isFn,
  _define,
  _eachArray,
  _every,
  _idt,
  _noop,
  _createPrivate,

  broken_array,
  broken_object,

  eventChange,
} from '../utils/usestruct';

let amid = 0;
const namePrefix = "__at";

const createPushEmitter = function(){
  return emit.call(this, eventChange, this.toChunk());
};

const atom = function(options=broken_object){
  const config = _extend(_clone(ATOM.DEFAULT_OPTION), options);

  const list = [];
  const listenList = [];
  const push = createPushEmitter.bind(this);
  const getLength = function(){ return list.length; };

  defined(this, {
    name: config.name,
    _mid: namePrefix+amid++,
    _asl: _createPrivate(list, broken_array),
    _asi: _createPrivate(listenList, broken_array),
    _asp: _createPrivate(push, _noop),
  });

  _define(this, "length", {
    set: getLength,
    get: getLength,
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

        if(allowed)
          on.call(m, eventChange, push);

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
          off.call(m, eventChange, push);
          listenList.splice(findInListenList, 1);
        }
      });

      if(!isStatic) push();
    }

    return this;
  },

  subscribe(fn){
    if(_isFn(fn)) on.call(this, eventChange, fn);
    return this;
  },

  unsubscribe(fn){
    if(_isFn(fn)) off.call(this, eventChange, fn);
    return this;
  },

  // alias with toChunk() with arguments;
  get(path){
    return this.toChunk(path);
  },

  toChunk(path){
    const res = {};
    const all = this.all();

    // get path data
    if(path && _isString(path)){

      const parse = chunkPathParser(_trim(path));

      const chunkNameSpace = parse[0];
      const chunkDeepPath = parse[1];

      if(chunkNameSpace){
        let getChild;

        for(let i=0; i<all.length; i++){
          const child = all[i];

          if(child.name === chunkNameSpace || child._mid === chunkNameSpace){
            getChild = child;
            break;
          }
        }

        if(getChild)
          return getChild.get(chunkDeepPath);
      }

      return res;

    }else if(_isArray(path) && _every(path, _isString)){

      // list for path
      _eachArray(path, function(childPath){
        const parse = chunkPathParser(_trim(childPath));
        const chunkNameSpace = parse[0];

        if(chunkNameSpace)
          res[chunkNameSpace] = this.toChunk(childPath);
      }, this);

      return res;
    }

    // chunk all data
    _eachArray(this.all(), function(m){
      res[m.name || m._mid] = m.get();
    });

    return _isFn(path) ? path(res) : res;
  },

};

export default atom;

