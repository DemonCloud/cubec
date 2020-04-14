import { PATCHES_NAME_OPERATE } from '../constant/patch';

// create selector to mapping real DOM Tree
const createSelector = function(orgTreeNode) {
  let path = [orgTreeNode.i];
  while ((orgTreeNode = orgTreeNode.parent))
    if (orgTreeNode.i !== void 0)
      path.unshift(orgTreeNode.i);
  return path;
};

// orgTreeNode
// newTagTreeNode
// patch TYPE
// currentType
// renderData
const createPatch = function(org, tag, type, view, args) {

  let patch,
      sl = createSelector(org);

  switch (type) {
    case PATCHES_NAME_OPERATE.REPLACE: //1
    case PATCHES_NAME_OPERATE.APPEND: //2
    case PATCHES_NAME_OPERATE.REMOVE:  //3
    case PATCHES_NAME_OPERATE.REMOVE_TEXT: //6
      patch = {t: type, s: sl, org: org, tag: tag};
      break;

    case PATCHES_NAME_OPERATE.MODIFY_TEXT: //4
    case PATCHES_NAME_OPERATE.WITH_TEXT:  //5
      patch = {t: type, s: sl, c: tag.text};
      break;

    case PATCHES_NAME_OPERATE.ADD_ATTRIBUTE: //7
    case PATCHES_NAME_OPERATE.MODIFY_ATTRIBUTE: //8
    case PATCHES_NAME_OPERATE.REMOVE_ATTRIBUTE:  //9
      patch = {t: type, s: sl, a: tag.attributes, o: org.attributes};
      break;

    case PATCHES_NAME_OPERATE.UPDATE_PLUGIN: //10
      patch = {t: type, s: sl, org: org, tag: tag, view: view};
      break;

    default: // null expect
      patch = {t: PATCHES_NAME_OPERATE.NULL};
  }

  return patch;
};

export default createPatch;

