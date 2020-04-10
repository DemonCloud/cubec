import {
  ATTRIBUTES_SHORTCUT_NAME,
} from '../constant/attr';
import {
  _trim,
  _get
} from '../../../usestruct';

const REGEXP_ATTRIBUTES_SPLIT_CHUNK = /([\S]+\s*=\s*\(.*\)|([\S]+\s*=\s*[\"\'][^\'\"]+[\'\"])|([\S]+\s*=\s*[\S]+)|(\w+))/gmi;
const REGEXP_ATTRIBUTES_TRIM_VALUE_SLIASH = /^[\'\"]|[\'\"]$/gmi;
const REGEXP_ATTRIBUTES_MAP_TO_VIEW = /^this\.\w+/i;
const REGEXP_ATTRIBUTES_MAP_TO_VIEW_REPLACEMENT = "this.";

const checkIfIsSpecialAttribute = function(attrName){
  // wrapper with []. like [props], [attr]
  return attrName[0] === "[" && attrName[attrName.length-1] == "]";
};

export default function parserAttributes(attrObject, attrString, view, args){
  let chunkArray;

  while((chunkArray = REGEXP_ATTRIBUTES_SPLIT_CHUNK.exec(attrString))){
    let attrName, attrValue, chunk = chunkArray[0];

    const splitPos = chunk.indexOf("=");

    // with = chunk split
    if(splitPos !== -1){
      attrName = _trim(chunk.slice(0, splitPos));

      // shortcut attribute name, just like [disabled=true, checked=abc]
      attrValue = _trim(chunk.slice(splitPos+1, chunk.length)).replace(REGEXP_ATTRIBUTES_TRIM_VALUE_SLIASH, "");

      if(ATTRIBUTES_SHORTCUT_NAME[attrName])
        attrValue = (attrValue !== "false");

      // special attr link - [props] [abc]
      else if(checkIfIsSpecialAttribute(attrName)){
        // distruct attribute name
        attrName = attrName.slice(1, attrName.length-1);

        // get really value
        // [mapping to view]
        const mapToView = REGEXP_ATTRIBUTES_MAP_TO_VIEW.test(attrValue);
        const mapToTarget = mapToView ? view : args;
        const path = mapToView ? attrValue.replace(REGEXP_ATTRIBUTES_MAP_TO_VIEW_REPLACEMENT, "") : attrValue;

        attrValue = _get(mapToTarget, path);
      }

    // shortcut attribute name, just like [disabled, checked]
    }else if(ATTRIBUTES_SHORTCUT_NAME[chunk]){
      attrName = chunk;
      attrValue = true;
    }

    if(attrName) attrObject[attrName] = attrValue;
  }

  return attrObject;
}
