import isArrayLike from '../type/isArrayLike';

const slc = ([]).slice;

export default function slice(ary,n,e){
  return isArrayLike(ary) ? slc.call(ary,n,e) : [];
}
