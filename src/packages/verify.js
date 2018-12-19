import atom from './atom';
import model from './model';
import struct from '../lib/struct';

const _isNeed = struct.type('required');
const _isFn = struct.type('func');
const _isInt = struct.type('int');
const _isArray = struct.type('array');
const _isFloat = struct.type('float');
const _isString = struct.type('string');
const _isObject = struct.type('object');
const _isNumber = struct.type('number');
const _isPrim = struct.type('primitive');
const _isArrayLike = struct.type('arraylike');
const _isBool = struct.type('boolean');
const _toString = struct.convert('string');
const _v8 = struct.v8();

const checker = function(check, type) {
  return function(value, warnStatic) {
    let res = check(value);

    return !warnStatic
      ? res ||
          warnning(value, '[ validation -> verify.' + _toString(type) + ' ]')
      : res;
  };
};

const warnning = function(value, message) {
  // @target warning msg
  // console.warn(
  //   'The value Of *( ' +
  //     value +
  //     ' ) with type [ ' +
  //     _type(value) +
  //     ' ] not pass validate! ' +
  //     _toString(message),
  // );

  return false;
};

const makeC = function(compare) {
  return function(value) {
    return value instanceof compare;
  };
};

const verify = {
  isRequired: checker(_isNeed, 'required'),
  isFunc: checker(_isFn, 'function'),
  isInt: checker(_isInt, 'int'),
  isArray: checker(_isArray, 'array'),
  isFloat: checker(_isFloat, 'float'),
  isString: checker(_isString, 'string'),
  isObject: checker(_isObject, 'object'),
  isNumber: checker(_isNumber, 'number'),
  isArrayLike: checker(_isArrayLike, 'arrayLike'),
  isPrimitive: checker(_isPrim, 'primitive'),
  isBool: checker(_isBool, 'boolean'),
  isModel: checker(makeC(model), 'model'),
  isAtom: checker(makeC(atom), 'atom'),
};

export default Object.freeze(_v8(verify));
