import { _decode, _isString, _set } from "../../../usestruct";
import {
  ATTRIBUTES_FORK_RENDER_TEMPLATE,
  ATTRIBUTES_SVG_NEED_USENAMESPACE,
  ATTRIBUTES_SVG_EXTRA_FORK_RENDER_TEMPLATE
} from '../constant/attr';

const REGEXP_ATTRIBUTES_DEFAULT_ATTR = /^default[^\s]+/i;

// adapter attribute setter
const forkSetterAttributes = function(elm, attr, values) {
  let attrName = ATTRIBUTES_FORK_RENDER_TEMPLATE[attr] || attr;

  const isSvgElement = window.SVGElement ? elm instanceof SVGElement : false;
  const val = _isString(values) ? _decode(values) : values;

  // if(attrName === "*checked"){
  //   console.log("*checked", val);
  // }

  // with defaultValue, must redo default setting
  if (REGEXP_ATTRIBUTES_DEFAULT_ATTR.test(attrName)) {
    // is defaultAttr
    attrName = attrName.slice(7).toLowerCase();
    let notExistDefaultValue = elm.getAttribute(attrName) || elm[attrName];

    // recall forkSetterAttributes
    if (notExistDefaultValue == null || notExistDefaultValue === '')
      return forkSetterAttributes(elm, attrName, val);
  }
  else if (attrName[0] === '*')
    _set(elm, attrName.slice(1), (val === 'true' || val === true));

  else if (attrName[0] === '@') {
    let getAttrName = attrName.slice(1); // split @ char
    const existNameSpace = ATTRIBUTES_SVG_NEED_USENAMESPACE[getAttrName];

    // SVG Element
    if(isSvgElement){
      getAttrName = ATTRIBUTES_SVG_EXTRA_FORK_RENDER_TEMPLATE[getAttrName] || getAttrName;
    }

    return existNameSpace ? elm.setAttributeNS(existNameSpace, getAttrName, val) : elm.setAttribute(getAttrName, val);
  } else {
    const existNameSpace = ATTRIBUTES_SVG_NEED_USENAMESPACE[attrName];

    // SVG Element
    if(isSvgElement){
      attrName = ATTRIBUTES_SVG_EXTRA_FORK_RENDER_TEMPLATE[attrName] || attrName;
    }

    return existNameSpace ? elm.setAttributeNS(existNameSpace, attrName, val) : _set(elm, attrName, val);
  }
};

export default forkSetterAttributes;
