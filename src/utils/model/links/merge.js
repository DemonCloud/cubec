import MODEL from '../../../constant/model.define';
import { registerLink } from '../linkSystem';
import {
  _merge,
  _isString,
  _isInt,
  _isPrim,
  _isPlainObject,
  _idt,
  _isFn,
} from '../../usestruct';

const linkProto = "merge";

const mergeLink = function(){
  const model = this._m(_idt);

  return function(key, value, isStatic){
    const useKey = (key && _isString(key)) || _isInt(key);

    if(useKey && value != null){
      let targetValue = model.get(key);
      targetValue = (_isPrim(targetValue) || _isPrim(value)) ?
        value : _merge(targetValue, value);

      return [key, targetValue, isStatic];
    }

    if(_isFn(key)) key = key(model.get());

    if(!key || !_isPlainObject(key)) return;

    return [_merge(model.get(), key), value];
  };
};

registerLink("set"    , linkProto , MODEL.LINKTYPES.before  , mergeLink);
