const ts = ({}).toString;
export default function isDefine(e,name){
  return ts.call(e) === '[object ' + name + ']';
}
