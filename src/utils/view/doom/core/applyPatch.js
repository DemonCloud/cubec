import {_decode, _eachArray, _eachObject, _map, _noop} from "../../../usestruct";
import { PATCHES_NAME_OPERATE } from '../constant/patch';

import createElement from './createElement';
import forkClearAttributes from "../utils/forkClearAttributes";
import forkSetterAttributes from "../utils/forkSetterAttributes";

// patch to execute
const patchExecute = {
  // null
  [PATCHES_NAME_OPERATE.NULL]: _noop, //0,

  // replace to new Element DOM
  [PATCHES_NAME_OPERATE.REPLACE]: function(patch){ //1
    let t = patch.s;
    if (t && t.parentNode) t.parentNode.replaceChild(patch.n, t);
  },

  // append new Element DOM
  [PATCHES_NAME_OPERATE.APPEND]: function(patch){  //2
    let t = patch.s;
    if (t) t.appendChild(patch.n);
  },

  // remove Element DOM
  [PATCHES_NAME_OPERATE.REMOVE]: function(patch){  //3
    let t = patch.s;
    if (t.parentNode) t.parentNode.removeChild(t);
  },

  // modify text and SLOT
  [PATCHES_NAME_OPERATE.MODIFY_TEXT]: function(patch){  //4
    let t = patch.s;
    if (patch.isSlot)
      return t.parentNode.replaceChild(patch.n, t);
    t.textContent = _decode(patch.c);
  },

  // change text and SLOT
  [PATCHES_NAME_OPERATE.WITH_TEXT]: function(patch){  //5
    let t = patch.s;
    if (patch.isSlot)
      return t.parentNode.replaceChild(patch.n, t);
    t.textContent = _decode(patch.c);
  },

  // remove text
  [PATCHES_NAME_OPERATE.REMOVE_TEXT]: function(patch){  //6
    let t = patch.s; t.innerHTML = '';
    while(patch.n.childNodes.length)
      t.appendChild(patch.n.firstChild);
  },

  // add Element attributes
  [PATCHES_NAME_OPERATE.ADD_ATTRIBUTE]: function(patch){  //7
    _eachObject(patch.a, function(value, key) {
      forkSetterAttributes(patch.s, key, value);
    });
  },

  // modify Element attributes
  [PATCHES_NAME_OPERATE.MODIFY_ATTRIBUTE]: function(patch) {  //8
    let t = patch.s;
    let s = {};

    // same key between new Element and old Element
    _eachObject(patch.a, function(v, k) {
      if (patch.o[k] === v) s[k] = true;
    });

    _eachObject(patch.o, function(value, key) {
      if (!(key in s)) forkClearAttributes(t, key, value);
    });
    _eachObject(patch.a, function(value, key) {
      if (!(key in s)) forkSetterAttributes(t, key, value);
    });
  },

  // remove Element attributes
  [PATCHES_NAME_OPERATE.REMOVE_ATTRIBUTE]: function(patch){  //9
    _eachObject(patch.a, function(value, key) {
      forkClearAttributes(patch.s, key, value);
    });
  },

  // update SLOT component
  [PATCHES_NAME_OPERATE.UPDATE_SLOT]: function(patch, args){  //10
    let c = patch.c;
    let o = patch.o;
    let t = patch.s;

    if(c === o){
      // directly createPatch updateslot
      createElement(patch.tag, patch.view, args, t);
    }else{
      t.parentNode.replaceChild(createElement(patch.tag, patch.view, args),t);
    }
  },

  // update Plugin register
  [PATCHES_NAME_OPERATE.UPDATE_PLUGIN]: function(patch, args) { //11
    let t = patch.s;
    // directly createPatch updateplugin
    createElement(patch.tag, patch.view, args, false, t);
  }
};

// map tree path to real element
const mapTreeNode = function(orgTargetElement, s) {
  let target,
    i = 0,
    p = orgTargetElement.children;

  for (; i < s.length; i++) {
    if (p[s[i]]) {
      target = p[s[i]];
      p = target.children;
    } else { break; }
  }

  return target;
};

const applyPatch = function(orgTargetElement, patches, args) {
  // console.log("usePatches", patches);
  const execPatches = _map(
    patches,
    function(patch) {
      patch.path = patch.s;
      patch.s = mapTreeNode(orgTargetElement, patch.s);
      return patch;
    },
  );

  // debuglog
  // console.log("usePatches", patches, "execPatches", execPatches);
  // fork patches action
  _eachArray(execPatches,function(patch) {
    const execFork = patchExecute[patch.t];
    return execFork.call(orgTargetElement, patch, args);
  });
};

export default applyPatch;

