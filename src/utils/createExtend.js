import struct from '../lib/struct';

const _merge = struct.merge();

export default function(module) {
  return function(malloc) {
    const extender = function(o) {
      return new module(_merge(malloc, o || {}));
    };

    extender.constructor = module;
    extender._isExtender = true;

    return extender;
  };
}
