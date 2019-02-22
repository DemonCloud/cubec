import { _merge } from './usestruct';

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
