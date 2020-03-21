import {
  _decode,
  _eachArray,
  _eachObject,
  _extend,
  _get,
  _idt,
  _isFn,
  _isObject,
  _isString,
  _trim,
  empty
} from "../../../usestruct";

import { SVG_XML_NAMESPACE } from '../constant/svg';
import pluginList from "../constant/pluginList";
import renderSlot from "./renderSlot";
import forkSetterAttributes from "../utils/forkSetterAttributes";

const CREATE_PLUGIN_FORK_VIEWPROPS = "this.";
const REGEXP_CREATE_PLUGIN_FORK_VIEWPROPS = /^this\./;

const createPluginDynamicProps = function(attrs, view, data) {
  let props = {};

  _eachObject(attrs, function(v,k){
    if(k[0] === "#"){
      k = k.substr(1);
      v = REGEXP_CREATE_PLUGIN_FORK_VIEWPROPS.test(v) ?
        _get(view, v.replace(CREATE_PLUGIN_FORK_VIEWPROPS,"")) :
        _get(data||{}, v);
    }
    props[k] = v;
  });

  return props;
};

const createPluginProps = function(elm, obj, view, args){
  return {
    view: view,
    root: elm,
    refs: {},
    name: obj.tagName,
    prefix: empty,
    props: _extend(
      createPluginDynamicProps(obj.attributes, view, args),
      { children: obj.children }
    )
  };
};

// create new DOM Element
const createElement =  function(obj, view, args, isUpdateSlot=false, isUpdatePlugin=false) {
  let elm = isUpdateSlot || isUpdatePlugin;

  // is not SLOT or PLUGIN
  if(!elm) {
    elm = obj.isRoot ? document.createDocumentFragment() :
      obj.isSvg ? document.createElementNS(SVG_XML_NAMESPACE, obj.tagName) :
      document.createElement(obj.tagName);
  }

  // registered view.refs Update
  if (obj.attributes && obj.attributes.ref){
    view.refs[obj.attributes.ref] = elm;

    if(view.view && view.view.refs) view.view.refs[obj.attributes.ref] = elm;
  }

  // set all Attribute
  if(obj.attributes) {
    _eachObject(obj.attributes, function (value, key) {
      forkSetterAttributes(elm, key, value);
    });
  }

  // parse if it's <slot>
  // slot is significative in [ax.view]
  if (view && obj.isSlot && obj.text) {
    const slotStr = _isString(obj.text) ? obj.text : '';

    if(slotStr){
      const slotParse = _trim(slotStr).split('::');
      const slotName = _trim(slotParse[0] || "");
      const slotDataPath = _trim(slotParse[1] || "");
      const getSlotRender = _get(view, slotName);

      if(getSlotRender){
        const slotData =
          (slotDataPath && _isObject(args)) ?
          _get(args, slotDataPath) : args;  // dell with slotData shortcut
        const recycler = renderSlot(getSlotRender, elm, view, slotData);

        if(_isFn(recycler)) view._ass(_idt).push(recycler);
      }
      // view._ass(_idt).push(slot);
    }

    if(elm.__replaceToSlotRoot){
      const slotElm = elm.__replaceToSlotRoot;
      delete elm.__replaceToSlotRoot;
      return slotElm;
    }

    return elm;
  }

  // parse if it's [cubec.view.plugin] register
  if (view && obj.isPlug){
    const getPluginRender = pluginList[obj.tagName];

    return getPluginRender(elm, createPluginProps(elm, obj, view, args), view, args, isUpdatePlugin);
  }

  if (obj.text) {
    // pureText content
    elm.textContent = _decode(obj.text);
  }else if (obj.child.length) {
    _eachArray(obj.child, function(child) {
      const newChild = createElement(child, view, args);
      elm.appendChild(newChild);
    }, this);
  }

  return elm;
};

export default createElement;
