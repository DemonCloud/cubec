import isArray from '../type/isArray';
import isString from '../type/isString';
import isObject from '../type/isObject';

export default function keys(e){
  let res = [];

  if(e != null){
    if(isArray(e) || isString(e)){
      for(let i=e.length; i--; )
        res.unshift(i);
    }else if(isObject(e)){
      res = Object.keys(e);
    }
  }

  return res;
}
