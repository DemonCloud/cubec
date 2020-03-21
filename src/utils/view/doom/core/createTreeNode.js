import { SVG_TAGNAMES_MAPPING } from '../constant/svg';
import { ATTRIBUTES_SHORTCUT_NAME } from '../constant/attr';
import pluginList from "../constant/pluginList";

const REGEXP_ATTRIBUTES_EXECUTE = /(\S+)=["'](.*?)["']|([\w-]+)/gi;

// create TreeNode
const createTreeNode = function(str, view, id, args) {
  let arr = str.split(' '),
    tagName = arr.shift(),
    attributes = arr.join(' '),
    elm = {tagName, child: [], id};

  // cubec slot tag
  if (tagName === 'slot') elm.isSlot = true;  // define is view slot
  // cubec plugin register
  else if(pluginList[tagName]) elm.isPlug = true; // define is register view plugin
  // svg element is not HTML Web Standard
  else if(SVG_TAGNAMES_MAPPING[tagName]){
    elm.tagName = SVG_TAGNAMES_MAPPING[tagName];
    elm.isSvg = true;
  }

  if (attributes) {
    let attrs = {}, s, tg;
    while ((s = REGEXP_ATTRIBUTES_EXECUTE.exec(attributes))) {
      if (!s[1]) {
        // shortcut props in html5
        if(ATTRIBUTES_SHORTCUT_NAME[s[0]]){
          attrs[s[0]] = true;
        } else if(!tg) {
          tg = s[0];
        } else {
          attrs[tg] = s[0];
          tg = 0;
        }
      } else {
        // set attribute key/value
        attrs[s[1]] = s[2];
      }
    }

    // embed attribute to TreeNode
    elm.attributes = attrs;
  }

  return elm;
};

export default createTreeNode;
