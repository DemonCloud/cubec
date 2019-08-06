import isString from '../type/isString';

const tm = ("").trim;

export default function trim(str){
  str = str || "";
  return tm.call(isString(str) ? str : str.toString());
}
