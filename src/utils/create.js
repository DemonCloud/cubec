import { _merge, _idt } from './usestruct';

export const createExtend = function(module) {
  return function(malloc) {
    const extender = function(o) {
      return new module(_merge(malloc, o || _idt));
    };

    extender.constructor = module;
    extender._isExtender = true;

    return extender;
  };
};

export const createC = function(module) {
  return function(o) {
    return new module(o || _idt);
  };
};
