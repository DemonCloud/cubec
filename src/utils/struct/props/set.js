import toString from '../tools/toString';

export default function setProp(obj,prop,value){
  let tmp, end, i, check;
  let keygen = toString(prop).split('.');

  if(keygen.length === 1 && prop !== ""){
    obj[prop] = value;
  }else if(prop !== ""){
    // [a.b.2]
    for(i=0,tmp=obj,check,end=keygen.pop(); i<keygen.length; i++)
      tmp = (check = tmp[keygen[i]]) == null ? {} : check;
    tmp[end] = value;
  }
  return obj;
}
