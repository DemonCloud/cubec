import {
  _isFn,
  _isArrayLike,
  _isString,
  _slice,
  _on,
  _off,
  _emit,
} from './usestruct';

function on(type, fn) {
  if (_isFn(fn) && _isString(type))
    _on(this, type, fn);
  return this;
}

function off(type, fn) {
  return _off(this, type, fn);
}

function emit(type, args) {
  if(arguments.length > 2) args = _slice(arguments,1);
  return _emit(this, type, _isArrayLike(args) ? args : args !== null ? [args] : []);
}

export {on, off, emit};
