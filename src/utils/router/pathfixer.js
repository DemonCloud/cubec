import struct from '../../lib/struct';

const _idt = struct.broken;
const _trim = struct.string('trim');

const rootSign = '/';
const rootfixer = /^\/+|\/+$/g;

export default function(path){
  let fixpath = path;

  if(!fixpath) fixpath = rootSign;
  else if(fixpath[0] !== rootSign) fixpath = location.pathname + rootSign + fixpath;

  fixpath =  _trim(fixpath.split("?")[0].replace(rootfixer,''));

  if(fixpath === '') fixpath = _idt;

  return fixpath;
}
