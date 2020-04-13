import {
  _decode,
  _eachArray,
  _eachObject,
  _merge,
  _get,
  _idt,
  _isFn,
  _isObject,
  _isString,
  _trim,
  empty,
  slotPartSign
} from "../../../usestruct";

import { SVG_XML_NAMESPACE } from '../constant/svg';
import pluginList from "../constant/pluginList";
import renderSlot from "./renderSlot";
import forkSetterAttributes from "../utils/forkSetterAttributes";
import forkSetterPartAttributes from '../utils/forkSetterPartAttributes';

// create new DOM Element
const createElement =  function(treeNode, view, args, isUpdateSlot=false, isUpdatePlugin=false) {
  let elm = isUpdateSlot ||
    isUpdatePlugin ||
    (treeNode.isRoot ? document.createDocumentFragment() :
    treeNode.isSvg ? document.createElementNS(SVG_XML_NAMESPACE, treeNode.tagName) :
    document.createElement(treeNode.tagName));

  // is create plugin view
  const createPlugin = view.__cubec_plugin__ && view.__cubec_parent_view__;

  // registered view.refs Update
  if (treeNode.attributes && treeNode.attributes.ref){
    // ref name
    const refName = treeNode.attributes.ref;

    // set in refs at orgView
    // view.refs[refName] = elm;

    // in cubec.plugin.scope
    // exist refs scope
    if(createPlugin && view.props.children){
      // get children content
      const children = view.props.children;
      // search refs
      const refSearch = new RegExp(`ref\\s*=\\s*[\'\"]?${refName}[\'\"]?`);

      // [check] children ref version
      // console.log(children, children.search(refSearch));

      // check plugin childrens [exist this refs]
      if(children.search(refSearch) > 0)
        // childrens exist should write in ParentCubecView
        view.__cubec_parent_view__.refs[refName] = elm;
      else
        view.refs[refName] = elm;

    }else{
      // set in refs at orgView
      view.refs[refName] = elm;
    }
  }

  // parse if it's <slot>
  // slot is significative in [cubec.view.createSlot]
  if (view && treeNode.isSlot && treeNode.text) {
    const slotStr = _isString(treeNode.text) ? treeNode.text : '';

    _eachObject(treeNode.attributes, function (value, key) {
      forkSetterPartAttributes(elm, key, value);
    });

    if(slotStr){
      // parser slot
      const slot = _trim(slotStr).split(slotPartSign);
      const slotName = _trim(slot[0] || empty);
      const slotDataPath = _trim(slot[1] || empty);
      const viewSlotRender = _get(view._assu(_idt), slotName);
      const viewSlotRecycler = view._assr(_idt);

      if(viewSlotRender){
        const renderData =
          (slotDataPath && _isObject(args)) ?
          _get(args, slotDataPath) : args;

        // update current use props;
        viewSlotRender.props = _merge(
          viewSlotRender.defaultProps || {},
          treeNode.attributes
        );

        const renderRecycler = renderSlot(
          viewSlotRender,
          elm,
          view,
          renderData
        );

        if(_isFn(renderRecycler))
          viewSlotRecycler[slotName] = renderRecycler;
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
  if (view && treeNode.isPlug){
    const getPluginRender =
      _get(view._aspu(_idt), treeNode.tagName) ||
      _get(pluginList, treeNode.tagName);

    _eachObject(treeNode.attributes, function (value, key) {
      forkSetterPartAttributes(elm, key, value);
    });

    // start plugin render;
    return getPluginRender(
      elm, {
        __cubec_plugin__: true,
        __cubec_parent_view__: view,

        root: elm,
        refs: {},
        name: treeNode.tagName,
        prefix: empty,
        props: _merge(
          treeNode.attributes,
          { children: treeNode.children }
        )
      },
      view,
      args,
      isUpdatePlugin
    );
  }

  // set attributes for normal elm
  _eachObject(treeNode.attributes, function (value, key) {
    forkSetterAttributes(elm, key, value);
  });

  // tree node text
  if (treeNode.text) {
    // pureText content
    elm.textContent = _decode(treeNode.text);

  // deep create child elements
  }else if (treeNode.child.length) {
    _eachArray(treeNode.child, function(child) {
      const newChild = createElement(child, view, args);
      elm.appendChild(newChild);
    }, this);
  }

  return elm;
};

export default createElement;

