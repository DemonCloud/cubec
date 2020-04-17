import { _merge, _lock, _extend, _idt, } from './usestruct';

const ignore = ["__instance"];

// create module extend
export const createExtend = function(module) {
  return function(malloc={}) {
    const Extender = function(o) {
      return new module(_merge(malloc, o || _idt));
    };

    Extender.constructor = module;
    Extender._isExtender = true;

    return Extender;
  };
};

// create core
export const createC = function(module) {
  const create = function(options) {
    return new module(options || _idt);
  };

  // create static props
  _extend(create, module, ignore);

  _lock(module);

  return _lock(create);
};
