import { registerLink } from '../linkSystem';
import {
  _merge,
  _isString,
  _isInt,
  _isPrim,
  _isObject,
  _idt,
} from '../../usestruct';

const linkProto = "merge";
const linkType = {
  before: "before",
  runtime: "runtime",
};

const mergeLink = function(){
  const model = this._m(_idt);
  const linkAdapter = this._a;

  return function(key, value, isStatic){
    const useKey = (key && _isString(key)) || _isInt(key);

    if(linkAdapter === "set", useKey && value != null){
      let targetValue = model.get(key);

      targetValue = (_isPrim(targetValue) || _isPrim(value)) ? value : _merge(targetValue, value);

      return [key, targetValue, isStatic];
    }

    if(!key || !_isObject(key)) return;

    const result = _merge(model.get(), key);

    return linkAdapter === "update" ? result : [result, value];
  };
};

registerLink("update" , linkProto , linkType.runtime , mergeLink   , _idt);
registerLink("set"    , linkProto , linkType.before  , mergeLink);
