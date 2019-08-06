import isFunction from './isFunction';
import isObject from './isObject';
import isNumber from './isNumber';

export default function(e){
  return !!e &&
    !isFunction(e) &&
    isObject(e) &&
    isNumber(e.length);
}
