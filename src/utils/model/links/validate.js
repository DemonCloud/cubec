import { registerLink } from '../linkSystem';
import {
  _isString,
  _isInt,
  _size,
  _idt
} from '../../usestruct';
import singleVerify from '../singleVerify';
import multipleVerify from '../multipleVerify';

const linkProto = "validate";
const linkType = {
  runtime: "runtime",
  before: "before",
};

const validateLink = function(validator={}){
  const existValidate = !!_size(validator);

  return function(key, value){
    let checker = true;
    const args = arguments;
    const model = this._m(_idt);
    const useKey = (key && _isString(key)) || _isInt(key);

    if(!existValidate || key == null || key === '')
      return args;

    if(useKey && value == null)
      return null;

    // true single / false multiple
    checker = useKey ?
      singleVerify(key, value, model, validator) :
      multipleVerify(key, model, validator);

    return checker ? args : null;
  }.bind(this);
};

registerLink("update" , linkProto , linkType.runtime , validateLink , _idt);
registerLink("set"    , linkProto , linkType.before  , validateLink);
