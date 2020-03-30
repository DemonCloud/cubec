import { PATCHES_NAME_OPERATE } from '../constant/patch';
import createElement from "./createElement";

// create selector to mapping real DOM Tree
const createSelector = function(orgTreeNode) {
  let path = [orgTreeNode.i];
  while ((orgTreeNode = orgTreeNode.parent)) if (orgTreeNode.i !== void 0) path.unshift(orgTreeNode.i);
  return path;
};

// orgTreeNode
// newTagTreeNode
// patch TYPE
const createPatch = function(org, tag, type, view, args) {
  let node,
      patch,
      sl = createSelector(org);
  let isSlot = tag.isSlot;

  switch (type) {
    case PATCHES_NAME_OPERATE.REPLACE: //1
      node = createElement(tag, view, args);
      patch = {t: PATCHES_NAME_OPERATE.REPLACE, s: sl, n: node};
      break;
    case PATCHES_NAME_OPERATE.APPEND: //2
      node = createElement(tag, view, args);
      patch = {t: PATCHES_NAME_OPERATE.APPEND, s: sl, n: node};
      break;
    case PATCHES_NAME_OPERATE.REMOVE:  //3
      patch = {t: PATCHES_NAME_OPERATE.REMOVE, s: sl};
      break;
    case PATCHES_NAME_OPERATE.MODIFY_TEXT: //4
      patch = {t: PATCHES_NAME_OPERATE.MODIFY_TEXT, s: sl, c: tag.text, isSlot: isSlot};
      if (isSlot) patch.n = createElement(tag, view, args);
      break;
    case PATCHES_NAME_OPERATE.WITH_TEXT:  //5
      patch = {t: PATCHES_NAME_OPERATE.WITH_TEXT, s: sl, c: tag.text, isSlot: isSlot};
      if (isSlot) patch.n = createElement(tag, view, args);
      break;
    case PATCHES_NAME_OPERATE.REMOVE_TEXT: //6
      node = createElement(tag, view, args);
      patch = {t: PATCHES_NAME_OPERATE.REMOVE_TEXT, s: sl, n: node};
      break;
    case PATCHES_NAME_OPERATE.ADD_ATTRIBUTE: //7
      patch = {t: PATCHES_NAME_OPERATE.ADD_ATTRIBUTE, s: sl, a: tag.attributes};
      break;
    case PATCHES_NAME_OPERATE.MODIFY_ATTRIBUTE: //8
      patch = {t: PATCHES_NAME_OPERATE.MODIFY_ATTRIBUTE, s: sl, a: tag.attributes, o: org.attributes};
      break;
    case PATCHES_NAME_OPERATE.REMOVE_ATTRIBUTE:  //9
      patch = {t: PATCHES_NAME_OPERATE.REMOVE_ATTRIBUTE, s: sl, a: org.attributes};
      break;
    case PATCHES_NAME_OPERATE.UPDATE_SLOT: //10
      patch = {t: PATCHES_NAME_OPERATE.UPDATE_SLOT, s: sl, c: tag.text, o: org.text, tag: tag, view: view };
      break;
    case PATCHES_NAME_OPERATE.UPDATE_PLUGIN: //11
      patch = {t: PATCHES_NAME_OPERATE.UPDATE_PLUGIN, s: sl, tag: tag, view: view };
      break;
    case PATCHES_NAME_OPERATE.NULL: // 0
      patch = {t: PATCHES_NAME_OPERATE.NULL};
      break;
    default: // null
      patch = {t: PATCHES_NAME_OPERATE.NULL};
  }

  return patch;
};

export default createPatch;

