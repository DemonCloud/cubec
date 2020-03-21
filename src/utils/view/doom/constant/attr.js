import { _eachArray, _lock } from "../../../usestruct";

// svg element extend attributes need use [dom.setAttributesNS]
export const ATTRIBUTES_SVG_NEED_USENAMESPACE = {
  "xlink:href": "http://www.w3.org/1999/xlink"
};

// svg element
export const ATTRIBUTES_SVG_EXTRA_FORK_RENDER_TEMPLATE = {
  class: "className.baseVal",
  className: "className.baseVal"
};

const ATTRIBUTES_FORK_RENDER_TEMPLATE = {
  for: 'htmlFor',
  class: 'className',
  style: 'style.cssText'
};

const ATTRIBUTES_NEED_SETATTRIBUTES = [
  "placeHolder",
  "maxLength",
  "minLength",
  "tabIndex",
  "cellSpacing",
  "cellPadding",
  "rowSpan",
  "xlink:href",
  "colSpan",
  "contentEditable",
  "useMap",
  "frameBorder",
  "valign",
  "align",
  "abbr",
  "axis",
  "width",
  "height",
  "max",
  "min",
  "href",
  "bgcolor",
  "link",
  "target",
  "reversed",
  "compact",
  "start",
  "coords",
  "char",
  "charoff",
  "charset",
  "hreflang",
  "download",
  "ping",
  "media",
  "type",
  "rel",
  "rev",
  "vlink",
  "alink",
  "background",
  "scrolling",
  "marginwidth",
  "marginheight",
  "frameborder",
  "noresize",
  "size",
  "rows",
  "cols",
  "src",
  "fill",
  "d",
];

const ATTRIBUTES_NEED_SETBOOLEANVALUES = [
  "checked",
  "disabled",
  "required",
  "readOnly",
  "selected",
  "controls",
  "ended",
  "muted",
  "hidden",
  "seeking",
  "paused",
  "loop",
  "autoPlay",
  "multiple",
  "autoFocus",
  "draggable",
  "spellCheck",
  "translate",
  "specified",
  "defer",
  "async",
];

// shortcut attributes [example: readonly, disabled]
const ATTRIBUTES_SHORTCUT_NAME = {
  // async: true
  // readonly
};
// attributes need set use [dom.setAttributes]
_eachArray(ATTRIBUTES_NEED_SETATTRIBUTES, function(attrName){
  const prefixRenderAttrName = attrName.toLowerCase();
  const value = "@"+prefixRenderAttrName;  // need set attributes

  ATTRIBUTES_FORK_RENDER_TEMPLATE[attrName] = value;
  ATTRIBUTES_FORK_RENDER_TEMPLATE[prefixRenderAttrName] = value;
});

// attributes need set as boolean values
_eachArray(ATTRIBUTES_NEED_SETBOOLEANVALUES, function(attrName){
  const prefixRenderName = attrName.toLowerCase();
  const value = "*"+prefixRenderName;
  ATTRIBUTES_FORK_RENDER_TEMPLATE[attrName] = value;
  ATTRIBUTES_FORK_RENDER_TEMPLATE[prefixRenderName] = value;

  ATTRIBUTES_SHORTCUT_NAME[attrName] = true;
  if(prefixRenderName !== attrName) ATTRIBUTES_SHORTCUT_NAME[prefixRenderName] = true;
});

_lock(ATTRIBUTES_NEED_SETATTRIBUTES);
_lock(ATTRIBUTES_NEED_SETBOOLEANVALUES);
_lock(ATTRIBUTES_FORK_RENDER_TEMPLATE);
_lock(ATTRIBUTES_SHORTCUT_NAME);

export {
  ATTRIBUTES_NEED_SETATTRIBUTES,
  ATTRIBUTES_NEED_SETBOOLEANVALUES,
  ATTRIBUTES_FORK_RENDER_TEMPLATE,
  ATTRIBUTES_SHORTCUT_NAME,
}
