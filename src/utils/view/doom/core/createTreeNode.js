import { _idt, _trim } from '../../../usestruct';
import { SVG_TAGNAMES_MAPPING } from '../constant/svg';
import pluginList from "../constant/pluginList";

import parserAttributes from '../utils/parseAttributes';

const spaceSplit = ' ';

// create TreeNode
const createTreeNode = function(str, parent, view, id, args) {

  let arr = str.split(spaceSplit),
    tagName = arr.shift(), // post tagName first
    attributes = _trim(arr.join(spaceSplit)),
    elm = { tagName: tagName, child: [], id: id };

  if(parent)
    elm.parent = parent;

  // cubec slot tag
  if (tagName === 'slot')
    elm.isSlot = true;
  // cubec plugin register
  else if(
    (view._aspu && view._aspu(_idt)[tagName]) ||
    pluginList[tagName])
    elm.isPlug = true;
  // svg element is not HTML Web Standard
  else if(
    (parent && parent.isSvg) ||
    SVG_TAGNAMES_MAPPING[tagName]
  ){
    elm.tagName = SVG_TAGNAMES_MAPPING[tagName] || tagName;
    elm.isSvg = true;
  }

  if (attributes) {
    let attrs = parserAttributes({}, attributes, view, args);
    // embed attribute to TreeNode
    if(attrs) elm.attributes = attrs;
  }

  // console.log(elm);

  return elm;
};

export default createTreeNode;
