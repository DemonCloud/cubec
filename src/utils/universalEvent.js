import struct from 'ax-struct-js';

const _isFn = struct.type('function');
const _on = struct.event('on');
const _off = struct.event('off');
const _emit = struct.event('emit');

function on(type, fn) {
  if (_isFn(fn)) _on(this, type, fn);
  return this;
}

function off(type, fn) {
  return _off(this, type, fn);
}

function emit(type, args) {
  return _emit(this, type, args || []);
}

export {on, off, emit};
