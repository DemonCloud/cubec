import {
  _isNeed,
  _isFn,
  _isInt,
  _isArray,
  _isFloat,
  _isString,
  _isObject,
  _isNumber,
  _isPrim,
  _isArrayLike,
  _isBool,
  _v8,
} from '../utils/usestruct';

const checker = function(check, type) {
  return function(value) {
    return check(value);
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
};

export default Object.freeze(_v8(verify));
