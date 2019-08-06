import isArray from '../type/isArray';
import eachArray from '../eachArray';

export default function combined(nameArr,valueArr){
  const res = {};

  if(isArray(nameArr) && isArray(valueArr))
    eachArray(nameArr,function(name,index){
      res[name] = valueArr[index]; });

  return res;
}
