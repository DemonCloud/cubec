import {
  _idt,
  _isFn,
  _merge,
  _decode,
  _eachArray,
  _eachObject,

  broken_object
} from "../../../usestruct";

import { SVG_XML_NAMESPACE } from '../constant/svg';
import pluginList from "../constant/pluginList";
import forkSetterAttributes from "../utils/forkSetterAttributes";
import forkSetterPartAttributes from '../utils/forkSetterPartAttributes';

const createPluginViewProps = function(base, treeNode){
  return _merge(
    base,
    treeNode.attributes,
    { children: treeNode.children }
  );
};

// create new DOM Element
const createElement =  function(treeNode, view, args, isUpdatePlugin=false) {
  let elm =
    isUpdatePlugin ||
    (treeNode.isRoot ? document.createDocumentFragment() :
     treeNode.isSvg ? document.createElementNS(SVG_XML_NAMESPACE, treeNode.tagName) :
     document.createElement(treeNode.tagName));

  // target create view event[id]
  elm._veid = view._vid;

  // registered view.refs Update
  if (treeNode.attributes){
    // set attributes for plugin
    if(treeNode.isPlug)
      _eachObject(treeNode.attributes, function (value, key) {
        forkSetterPartAttributes(elm, key, value);
      });
    // set attributes for normal elm
    else
      _eachObject(treeNode.attributes, function (value, key) {
        forkSetterAttributes(elm, key, value);
      });

    if(treeNode.attributes.ref){
      // set in refs at orgView
      view.refs[treeNode.attributes.ref] = elm;
    }
  }

  if(treeNode.isPlug){

    if(!isUpdatePlugin && !treeNode._plugin){
      // create new plugin render
      const selfPluginList = view._aspu(_idt);
      const renderPluginViewOpts =
        selfPluginList[treeNode.tagName] ||
        pluginList[treeNode.tagName];

      if(!renderPluginViewOpts){
        console.error('[cubec view] plugin', treeNode.tagName, treeNode);

        throw new Error(`[cubec view] plugin [${treeNode.tageName}] is not exist in self [view.plugin{}|global plugin] register`);
      }

      // custom render function
      if(_isFn(renderPluginViewOpts)){
        treeNode._plugin = { render: renderPluginViewOpts };
        treeNode._pluginType = 1;
        treeNode._recycler = treeNode._plugin.render(elm, args, createPluginViewProps(broken_object, treeNode));

        if(!_isFn(treeNode._recycler))
          console.warn("[cubec view] [plugin] case performance and optimizer, the [custom] render plugin should return recycle method[function]", treeNode.tagName);

      }else{
        treeNode._plugin = new view.constructor(renderPluginViewOpts);
        treeNode._pluginType = 2;
        treeNode._plugin.props = createPluginViewProps(treeNode._plugin.defaultProps, treeNode);
        treeNode._recycler = treeNode._plugin.mount(elm, args, true);
      }

    }else{
      // plugin update [custom render]
      if(treeNode._pluginType === 1){
        treeNode._recycler = treeNode._plugin.render(elm, args, createPluginViewProps(broken_object, treeNode));

        if(!_isFn(treeNode._recycler))
          console.warn("[cubec view] [plugin] case performance and optimizer, the [custom] render plugin should return recycle method[function]", treeNode.tagName);

      // plugin view update [view render]
      }else if(treeNode._pluginType === 2){
        treeNode._plugin.props = createPluginViewProps(treeNode._plugin.defaultProps, treeNode);
        treeNode._recycler = treeNode._plugin.render(args, true);
      }

    }

    return elm;
  }

  // tree node text
  if (treeNode.text) {
    // pureText content
    elm.textContent = _decode(treeNode.text);

  // deep create child elements
  }else if (treeNode.child.length) {

    _eachArray(treeNode.child, function(childNode) {
      elm.appendChild(createElement(childNode, view, args));
    });

  }

  return elm;
};

export default createElement;

