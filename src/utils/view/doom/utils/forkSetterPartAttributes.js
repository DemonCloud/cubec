import { _eachArray } from '../../../usestruct';
import forkSetterAttributes from './forkSetterAttributes';

const PART_ATTRIBUTES_LIST = [
  "id",
  "class",
  "className",
  "style",
  "style.cssText",
];

const PART_ATTRIBUTES_LIST_MAPPING = {};

_eachArray(PART_ATTRIBUTES_LIST, function(key){
  PART_ATTRIBUTES_LIST_MAPPING[key] = true;
});

export default function forkSetterPartAttributes(elm, attr, value){
  if(PART_ATTRIBUTES_LIST_MAPPING[attr])
    forkSetterAttributes(elm, attr, value);
}
