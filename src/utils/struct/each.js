import eachArray from './eachArray';
import eachObject from './eachObject';
import isArrayLike from './type/isArrayLike';
import isObject from './type/isObject';

export default function each(list,fn,ts){
  if(isArrayLike(list))
    return eachArray(list,fn,ts);
  else if(isObject(list) && list !== null)
    return eachObject(list,fn,ts);
  return list;
}
