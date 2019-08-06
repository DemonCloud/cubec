import isObject from '../type/isObject';
import clone from './clone';

const whiteSpace = /[\t\r\n\f\x20]/g;

function rInsignia(part){
  return encodeURIComponent(part).replace(' ','%20');
}

export default function paramStringify(param){
  const cloneparam = clone(param);

  for(let key in cloneparam)
    cloneparam[key] = rInsignia(
      isObject(cloneparam[key]) ?
      JSON.stringify(cloneparam[key]) :
      cloneparam[key]
    );

  return JSON.stringify(cloneparam).
    replace(/["{}]/g,'').
    replace(/:/g,'=').
    replace(/,/g,'&').
    replace(whiteSpace,'');
}
