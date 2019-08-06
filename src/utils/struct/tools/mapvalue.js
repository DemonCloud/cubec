import isArrayLike from '../type/isArrayLike';
import isFunction from '../type/isFunction';
import each from '../each';

export default function mapValue(list,fn){
  const isArr = isArrayLike(list), isFn = isFunction(fn);
  const result = isArr ? [] : {};

  each(list,function(val,key,list){
    result[key] = isFn ? fn.call(list,val,key,list) : val[fn];
  });

  return result;
}
