import {
  _eachObject,
  _eachArray,
  _keys,
} from '../usestruct';

export default function(data){
  let combined = [];
  let maxLen = 0;
  const keys = _keys(data);

  _eachObject(data, function(arr){
    maxLen = arr.length > maxLen ? arr.length : maxLen;
  });

  for(let i=0; i<maxLen; i++){
    let res = {};

    _eachArray(keys, function(key){
      res[key] = data[key][i];
    });

    combined.push(res);
  }

  return combined;
}
