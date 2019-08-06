import _idt from './struct/constant/broken';
import _define from './struct/constant/define';
import _cool from './struct/constant/cool';
import _noop from './struct/constant/noop';

import _isArray from './struct/type/isArray';
import _isArrayLike from './struct/type/isArrayLike';
import _isDOM from './struct/type/isDOM';
import _isDefine from './struct/type/isDefine';
import _isObject from './struct/type/isObject';
import _isString from './struct/type/isString';
import _isNumber from './struct/type/isNumber';
import _isInt from './struct/type/isInt';
import _isFloat from './struct/type/isFloat';
import _isNeed from './struct/type/isRequired';
import _isPrim from './struct/type/isPrim';
import _isBool from './struct/type/isBoolean';
import _isFn from './struct/type/isFunction';
import _type from './struct/type/typec';

import _extend from './struct/tools/extend';
import _clone from './struct/tools/clone';
import _slice from './struct/tools/slice';
import _index from './struct/tools/index';
import _keys from './struct/tools/keys';
import _has from './struct/tools/has';
import _trim from './struct/tools/trim';
import _some from './struct/tools/some';
import _every from './struct/tools/every';
import _map from './struct/tools/mapvalue';
import _size from './struct/tools/size';
import _merge from './struct/tools/merge';
import _eq from './struct/tools/eq';
import _decode from './struct/tools/decode';
import _combined from './struct/tools/combined';
import _toString from './struct/tools/toString';
import _paramParse from './struct/tools/paramParse';
import _paramStringify from './struct/tools/paramStringify';

import _get from './struct/props/get';
import _set from './struct/props/set';
import _rm from './struct/props/remove';

import _on from './struct/events/addEvent';
import _off from './struct/events/removeEvent';
import _emit from './struct/events/emitEvent';
import _hasEvent from './struct/events/hasEvent';
import _fireEvent from './struct/events/fireEvent';

import _lock from './struct/optimize/lock';
import _ayc from './struct/optimize/ayc';
import _link from './struct/optimize/link';
import _v8 from './struct/optimize/v8';

import _axt from './struct/template/axt';
import _axtc from './struct/template/axtc';

import _eachArray from './struct/eachArray';
import _eachObject from './struct/eachObject';
import _ajax from './struct/ajax';

const rootSign = '/';
const paramSign = ':';
const leafSign = '###';
const querySign = '?';
const hashSign = '#';
const urlSlash = '//';
const http = 'http://';
const https = 'https://';

// const _ajax = struct.ajax(); //

export {
  _extend,
  _define,
  _clone,
  _slice,
  _has,
  _index,
  _trim,
  _isArrayLike,
  _isDOM,
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
  leafSign,
  querySign,
  hashSign,
  http,
  https,
  urlSlash,
};
