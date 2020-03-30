import { _eq } from "../../../usestruct";
import { PATCHES_NAME_OPERATE } from '../constant/patch';
import createPatch from './createPatch';

const __EMPTY__ = false;

// tree diff algorithm
const treeDiff = function(org, tag, patch, orgParent, tagParent, view, args){
  if (org === void 0)
    // new node
    patch.unshift(createPatch(orgParent, tag, PATCHES_NAME_OPERATE.APPEND, view, args));  //2
  else if (tag === void 0)
    // remove node
    patch.push(createPatch(org, __EMPTY__, PATCHES_NAME_OPERATE.REMOVE, view, args)); // 3
  else if (org.tagName === tag.tagName) {
    if (tag.isSlot && org.isSlot && tag.id === org.id){
      // update slot
      patch.push(createPatch(org, tag, PATCHES_NAME_OPERATE.UPDATE_SLOT, view, args)); // 10
      return patch;
    }else if(tag.isSlot || org.isSlot){
      patch.push(createPatch(org, tag, PATCHES_NAME_OPERATE.WITH_TEXT, view, args)); // 5 adapter slot
      return patch;
    }

    if(tag.isPlug || org.isPlug){
      // update plugin
      patch.push(createPatch(org, tag, PATCHES_NAME_OPERATE.UPDATE_PLUGIN, view, args));
      return patch;
    }

    // modify attributes
    if (!_eq(org.attributes, tag.attributes)) {
      if (org.attributes && tag.attributes)
        patch.push(createPatch(org, tag, PATCHES_NAME_OPERATE.MODIFY_ATTRIBUTE, view, args)); //8
      else if (!org.attributes)
        patch.push(createPatch(org, tag, PATCHES_NAME_OPERATE.ADD_ATTRIBUTE, view, args));  //7
      else if (!tag.attributes)
        patch.push(createPatch(org, tag, PATCHES_NAME_OPERATE.REMOVE_ATTRIBUTE, view, args)); //9
    }

    // some node, maybe modify text
    if (org.text !== tag.text) {
      if (org.text && tag.text && org.text !== tag.text)
        patch.push(createPatch(org, tag, PATCHES_NAME_OPERATE.MODIFY_TEXT, view, args)); //4
      else if (!org.text) patch.push(createPatch(org, tag, PATCHES_NAME_OPERATE.WITH_TEXT, view, args)); //5
      // if org has text, but tag not have text (maybe tag has child elements)
      else if (!tag.text) patch.push(createPatch(org, tag, PATCHES_NAME_OPERATE.REMOVE_TEXT, view, args)); //6
      return patch;
    }

    // with child diff
    // optimzer patch at child diff
    let i,
      o = org.child.length,
      t = tag.child.length;

    // There is an algorithm problem
    // and if you need the smallest patcher -
    // you need to make extreme comparisons and optimizations to diff child nodes
    // but it also leads to more cycles and complexity
    // *will rebuild using some algorithm with reduce the patcher
    if (o || t) {
      // org < tag ( add tag )
      if (o < t) {
        // don't be naive. There are order problems
        for (i = o; i < t; i++)
          patch.push(createPatch(org, tag.child[i], PATCHES_NAME_OPERATE.APPEND, view, args));  //2
        for (i = o; i--; )
          treeDiff(org.child[i], tag.child[i], patch, org, tag, view, args);

        // org > tag ( exist remove tag )
      } else if (o > t) {
        for (i = o - 1; i >= t; i--)
          patch.push(createPatch(org.child[i], __EMPTY__, PATCHES_NAME_OPERATE.REMOVE, view, args)); //3
        for (i = t; i--; )
          treeDiff(org.child[i], tag.child[i], patch, org, tag, view, args);
      } else {
        // org === tag ( modify )
        for (i = Math.max(o, t); i--; )
          treeDiff(org.child[i], tag.child[i], patch, org, tag, view, args);
      }
    }
  } else if (org.tagName !== tag.tagName) {
    patch.push(createPatch(org, tag, PATCHES_NAME_OPERATE.REPLACE, view, args)); //1
  }

  return patch;
};

export default treeDiff;

