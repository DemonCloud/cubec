import toString from './toString';

const tm = ("").trim;

export default function trim(str){
  return tm.call(toString(str == null ? "" : str));
}
