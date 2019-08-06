import keys from './keys';

export default function some(list,idf){
  let res = false, key = keys(list), i = key.length;
  for( ;i--; )
    if((res=idf.call(list,list[key[i]],key[i],list)))
      break;
  return res;
}
