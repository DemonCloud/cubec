import ERRORS from '../../constant/errors.define';
import { _isFn, _isDefine, _every } from '../usestruct';

export default function(checker){
  if(!_isFn(checker))
    throw new Error(ERRORS.VERIFY_ISCHECKER_UNEXCEPT);

  return function(value){
    let check = false;

    if(_isDefine(value,'Object'))
      check = _every(value, checker);

    return check;
  };
}

