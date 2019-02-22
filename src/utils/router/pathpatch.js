import {
  _idt,
  _trim,
  _paramStringify,
  rootSign
} from '../usestruct';

export default function(path=_idt, query={}){
  let fixpath = path === _idt ? "" : path;
  const querys = _paramStringify(query);

  return _trim((rootSign + fixpath) + (querys ? `?${querys}` : ''));
}
