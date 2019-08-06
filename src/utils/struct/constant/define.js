import isObject from '../type/isObject';

export default function define(obj,prop,st){
  return isObject(prop) ?
    Object.defineProperties(obj,prop) :
    Object.defineProperty(obj,prop,st);
}
