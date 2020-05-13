import {_decode, _lock, _eachArray, _eachObject, _map, empty} from "../../../usestruct";
import { PATCHES_NAME_OPERATE } from '../constant/patch';

import createElement from './createElement';
import recycle from './recycle';
import forkClearAttributes from "../utils/forkClearAttributes";
import forkSetterAttributes from "../utils/forkSetterAttributes";

// patch to execute
const patchExecute = _lock({

  // null
  [PATCHES_NAME_OPERATE.NULL]: function(){  //0
    console.warn("[cubec view] view instance diff render get expect null patch");
  },

  // replace to new Element DOM
  [PATCHES_NAME_OPERATE.REPLACE]: function(patch, view, args){  //1
    let t = patch.s;
    if (t && t.parentNode){
      let n = createElement(patch.tag, view, args);
      t.parentNode.replaceChild(n, t);
      recycle(patch.org);
    }
  },

  // append new Element DOM
  [PATCHES_NAME_OPERATE.APPEND]: function(patch, view, args){  //2
    let t = patch.s;

    if (t){
      let n = createElement(patch.tag, view, args);
      t.appendChild(n);
    }
  },

  // remove Element DOM
  [PATCHES_NAME_OPERATE.REMOVE]: function(patch){  //3
    let t = patch.s;
    if (t && t.parentNode) {
      t.parentNode.removeChild(t);
      recycle(patch.org);
    }
  },

  // modify text
  [PATCHES_NAME_OPERATE.MODIFY_TEXT]: function(patch){  //4
    let t = patch.s;
    if(t) t.textContent = _decode(patch.c);
  },

  // change text
  [PATCHES_NAME_OPERATE.WITH_TEXT]: function(patch){  //5
    let t = patch.s;
    if(t) t.textContent = _decode(patch.c);
  },

  // remove text
  [PATCHES_NAME_OPERATE.REMOVE_TEXT]: function(patch, view, args){  //6
    let t = patch.s;

    // some optimzer for custom render
    if(t){
      recycle(patch.org);

      t.textContent = empty;
      // new not replace text
      let n = createElement(patch.tag, view, args);

      while(n.childNodes.length)
        t.appendChild(n.firstChild);
    }
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

  // remove origin element attributes
  [PATCHES_NAME_OPERATE.REMOVE_ATTRIBUTE]: function(patch){  //9
    _eachObject(patch.o, function(value, key) {
      forkClearAttributes(patch.s, key, value);
    });
  },

  // update plugin render (same plugin)
  [PATCHES_NAME_OPERATE.UPDATE_PLUGIN]: function(patch, view, args) { //10
    // org root elm, will not create new elm
    let t = patch.s;
    // use prev render hook
    if(patch.org._plugin){
      patch.tag._plugin = patch.org._plugin;
      patch.tag._pluginType = patch.org._pluginType;
    }
    // directly create patch update render plugin
    if(t) createElement(patch.tag, patch.view, args, t);
  }

});

// map tree path to real element
const mapTreeNode = function(orgTargetElement, s) {
  let target,
    i = 0,
    p = orgTargetElement.children;

  for (; i < s.length; i++) {
    if (p[s[i]]) {
      target = p[s[i]];
      p = target.children;
    } else break;
  }

  return target;
};

// export applyPatch action
const applyPatch = function(rootElement, patches, view, args) {
  // console.log("usePatches", patches);
  const execPatches = _map(
    patches,
    function(patch) {
      patch.path = patch.s;
      // find real target node
      patch.s = mapTreeNode(rootElement, patch.s);

      return patch;
    },
  );

  // debuglog
  // console.log("usePatches", patches, "execPatches", execPatches);
  // fork patches action
  _eachArray(execPatches,function(patch) {
    patchExecute[patch.t](patch, view, args);
  });
};

export default applyPatch;

