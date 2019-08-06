// create wrapper functions stack [ method ]
// args [ ...function ];
// var a = function(t){ return "<a>"+t+"<a>"}
// var b = function(t){ return "<b>"+t+"<b>"}
// var c = function(t){ return "<c>"+t+"<c>"}
// var w = wrap(a,b,c);
// w("tag") => "<c><b><a>tag<a><b><c>"
import slice from '../tools/slice';

export default function link(){
  let arg = slice(arguments);
  return function(defaultVal){
    return arg.reduce(function(val,fn){ return fn(val); }, defaultVal);
  };
}
