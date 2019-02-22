import {
  _cool,
  _isString,
  _isArray,
  _eachArray,
  _idt,
} from '../usestruct';

export default function(list, callback){
  let LIST = this._assert(_cool, _idt);
  let target = _isString(list) ? [list] : (_isArray(list) ? list : []);

  _eachArray(target, (name)=>callback.call(this,LIST,name));

  return this;
}
