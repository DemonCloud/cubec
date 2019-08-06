import isFunction from '../type/isFunction';

export default function index(list, idf){
  let res = null, i = list.length;
  const fn = isFunction(idf) ? idf : function(v){ return v==idf; };

  for(; i--; ){
    if(fn.call(list, list[i], i, list)){
      res = i;
      break;
    }
  }

  return res;
}
