import {
  _idt,
  _trim,
  _paramStringify,
  rootSign
} from '../usestruct';

export default function(path=_idt, query={}){
  const querys = _paramStringify(query);

  return _trim(rootSign + (path === _idt ? "" : path) + (querys ? `?${querys}` : ''));
}

