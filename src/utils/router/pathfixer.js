import {
  _idt,
  _trim,
  rootSign
} from '../usestruct';

const rootfixer = /^\/+|\/+$/g;

export default function(path){
  let fixpath = path;

  if(!fixpath) fixpath = rootSign;
  else if(fixpath[0] !== rootSign) fixpath = location.pathname + rootSign + fixpath;

  fixpath =  _trim(fixpath.split("?")[0].replace(rootfixer,''));

  if(fixpath === '') fixpath = _idt;

  return fixpath;
}

