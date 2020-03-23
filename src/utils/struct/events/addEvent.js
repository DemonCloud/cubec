import _base from './_base';
import has from '../tools/has';
import define from '../constant/define';

const { events } = _base;

export default function addEvent(obj,type,fn){
  const { eid } = _base;
  let id = obj.__eid || 0;

  if(id === 0) define(obj, '__eid',
    { value : (id = (_base.eid = (eid+1))),
      writable : false,
      enumerable: false,
      configurable: true });
  if(!events[id]) events[id] = {};
  if(!events[id][type]) events[id][type] = [];
  if(!has(events[id][type],fn)) events[id][type].push(fn);

  // console.log("addEvent", events, obj.__eid, fn);
  return obj;
}
