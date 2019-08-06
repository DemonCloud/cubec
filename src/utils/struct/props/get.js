import isFunction from '../type/isFunction';
import isString from '../type/isString';
import isPrim from '../type/isPrim';
import slice from '../tools/slice';
import toString from '../tools/toString';

export default function get(obj,prop,dowith){
  let tmp,i,check;
  const keygen = toString(prop||'').split('.'),
        l=keygen.length-1;

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

  if(dowith){
    var args = slice(arguments,3);
    if(isFunction(dowith))
      tmp = dowith.apply(tmp,(args.unshift(tmp),args));
    else if(isString(dowith))
      tmp = isFunction(tmp[dowith]) ? tmp[dowith].apply(tmp,args) : tmp[dowith];
  }

  return tmp;
}
