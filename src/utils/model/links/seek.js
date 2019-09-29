import MODEL from '../../../constant/model.define';
import { registerLink } from '../linkSystem';
import {
  _isString,
  _eachArray,
  _eachObject,
  _isObject,
  _isArrayLike,
  _keys,
} from '../../usestruct';

const linkProto = "seek";

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

const seekData = function(data, keys){
  let res = {};

  _eachArray(keys, function(key){
    res[key] = seekResolve(data,key);
  });

  return res;
};

const combinedData = function(data){
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
};

const seekLink = function(keys, combined=false){
  const seekKeys = _isString(keys) ? [keys] : (keys || []);

  return function(data){
    let seek = seekData(data, seekKeys);
    if(combined) seek = combinedData(seek);
    return seek;
  };
};

_eachArray(MODEL.ALLOWLINKAPIS, function(modelAPI){
  registerLink(modelAPI , linkProto , "solve" , seekLink);
});
