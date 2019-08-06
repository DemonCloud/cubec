import isFunction from '../type/isFunction';

export default function toString(s){
  return s != null ? (isFunction(s.toString) ? s.toString() : s+'') : '';
}
