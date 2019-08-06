import isArray from './isArray';
import isFunction from './isFunction';
import isDefine from './isDefine';
import index from '../tools/index';

const typeArray = [
  'array',
  'function',
  'null',
  'undefined',
  'arguments',
  'boolean',
  'string',
  'number',
  'date',
  'regexp',
  'nodeList',
  'htmlcollection'
];

export default function typec(e){
  const types = [
    isArray(e),
    isFunction(e),
    e === null,
    e === void 0,
    isDefine(e,'Arguments'),
    isDefine(e,'Boolean'),
    isDefine(e,'String'),
    isDefine(e,'Number'),
    isDefine(e,'Date'),
    isDefine(e,'RegExp'),
    isDefine(e,'NodeList'),
    isDefine(e,'HTMLCollection')
  ];

  return typeArray[index(types,true)] || 'object';
}
