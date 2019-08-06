import isFunction from './isFunction';

export default function isObject(e){
  return !!e && (typeof e === 'object' || isFunction(e));
}
