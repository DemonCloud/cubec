import struct from '../lib/struct';

const _each = struct.each('object');
const _define = struct.define();

export default function(item, props) {
  _each(props, function(t, n) {
    _define(item, n, {
      value: t,
      writable: false,
      enumerable: false,
      configurable: false,
    });
  });

  return item;
}
