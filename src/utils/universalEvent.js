import {
  _isFn,
  _isArray,
  _isString,
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
  return _emit(this, type, _isArray(args) ? args : [args]);
}

export {on, off, emit};
