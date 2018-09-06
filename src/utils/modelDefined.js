import struct from '../lib/struct';

const _each = struct.each('object');
const _define = struct.define();

function modelDefined(model, props) {
  _each(props, function(t, n) {
    _define(model, n, {
      value: t,
      writable: false,
      enumerable: false,
      configurable: false,
    });
  });

  return model;
}

export default modelDefined;
