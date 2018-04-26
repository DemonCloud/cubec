import struct from 'ax-struct-js';

const _merge = struct.merge();

function createExtend(module) {
  return function(malloc) {
    const extender = function(o) {
      return new module(_merge(malloc, o || {}));
    };

    extender.constructor = module;

    return extender;
  };
}

export default createExtend;
