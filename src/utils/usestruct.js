import struct from '../lib/struct';

const rootSign = '/';
const paramSign = ':';
const leafSign = '###';

const _idt = struct.broken,
  _extend = struct.extend(),
  _define = struct.define(),
  _clone = struct.clone(),
  _slice = struct.slice(),
  _has = struct.has(),
  _index = struct.index(),
  _one = struct.index('one'),
  _trim = struct.string('trim'),
  _isArrayLike = struct.type('arraylike'),
  _isElement = struct.type('elm'),
  _isDefine = struct.type('def'),
  _isObject = struct.type('object'),
  _isString = struct.type('string'),
  _isNumber = struct.type('number'),
  _isInt = struct.type('int'),
  _isFloat = struct.type('float'),
  _isArray = struct.type('array'),
  _isNeed = struct.type('required'),
  _isPrim = struct.type('prim'),
  _isBool = struct.type('boolean'),
  _isFn = struct.type('func'),
  _type = struct.type(),
  _cool = struct.cool(),
  _some = struct.some(),
  _every = struct.every(),
  _eachArray = struct.each('array'),
  _eachObject = struct.each('object'),
  _map = struct.map(),
  _size = struct.size(),
  _get = struct.prop('get'),
  _set = struct.prop('set'),
  _rm = struct.prop('rm'),
  _merge = struct.merge(),
  _find = struct.find(),
  _not = struct.not(),
  _eq = struct.eq(),
  _paramParse = struct.param('parse'),
  _paramStringify = struct.param('stringify'),
  _combined = struct.combined(),
  _on = struct.event('on'),
  _off = struct.event('off'),
  _emit = struct.event('emit'),
  _hasEvent = struct.event('has'),
  _fireEvent = struct.fireEvent(),
  _axt = struct.doom(),
  _axtc = struct.doom('cache'),
  _toString = struct.convert('string'),
  _lock = struct.lock(),
  _ayc = struct.ayc(),
  _keys = struct.keys(),
  _ajax = struct.ajax(),
  _link = struct.link(),
  _decode = struct.html('decode'),
  _v8 = struct.v8(),
  _noop = struct.noop();

export {
  _extend,
  _define,
  _clone,
  _slice,
  _has,
  _index,
  _one,
  _trim,
  _isArrayLike,
  _isElement,
  _isDefine,
  _isObject,
  _isString,
  _isNumber,
  _isInt,
  _isFloat,
  _isNeed,
  _isPrim,
  _isArray,
  _isBool,
  _isFn,
  _type,
  _cool,
  _some,
  _every,
  _eachArray,
  _eachObject,
  _map,
  _size,
  _idt,
  _get,
  _set,
  _rm,
  _merge,
  _find,
  _not,
  _eq,
  _on,
  _off,
  _emit,
  _hasEvent,
  _fireEvent,
  _paramParse,
  _paramStringify,
  _combined,
  _axt,
  _axtc,
  _toString,
  _lock,
  _ayc,
  _keys,
  _ajax,
  _link,
  _decode,
  _v8,
  _noop,

  rootSign,
  paramSign,
  leafSign
};
