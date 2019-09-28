import { registerLink } from '../linkSystem';
import {
  _merge,
  _isString,
  _isNumber,
  _isPrim,
  _idt,
} from '../../usestruct';

const linkProto = "merge";
const linkType = {
  before: "before",
  runtime: "runtime",
};

const mergeLink = function(){
  return function(key, value){
    const model = this._m(_idt);

    if(key && (_isString(key) || _isNumber(key))){
      let targetValue = model.get(key);

      targetValue = (!_isPrim(targetValue) && !_isPrim(value)) ? _merge(targetValue, value) : value;

      return [key, targetValue];
    }

    return _merge(model.get(), key);
  }.bind(this);
};

registerLink("update" , linkProto , linkType.runtime , mergeLink   , _idt);
registerLink("set"    , linkProto , linkType.before  , mergeLink);

