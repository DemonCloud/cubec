//
// linkType:
//   before
//   runtime
//   complete
//
//
// cubec.model.registerLink("get", "toJSON", "complete", function(getData){
//   return [JSON.stringify(getData)];
// });
//
// cubec.model.registerLink("set", "validate", "before", function(setData)){
//   return;
// }

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

// allow to linkapi
const allowLinkAPIS = [
  "get",
  "set",
  "merge",
  "remove",
  "seek",
  "back",
  "request",
  "update",
];

const allowLinkTypes = ["before", "solve", "catch"];
const allowLinkTypesWithRuntime = ["before", "solve", "runtime", "catch"];

const asyncLinkAPIS = {
  request: true,
  update: true,
};

const modelLinkRecords = {
  get: {},
  set: {},
  merge: {},
  remove: {},
  seek: {},
  back: {},
  request: {},
  update: {},
};

const LinkTypesProxyMapping = {
  before: "_b",
  runtime: "_r",
  solve: "_s",
  catch: "_c",
};

const registerLinkProto = function(modelAPI, linkProto, linkType, linkFunction){
  // register coll
  modelLinkRecords[modelAPI][linkProto] = function(){
    const linkQueue = this[LinkTypesProxyMapping[linkType]](_idt);
    linkQueue.push(linkFunction.apply(null, arguments));
    return this;
  };
};

const linkCaller = function(queue, args){
  let l = queue.length;
  let i = 0;
  let res = args;

  for(; i<l; i++){
    const link = queue[i];
    res = link.apply(null, res);

    if(res == null) break;
    else if(i!==(l-1) && !_isArrayLike(res)) res = [res];
  }

  return res;
};

const linkCatchCaller = function(catchQueue){
  let l = catchQueue.length;
  let i = 0;
  const base = [];
  let res = base;

  for(; i<l; i++){
    const link = catchQueue[i];
    res = link.apply(null, res);

    if(res == null) break;
    else if(i!==l && !_isArrayLike(res)) res = [res];
  }

  return res === base ? null : res;
};

export const createLink = function(model, modelAPI, b, r, s, c){
  const getLinkRecords = modelLinkRecords[modelAPI];

  const linkCatch = c ? _slice(c) : [];
  const linkSolve = s ? _slice(s) : [];
  const linkBefore = b ? _slice(b) : [];
  const linkRuntime = r ? _slice(r) : [];
  const linkInstance = function(){
    const isAsync = asyncLinkAPIS[modelAPI];
    const useCatch = !!linkCatch.length;
    const useSolve = !!linkSolve.length;
    const useBefore = !!linkBefore.length;
    const useRuntime = !!linkRuntime.length;
    let args = _slice(arguments);

    // exist linkBefore
    if(useBefore)
      args = linkCaller(linkBefore, args);

    if(!isAsync){
      let result = model[modelAPI].apply(model, args);
      if(useSolve) result = linkCaller(linkSolve, [result]);
      if(result == null && useCatch) return linkCatchCaller(linkCatch);
      return result;
    }

    return model[modelAPI].apply(model, args.concat([
      _idt,
      useRuntime ? linkRuntime : null,
      useSolve ? linkSolve : null ,
      useCatch ? linkCatch : null
    ]));
  };

  // use coll
  const makeInstanceLinkPrototype = _map(getLinkRecords, function(coll){
    return coll.bind(linkInstance);
  });

  // create prototype
  defined(linkInstance, _extend(makeInstanceLinkPrototype, {
    _s : function(idt){ return (idt === _idt ? linkSolve : []); },
    _c : function(idt){ return (idt === _idt ? linkCatch : []); },
    _b : function(idt){ return (idt === _idt ? linkBefore : []); },
    _r : function(idt){ return (idt === _idt ? linkRuntime : []); },
    extend(){
      return createLink(model, modelAPI, linkBefore, linkRuntime, linkSolve, linkCatch);
    }
  }));

  return linkInstance;
};

export const registerLink = function(modelAPI, linkProto, linkType, linkFunction, idt){
  if(_isString(modelAPI) &&
     _isString(linkProto) &&
     _isString(linkType) &&
     _isFn(linkFunction)){

    // use api
    if(!_has(allowLinkAPIS, modelAPI))
      return console.error(`[${linkProto}] is not format model.proto.api to register in model linkSystem`);

    // runtime path
    if(!_has(idt === _idt ?allowLinkTypesWithRuntime : allowLinkTypes, linkType))
      return console.error(`[${linkType}] linkType is not allow for register to linkSystem`);


    registerLinkProto(modelAPI, linkProto, linkType, linkFunction);

    return console.log(modelLinkRecords);
  }


  return console.error("linkSystem not current format arguments", arguments);
};

