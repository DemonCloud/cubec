import _base from './_base';
import eachObject from '../eachObject';

const { events } = _base;

export default function fireEvent(obj,type,args){
  args = args || [];
  const res = [];
  const id = obj.__eid || 0;


  if(id && events[id] && type!==''){
    eachObject(events[id][type], function(f){
      res.push(f.apply(obj,args)); });
  }

  return res;
}
