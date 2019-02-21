import struct from '../../lib/struct';

const rootSign = '/';
const _idt = struct.broken;
const _paramStringify = struct.param('stringify');
const _trim = struct.string('trim');

export default function(path=_idt, query={}){
  let fixpath = path === _idt ? "" : path;
  const querys = _paramStringify(query);

  return _trim((rootSign + fixpath) + (querys ? `?${querys}` : ''));
}
