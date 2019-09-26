import isPrim from '../type/isPrim';
import toString from '../tools/toString';

export default function get(obj,prop){
  let tmp,i,check;
  const keygen = toString(prop||'').split('.');
  const l = keygen.length - 1;

  if(keygen.length === 1){
    if(obj.hasOwnProperty(prop))
      tmp = obj[prop];
  }else{
    // [a.b.2]
    for(i=0,tmp=obj; i<keygen.length; i++){
      check = isPrim(tmp = tmp[keygen[i]]);
      if(i !== l && check){
        tmp = void 0;
        break;
      }
    }
  }

  return tmp;
}
