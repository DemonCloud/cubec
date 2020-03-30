import ERRORS from '../../constant/errors.define';
import { _isFn, _isArrayLike, _every } from '../usestruct';

export default function(checker){
  if(!_isFn(checker))
    throw new Error(ERRORS.VERIFY_ISCHECKER_UNEXCEPT);

  return function(value){
    let check = false;

    if(_isArrayLike(value))
      check = _every(value, checker);

    return check;
  };
}

