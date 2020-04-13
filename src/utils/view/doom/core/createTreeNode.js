import { _idt, _trim } from '../../../usestruct';
import { SVG_TAGNAMES_MAPPING } from '../constant/svg';
import pluginList from "../constant/pluginList";

import parserAttributes from '../utils/parseAttributes';

const REGEXP_PARSER_TAGNAME = /\s/im;

// create TreeNode
const createTreeNode = function(str, parent, view, id, args) {
  const tagSplit = str.search(REGEXP_PARSER_TAGNAME);
  const existAttributes = (tagSplit > 0);
  const tagName = existAttributes ? str.slice(0, tagSplit) : str;
  const attributes = existAttributes ? _trim(str.slice(tagSplit+1)) : null;
  // new treeNode
  const node = { tagName: tagName, child: [], id: id };

  if(parent) node.parent = parent;

  // cubec slot tag
  if(tagName === 'slot')
    node.isSlot = true;
  // cubec plugin register
  else if(
    (view._aspu && view._aspu(_idt)[tagName]) ||
    pluginList[tagName])
    node.isPlug = true;
  // svg element is not HTML Web Standard
  else if(
    (parent && parent.isSvg) ||
    SVG_TAGNAMES_MAPPING[tagName]
  ){
    node.tagName = SVG_TAGNAMES_MAPPING[tagName] || tagName;
    node.isSvg = true;
  }

  if (attributes) {
    // parse attribute
    const attrs = parserAttributes({}, attributes, view, args);
    // embed attribute to TreeNode
    if(attrs) node.attributes = attrs;
  }

  return node;
};

export default createTreeNode;
