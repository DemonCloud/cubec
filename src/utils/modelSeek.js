import struct from '../lib/struct';

const _each = struct.each("array");
const _eachObj = struct.each("object");
const _isObj = struct.type("object");
const _isArrayLike = struct.type("arraylike");

const seekResolve = function(data, key, preres){
  let res = preres || [];

  if(data != null){
    if(_isArrayLike(data)){
      _each(data, function(cdata){
        seekResolve(cdata, key, res);
      });
    }else if(_isObj(data)){
      _eachObj(data, function(cdata, ckey){
        if(ckey === key){
          res.push(cdata);
          seekResolve(cdata, key, res);
        }else{
          seekResolve(cdata, key, res);
        }
      });
    }
  }

  return res;
};

const modelSeek = function(data, keys){
  let res = {};

  _each(keys, function(key){
    res[key] = seekResolve(data,key);
  });

  return res;
};

export default modelSeek;
