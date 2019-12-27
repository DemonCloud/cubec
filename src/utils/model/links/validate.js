import { registerLink } from '../linkSystem';
import singleVerify from '../singleVerify';
import multipleVerify from '../multipleVerify';
import {
  _isString,
  _isPlainObject,
  _isInt,
  _isFn,
  _size,
  _idt
} from '../../usestruct';

const linkProto = "validate";
const linkType = {
  runtime: "runtime",
  before: "before",
};

const validateLink = function(validate){
  const model = this._m(_idt);
  const validator = validate || model.validate || {};
  const existValidate = !!_size(validator);

  return function(key, value){
    let checker = true;
    const args = arguments;
    const defaultData = model.get();
    const useKey = (key && _isString(key)) || _isInt(key);

    if(!existValidate || key == null || key === '')
      return args;

    if(useKey && value == null)
      return defaultData;

    if(_isFn(key)){
      key = key(model.get());
      if(!_isPlainObject(key)) return;
    }

    // true single / false multiple
    checker = useKey ?
      singleVerify(key, value, model, validator) :
      multipleVerify(key, model, validator);

    return checker ? args : defaultData;
  };
};

registerLink("update" , linkProto , linkType.runtime , validateLink);
registerLink("set"    , linkProto , linkType.before  , validateLink);
