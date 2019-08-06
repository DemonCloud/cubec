import _base from './_base';
import index from '../tools/index';

const { events } = _base;

export default function removeEvent(obj,type,fn){
  var id = obj.__eid || 0;

  if(id && events[id]){
    if(events[id][type]){
      const findCall = index(events[id][type], fn);

      if(findCall != null)
        events[id][type].splice(findCall, 1);

      if(!(events[id][type].length || !fn))
        delete events[id][type];

    }else if(!type && !fn){
      delete obj.__eid;
      delete events[id];
    }
  }

  return obj;
}
