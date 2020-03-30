import ERRORS from '../../constant/errors.define';
import {
  _isFn,
  _some,
  _every,
  _slice,
  _size
} from '../usestruct';

export default function(){
  const checkerQueue = _slice(arguments);

  if(!_size(checkerQueue) && !_every(checkerQueue, _isFn))
    throw new Error(ERRORS.VERIFY_ISCHECKER_UNEXCEPT);

  return function(value){
    return _some(checkerQueue, fn=>fn(value));
  };
}

