import struct from '../lib/struct';

const _each = struct.each("object");
const _eachAry = struct.each("array");
const _keys = struct.keys();

export default function(data){
  let combined = [];
  let maxLen = 0;
  let keys = _keys(data);

  _each(data, function(arr, key){
    maxLen = arr.length > maxLen ? arr.length : maxLen;
  });

  for(let i=0; i<maxLen; i++){
    let res = {};

    _eachAry(keys, function(key){
      res[key] = data[key][i];
    });

    combined.push(res);
  }

  return combined;
}
