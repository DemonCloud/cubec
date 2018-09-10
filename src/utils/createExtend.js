import struct from '../lib/struct';

const _merge = struct.merge();

function createExtend(module) {
  return function(malloc) {
    const extender = function(o) {
      return new module(_merge(malloc, o || {}));
    };

    extender.constructor = module;
    extender._isExtender = true;

    return extender;
  };
}

export default createExtend;
