import isRegExp from '../type/isRegExp';
import isArrayLike from '../type/isArrayLike';
import isObject from '../type/isObject';
import keys from './keys';
import eq from './eq';
import seq from './seq';

function regCheck(reg,n){
  return reg.test(n);
}

export default function has(list,n,ueq){
  const compare = isRegExp(n) ? regCheck : (ueq ? eq : seq);
  let idf = false, i;

  if(isArrayLike(list)){
    for(i=list.length; i--; )
      if(idf=compare(n,list[i]))
        break;
  }else if(isObject(list)){
    var key = keys(list);
    for(i=key.length; i--;)
      if(idf=compare(n,list[key[i]]))
        break;
  }
  return idf;
}
