import _base from './_base';
import isFunction from '../type/isFunction';

const { events } = _base;

const findFnCall = function(list, fn){
  let res;
  let i = list.length;

  for(;i--;)
    if(list[i] === fn){
      res = i; break;
    }

  return res;
};

export default function removeEvent(obj,type,fn){
  let id = obj.__eid;
  const existFn = isFunction(fn);

  if(id && events[id]){
    if(events[id][type]){
      if(existFn){
        const findCallIndex = findFnCall(events[id][type], fn);

        if(findCallIndex != null)
          events[id][type].splice(findCallIndex, 1);
      }else if(!events[id][type].length)
        delete events[id][type];

    }else if(!type && !existFn){
      delete obj.__eid;
      delete events[id];
    }else{
      delete events[id][type];
    }
  }

  // console.log("removeEvent", events, obj.__eid, fn);

  return obj;
}
