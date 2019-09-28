//
// linkType:
//   before
//   runtime
//   solve
//   catch
import {
  _has,
  _isString,
  _isFn,
  _idt,
  _slice,
  _isArrayLike,
  _extend,
  _map,
} from '../usestruct';
import defined from '../defined';
import MODEL from '../../constant/model.define';

const {
  LINKPERSET,
  ALLOWLINKAPIS,
  ALLOWLINKTYPES,
  ALLOWLINKTYPESWITHRUNTIME,
  ASYNCLINKAPIS,
  LINKTYPESPROXYMAPPING
} = MODEL;

const modelLinkRecords = {
  get: {},
  set: {},
  remove: {},
  back: {},
  request: {},
  update: {},
};

const registerLinkProto = function(modelAPI, linkProto, linkType, linkFunction){
  // register coll
  const connect = function(){
    const linkQueue = this[LINKTYPESPROXYMAPPING[linkType]](_idt);
    linkQueue.push(linkFunction.apply(this, arguments));
    return this;
  };

  connect.adaptor = modelAPI;
  connect.type = linkType;

  modelLinkRecords[modelAPI][linkProto] = connect;
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
  let res = args || LINKPERSET;

  for(; i<l; i++){
    const link = catchQueue[i];
    res = link.apply(link.core, res);

    if(res == null) break;
    else if(i!==(l-1) && !_isArrayLike(res)) res = [res];
  }

  return ( res === args || res === LINKPERSET ) ? null : res;
};

const createLinkProps = function(returnValue){
  return function(idt){
    return idt === _idt ? returnValue : LINKPERSET;
  };
};

export const createLink = function(model, modelAPI, b, r, s, c){
  const getLinkRecords = modelLinkRecords[modelAPI];

  const linkCatch = c ? _slice(c) : [];
  const linkSolve = s ? _slice(s) : [];
  const linkBefore = b ? _slice(b) : [];
  const linkRuntime = r ? _slice(r) : [];

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
      if(useCatch) result =  linkCatchCaller(linkCatch, args);
      // async api interrupted
      return isAsync ? [result] : result;
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
      // Promise API
      return result;
    }

    result = model[modelAPI].apply(model, args);

    if(useSolve) result = linkCaller(linkSolve, [result]);
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
    _s: createLinkProps(linkSolve),
    _c: createLinkProps(linkCatch),
    _b: createLinkProps(linkBefore),
    _r: createLinkProps(linkRuntime),
    _m: createLinkProps(model),
    extend(){ return createLink(model, modelAPI, linkBefore, linkRuntime, linkSolve, linkCatch); }
  }));

  return linkInstance;
};

export const registerLink = function(modelAPI, linkProto, linkType, linkFunction, idt){
  if(_isString(modelAPI) &&
     _isString(linkProto) &&
     _isString(linkType) &&
     _isFn(linkFunction)){

    // use api
    if(!_has(ALLOWLINKAPIS, modelAPI))
      return console.error(`[cubec model] [${linkProto}] is not format model.proto.api to register in model linkSystem`);

    // runtime path
    if(!_has(idt === _idt ? ALLOWLINKTYPESWITHRUNTIME : ALLOWLINKTYPES, linkType))
      return console.error(`[cubec model] [${linkType}] linkType is not allow for register to linkSystem`);

    return registerLinkProto(modelAPI, linkProto, linkType, linkFunction);
    // registerLinkProto(modelAPI, linkProto, linkType, linkFunction);
    // return console.log(modelLinkRecords)
  }

  return console.error("[cubec model] linkSystem not current format arguments", arguments);
};
