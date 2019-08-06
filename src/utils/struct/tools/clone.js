import isArrayLike from '../type/isArrayLike';
import isPrim from '../type/isPrim';
import slice from './slice';

export default function clone(l){
  if(isArrayLike(l))
    return slice(l);
  if(!isPrim(l))
    return JSON.parse(JSON.stringify(l));
  return l;
}
