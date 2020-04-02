import { _merge, _extend, _idt, } from './usestruct';

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
  _extend(create, module, ["__instance"]);

  return create;
};
