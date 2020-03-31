import each from '../each';
import isArray from '../type/isArray';
import has from '../tools/has';

export default function extend(o1,o2,nothisproperty){
  if(nothisproperty)
    each(o2,function(v,k){
      if(isArray(nothisproperty) ?
        !has(nothisproperty,k) :
        (nothisproperty != null ? k !== nothisproperty : true))
        o1[k] = v;
    });
  else
    each(o2,function(v,k){ o1[k] = v; });

  return o1;
}
