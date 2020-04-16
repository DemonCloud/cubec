//
// linkType:
//   before
//   runtime
//   solve
//   catch
import MODEL from '../../constant/model.define';
import {
  _has,
  _isString,
  _isFn,
  _idt,
  _slice,
  _isArrayLike,
  _extend,
  _map,
  _createPrivate,

  broken_array,
  broken_object
} from '../usestruct';
import defined from '../defined';

const {
  ALLOWLINKTYPES,
  ASYNCLINKAPIS,
  LINKTYPESPROXYMAPPING
} = MODEL;

const modelLinkRecords = {};

// register link function
const registerLinkProto = function(modelAPI, linkProto, linkType, linkFunction){
  // register coll
  const connect = function(){
    const linkQueue = this[LINKTYPESPROXYMAPPING[linkType]](_idt);
    linkQueue.push(linkFunction.apply(this, arguments));
    return this;
  };

  connect.adaptor = modelAPI;
  connect.type = linkType;

  // create new link block
  const protos = modelLinkRecords[modelAPI] = modelLinkRecords[modelAPI] || {};

  protos[linkProto] = connect;

  return [linkType, connect];
};

const registerNextRuntime = function(func){ return this.next("runtime", func); };
const registerNextBefore = function(func){ return this.next("before", func); };
const registerNextSolve = function(func){ return this.next("solve", func); };
const registerNextCatch = function(func){ return this.next("catch", func); };
const registerUse = function(linkReturn){
  if(linkReturn){
    const type = linkReturn[0];
    const coll = linkReturn[1];
    const collArgs = _slice(arguments, 1); // bounder option and arguments
    this.next(type, coll.apply(this, collArgs));
  }
  return this;
};

// brefore arguments caller
const linkBeforeCaller = function(beforeQueue, args){
  let l = beforeQueue.length;
  let i = 0;
  let res = args;

  for(; i<l; i++){
    const link = beforeQueue[i];
    res = link.apply(link.core, res);

    if(res == null) break;
    else if(!_isArrayLike(res)) res = [res];
  }

  return res;
};

// runtime and solve caller
export const linkCaller = function(queue, args){
  let l = queue.length;
  let i = 0;
  let res = args;

  for(; i<l; i++){
    const link = queue[i];
    res = link.apply(link.core, res);

    if(res == null) break;
    else if(i!==(l-1) && !_isArrayLike(res)) res = [res];
  }

  return res;
};

// catch caller
export const linkCatchCaller = function(catchQueue, args){
  let l = catchQueue.length;
  let i = 0;
  let res = args || broken_array;

  for(; i<l; i++){
    const link = catchQueue[i];
    res = link.apply(link.core, res);

    if(res == null) break;
    else if(i !== (l-1) && !_isArrayLike(res)) res = [res];
  }

  return ( res === args || res === broken_array ) ? null : res;
};

export const createLink = function(model, modelAPI, b, r, s, c){
  const getLinkRecords = modelLinkRecords[modelAPI];

  const linkCatch = c ? _slice(c) : [];
  const linkSolve = s ? _slice(s) : [];
  const linkBefore = b ? _slice(b) : [];
  const linkRuntime = r ? _slice(r) : [];
  const linkMapping = {
    solve: linkSolve,
    catch: linkCatch,
    before: linkBefore,
    runtime: linkRuntime,
  };

  const linkInstance = function(){
    const isAsync = ASYNCLINKAPIS[modelAPI];
    const useCatch = !!linkCatch.length;
    const useSolve = !!linkSolve.length;
    const useBefore = !!linkBefore.length;
    const useRuntime = !!linkRuntime.length;

    let args = _slice(arguments);

    let result;

    // exist linkBefore with arguments
    if(useBefore) args = linkBeforeCaller(linkBefore, args);

    if(args == null){
      if(useCatch) result = linkCatchCaller(linkCatch, args);
      // async api interrupted
      return isAsync ? [ result ] : result;
    }

    // check is async api
    if(isAsync){
      // async api
      result = model[modelAPI].apply(model, args.concat([
        _idt,
        useRuntime ? linkRuntime : null,
        useSolve ? linkSolve : null ,
        useCatch ? linkCatch : null
      ]));

      // fallback Promise API for internal async as [update, request]
      return result;
    }

    result = model[modelAPI].apply(model, args);

    if(useSolve) result = linkCaller(linkSolve, [result]); // solve

    if(result == null && useCatch) return linkCatchCaller(linkCatch);

    return result;
  };

  // use coll
  const makeInstanceLinkPrototype = _map(getLinkRecords, function(connect){
    const adapter = connect.bind(linkInstance);
    adapter.adaptor = connect.adaptor;
    adapter.type = connect.type;
    adapter.core = linkInstance;
    return adapter;
  });

  // create prototype
  defined(linkInstance, _extend(makeInstanceLinkPrototype, {
    _s: _createPrivate(linkSolve, broken_array),
    _c: _createPrivate(linkCatch, broken_array),
    _b: _createPrivate(linkBefore, broken_array),
    _r: _createPrivate(linkRuntime, broken_array),
    _m: _createPrivate(model, broken_object),
    _a: modelAPI, // link adapter name

    use: registerUse,
    nextBefore: registerNextBefore,
    nextRuntime: registerNextRuntime,
    nextSolve: registerNextSolve,
    nextCatch: registerNextCatch,
    next: function(type, func){
      if(type &&
        _isString(type) &&
        linkMapping[type] &&
        _isFn(func))
        linkMapping[type].push(func);
      return this;
    },

    // extend as new linker
    extend(){
      return createLink(model, modelAPI, linkBefore, linkRuntime, linkSolve, linkCatch);
    },

  }));

  return linkInstance;
};

// record
// globalLink(modelAPI, linkProto, linkType, linkFunction);
// privateLink(linkType[modelAPI], linkFunction[linkProto]);
export const registerLink = function(modelAPI, linkProto, linkType, linkFunction){
  let use;

  const createGlobalLink =
    arguments.length >= 4 &&
    _isString(modelAPI) &&
    _isString(linkProto) &&
    _isString(linkType) &&
    _isFn(linkFunction);

  const createPrivateLink =
    arguments.length === 2 &&
    _isString(modelAPI) &&
    _isFn(linkProto);

  if(createGlobalLink){
    // runtime path
    if(!_has(ALLOWLINKTYPES, linkType))
      throw new Error(`[cubec model] [link] [${linkType}] linkType is not allow for register by linkSystem`);
    else
      use = registerLinkProto(modelAPI, linkProto, linkType, linkFunction);

  }else if(createPrivateLink){
    use = [modelAPI, linkProto];

  }else{
    console.warn("[cubec model] link register linkSystem not current format arguments", arguments);
  }

  return use;
};

