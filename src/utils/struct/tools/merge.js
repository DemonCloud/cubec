import isArrayLike from '../type/isArrayLike';
import isDefine from '../type/isDefine';
import isArray from '../type/isArray';
import isObject from '../type/isObject';
import isPrim from '../type/isPrim';
import slice from './slice';
import keys from './keys';
import eachArray from '../eachArray';

function mergeCompare(v,n){
  return (!isPrim(v) && !isPrim(n)) &&
    ((isDefine(v,'Object') && isDefine(n,'Object')) ||
      (isArrayLike(v) && isArrayLike(n)));
}

export default function merge(f){
  var res, collect = slice(arguments);

  // deeping reduce to merge
  if(isArray(f)) collect.reduce(function(val,next){
    return eachArray(next,function(nextval,i){
      var v = val[i], n = nextval;
      val[i] = mergeCompare(v,n) ? merge(v,n) : n;
    }),(res=val);
  },[]);

  else if(isObject(f)) collect.reduce(function(val,next){
    var nk = keys(next);
    return eachArray(nk,function(key){ var v = val[key], n = next[key];
      val[key] = mergeCompare(v,n) ? merge(v,n) : n; }), (res=val);
  },{});

  return res;
}
