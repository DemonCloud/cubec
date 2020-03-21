import {
  ATTRIBUTES_SVG_NEED_USENAMESPACE,
  ATTRIBUTES_FORK_RENDER_TEMPLATE,
  ATTRIBUTES_SVG_EXTRA_FORK_RENDER_TEMPLATE
} from "../constant/attr";
import {
  _set,
  _get
} from '../../../usestruct';

// adapter attribute clearer
const forkClearAttributes = function(elm, attr) {
  let attrName = ATTRIBUTES_FORK_RENDER_TEMPLATE[attr] || attr;
  const isSvgElement = window.SVGElement ? elm instanceof SVGElement : false;

  // need attrNeedSetAttributes
  if(attrName[0] === "@"){
    let getAttrName = attrName.slice(1);
    const existNameSpace = ATTRIBUTES_SVG_NEED_USENAMESPACE[getAttrName];

    // SVG Element
    if(isSvgElement){
      getAttrName = ATTRIBUTES_SVG_EXTRA_FORK_RENDER_TEMPLATE[getAttrName] || getAttrName;
    }

    existNameSpace ? elm.removeAttributeNS(existNameSpace, getAttrName) : elm.removeAttribute(getAttrName);
  }else if(attrName[0] === "*"){
    let getAttrName = attrName.slice(1);
    const existNameSpace = ATTRIBUTES_SVG_NEED_USENAMESPACE[getAttrName];

    existNameSpace ? elm.removeAttributeNS(existNameSpace, getAttrName) : elm.removeAttribute(getAttrName);
  } else if(elm[attrName] && !delete elm[attrName]) {
    try { elm[attrName] = null; } catch (e) { /*empty*/ }
  }else if (_get(elm, attrName) != null)
    try { _set(elm, attrName, null); } catch (e) { /*empty*/ }
  else{
    elm.removeAttribute(attrName);
  }
};

export default forkClearAttributes;
