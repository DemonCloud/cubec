import _base from './_base';
import isFunction from '../type/isFunction';
import has from '../tools/has';
import size from '../tools/size';

const { events } = _base;

export default function hasEvent(obj,type,fn){
   const id= obj.__eid || 0;
   let res = false;

   if(id && events[id]){
     if(isFunction(fn) && events[id][type])
       res = has(events[id][type],fn);
     else
       res = size(events[id][type]);
   }

   return !!res;
 }
