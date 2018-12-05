import struct from '../lib/struct';

const _isFn = struct.type('func');
const _isArr = struct.type('arraylike');
const _isStr = struct.type('string');
const _on = struct.event('on');
const _off = struct.event('off');
const _emit = struct.event('emit');

function on(type, fn) {
  if (_isFn(fn) && _isStr(type))
    _on(this, type, fn);
  return this;
}

function off(type, fn) {
  return _off(this, type, fn);
}

function emit(type, args) {
  return _emit(this, type, _isArr(args) ? args : []);
}

export {on, off, emit};
