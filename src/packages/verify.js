import isArrayOf from '../utils/verify/isArrayOf';
import isObjectOf from '../utils/verify/isObjectOf';
import isMultipleOf from '../utils/verify/isMultipleOf';
import {
  _isNeed,
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

const verify = {
  isRequired: _isNeed,
  isInt: _isInt,
  isArray: _isArray,
  isFloat: _isFloat,
  isString: _isString,
  isObject: _isObject,
  isNumber: _isNumber,
  isArrayLike: _isArrayLike,
  isPrimitive: _isPrim,
  isBoolean: _isBool,
  isArrayOf,
  isObjectOf,
  isMultipleOf,
};

export default _v8(verify);
