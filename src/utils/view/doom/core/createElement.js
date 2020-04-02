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

const parserPluginProps = function(attrs, view, data) {
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
    __cubec_plugin__: true,
    __cubec_parent_view__: view,
    root: elm,
    refs: {},
    name: obj.tagName,
    prefix: empty,
    props: _extend(
      parserPluginProps(obj.attributes, view, args),
      { children: obj.children }
    )
  };
};

// create new DOM Element
const createElement =  function(obj, view, args, isUpdateSlot=false, isUpdatePlugin=false) {
  let elm = isUpdateSlot || isUpdatePlugin;
  const createPlugin = view.__cubec_plugin__ && view.__cubec_parent_view__;

  // is not SLOT or PLUGIN
  if(!elm) {
    elm = obj.isRoot ? document.createDocumentFragment() :
      obj.isSvg ? document.createElementNS(SVG_XML_NAMESPACE, obj.tagName) :
      document.createElement(obj.tagName);
  }

  // registered view.refs Update
  if (obj.attributes){
    // set attributes
    _eachObject(obj.attributes, function (value, key) {
      forkSetterAttributes(elm, key, value);
    });

    // set ref
    if(obj.attributes.ref){
      const refName = obj.attributes.ref;

      // set in refs at orgView
      view.refs[refName] = elm;

      // in cubec.plugin.scope
      // exist refs scope
      if(createPlugin){
        const children = view.props.children;
        // check plugin childrens [exist this refs]
        if(children &&
          _isString(children) &&
          (children.indexOf(`'${refName}'`) > -1 ||
           children.indexOf(`"${refName}"`) > -1 )){
          // childrens exist should write in ParentCubecView
          view.__cubec_parent_view__.refs[refName] = elm;
        }
      }

    }
  }


  // parse if it's <slot>
  // slot is significative in [cubec.view.createSlot]
  if (view && obj.isSlot && obj.text) {
    const slotStr = _isString(obj.text) ? obj.text : '';

    if(slotStr){
      const slot = _trim(slotStr).split('::');
      const slotName = _trim(slot[0] || "");
      const slotDataPath = _trim(slot[1] || "");
      const viewSlotRender = _get(view._assu(_idt), slotName);
      const viewSlotRecycler = view._assr(_idt);

      if(viewSlotRender){
        const renderData = (slotDataPath && _isObject(args)) ? _get(args, slotDataPath) : args;
        const renderRecycler = renderSlot(viewSlotRender, elm, view, renderData);

        if(_isFn(renderRecycler)) viewSlotRecycler[slotName] = renderRecycler;
      }
    }

    // replace to slot.root
    if(elm.__replaceToSlotRoot){
      const slotElm = elm.__replaceToSlotRoot;
      delete elm.__replaceToSlotRoot;
      return slotElm;
    }

    return elm;
  }

  // parse if it's [cubec.view.createPlugin] register
  if (view && obj.isPlug){
    const getPluginRender =
      _get(view._aspu(_idt), obj.tagName) ||
      _get(pluginList, obj.tagName);

    // start plugin render;
    return getPluginRender(
      elm,
      createPluginProps(elm, obj, view, args),
      view,
      args,
      isUpdatePlugin
    );
  }

  if (obj.text) {
    // pureText content
    elm.textContent = _decode(obj.text);

  // deep create child elements
  }else if (obj.child.length) {
    _eachArray(obj.child, function(child) {
      const newChild = createElement(child, view, args);
      elm.appendChild(newChild);
    }, this);
  }

  return elm;
};

export default createElement;
