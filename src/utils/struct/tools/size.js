import isFunction from '../type/isFunction';
import isObject from '../type/isObject';
import isNumber from '../type/isNumber';
import isNaN from '../type/isNaN';
import keys from './keys';

export default function size(n){
  if(!isFunction(n) && n!= null && !isNaN(n))
    return isNumber(n.length) ? n.length :
      (isObject(n) ? keys(n).length : 0);
  return 0;
}
