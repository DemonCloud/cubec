import _base from './_base';

const { events } = _base;
const findFnCall = function(list, fn){
  let res;
  let i = list.length;
  for(;i--;)
    if(list[i] === fn){
      res = fn; break;
    }
  return res;
};

export default function removeEvent(obj,type,fn){
  let id = obj.__eid;

  if(id && events[id]){
    if(events[id][type]){
      const findCall = findFnCall(events[id][type], fn);

      if(findCall != null)
        events[id][type].splice(findCall, 1);

      if(!events[id][type].length || !fn)
        delete events[id][type];

    }else if(!type && !fn){
      delete obj.__eid;
      delete events[id];
    }
  }

  return obj;
}
