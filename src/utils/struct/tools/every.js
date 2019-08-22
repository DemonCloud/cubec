import keys from './keys';

export default function every(list,idf){
  let res = !!list.length, key = keys(list), i = key.length;
  for( ;i--; )
    if(!(res=idf.call(list,list[key[i]],key[i],list)))
      break;
  return res;
}
