import {
  _axt,
  _axtc,
  _isFn,
  _eachObject,
  _extend,
  _cool,
  _isPlainObject,
  _createPrivate,
  _isString,

  broken_object,
  empty,
  eventNameSpace
} from "../../../usestruct";
import {bindDomEvent, removeDomEvent} from "../../domEventSystem";
import { emit, off, on } from "../../../universalEvent";
import { DOCUMENT_TAGS_SHORTCUT } from '../constant/tags';
import pluginList from "../constant/pluginList";
import parseRenderData from '../utils/parseRenderData';

import parser from './parser';
import createElement from './createElement';
import applyPatch from './applyPatch';
import treeDiff from './treeDiff';

const createPluginEvents = function(root, newProps, events) {
  // remove event
  off.call(root);
  removeDomEvent(newProps);

  // rebind events
  _eachObject(events, function(callback,event){
    event = event.split(eventNameSpace);
    const eventName = event[0];
    const eventSelector = event[1];
    if(event.length === 1)
      return on.call(root, eventName, callback.bind(newProps));
    return bindDomEvent(newProps, eventName, eventSelector, callback);
  });
};

const createPluginRender = function(name, pugOptions){
  const createThis = {};

  const pluginRenderToString = pugOptions.cache ?
    _axtc(pugOptions.render || pugOptions.template, createThis):
    _axt(pugOptions.render || pugOptions.template, createThis);
  const acceptHooks = _isFn(pugOptions.pluginAcceptRender) ?
    pugOptions.pluginAcceptRender : _cool;
  const pluginList = _isPlainObject(pugOptions.plugin) ?
    pugOptions.plugin : {};
  const defaultProps = pugOptions.props || {};

  // render func
  return function(root, pView, view, args, isUpdate){
    let render = false;
    // create private self plugin list
    pView._aspu = _createPrivate(pluginList, broken_object);
    pView.props = _extend(defaultProps, pView.props);

    const renderData = parseRenderData(acceptHooks, args, pView);

    if(renderData === false) return root;

    // dynamic this and render string
    const renderString = pluginRenderToString(renderData, createThis.view = pView);

    // prevent render when with same equal prev renderString
    if(root.__cpprs === renderString) return root;

    // start parser to tree
    const target = parser(
      renderString,
      pView,
      renderData
    );

    // recreate dom events
    createPluginEvents(
      root,
      pView,
      pugOptions.events
    );

    // compact refs
    if(root.__cpprr) _extend(pView.refs, root.__cpprr);

    // new render
    if(!root.axml || (root.__cpprn !== name && isUpdate)){
      root.__cpprn = name;
      root.__cpprs = renderString;
      root.__cpprr = pView.refs;

      const internal = createElement((root.axml = target), pView, renderData);

      root.appendChild(internal, root.innerHTML=empty);

      render = true;
    }else{
      const patches = treeDiff(root.axml, target, [], null, null, pView, renderData);
      // console.log("update plugin diff render");

      // diff render
      if(patches.length){
        applyPatch(
          root,
          patches,
          renderData,
          (root.axml = target),
          (root.__ccprs = renderString)
        );

        render = true;
      }

      // remove and gc unexist elm ref
      _eachObject(pView.refs, function(elm, refName){
        // DOM API HTMLElement.contains
        if(!root.contains(elm)) delete pView.refs[refName];
      });
    }

    // sync run completeRender event with Plugin
    if(render) emit.call(root, "completeRender", renderData);

    return root;
  };
};

// alias createPlugin
// createGlobalPlugin
export default function createPlugin(name, pugOptions, existViewPluginList){

  if(!_isString(name) ||
    !_isPlainObject(pugOptions) ||
    !_isString(pugOptions.render || pugOptions.template))

    return console.error(`[cubec view] [plugin] name of [${name}] is not plugin format`);

  if(name in DOCUMENT_TAGS_SHORTCUT){
    console.error(`[cubec view] [plugin] name of [${name}] register can not be HTML5 special tag keyword`);
    return null;
  }

  // create plugin render bounder
  const createPlugin = createPluginRender(name, pugOptions);

  if(_isPlainObject(existViewPluginList))
    existViewPluginList[name] = createPlugin;
  else
    pluginList[name] = createPlugin;

  return pugOptions;
}

