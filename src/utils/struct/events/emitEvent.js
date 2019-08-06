import eachArray from '../eachArray';
import toString from '../tools/toString';
import trim from '../tools/trim';
import fireEvent from './fireEvent';

export default function emitEvent(obj,type,args){
  return eachArray(
    toString(type).split(','),
    function(t){ fireEvent(obj, trim(t), args); }),
    obj;
}
