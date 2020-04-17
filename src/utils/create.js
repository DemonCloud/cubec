import { _merge, _lock, _extend, _idt, } from './usestruct';

const ignore = ["__instance"];

// create module extend
export const createExtend = function(host, module) {
  host.extend = function(malloc={}) {
    const Extender = function(o) {
      return new module(_merge(malloc, o || _idt));
    };

    Extender.constructor = module;
    Extender._isExtender = true;

    return _lock(Extender);
  };

  return _lock(host);
};

// create core
export const createC = function(module) {
  const create = function(options) {
    return new module(options || _idt);
  };

  // create static props
  _extend(create, module, ignore);

  _lock(module);

  return create;
};
