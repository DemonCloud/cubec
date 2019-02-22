import {
  _eachArray,
  _eachObject,
  _isObject,
  _isArrayLike,
} from '../usestruct';

const seekResolve = function(data, key, preres){
  let res = preres || [];

  if(data != null){
    if(_isArrayLike(data)){
      _eachArray(data, function(cdata){
        seekResolve(cdata, key, res);
      });
    }else if(_isObject(data)){
      _eachObject(data, function(cdata, ckey){
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

export default function(data, keys){
  let res = {};

  _eachArray(keys, function(key){
    res[key] = seekResolve(data,key);
  });

  return res;
}
