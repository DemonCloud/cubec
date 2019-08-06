import eachArray from './eachArray';
import keys from './tools/keys';

export default function eachObject(obj, fn, context){
  const callable = function(key){ fn.call(this,obj[key],key,obj); };
  eachArray(keys(obj), callable, context);
  return obj;
}
