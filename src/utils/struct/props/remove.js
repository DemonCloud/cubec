import isArray from '../type/isArray';
import toNumber from '../tools/toNumber';

export default function rmProp(obj,prop){
  let tmp,i,end;
  const keygen = (prop||'').split('.');

  if(keygen.length === 1){
    if(obj.hasOwnProperty(prop))
      delete obj[prop];
  }else{
    for(i=0,tmp=obj,end = keygen.pop(); i<keygen.length; i++)
      tmp = tmp[keygen[i]];
    if(isArray(tmp))
      tmp.splice(toNumber(end),1);
    else
      delete tmp[end];
  }
  return obj;
}
