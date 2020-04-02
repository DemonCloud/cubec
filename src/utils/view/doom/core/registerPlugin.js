import {
  _idt,
  _axt,
  _axtc,
  // _ayc,
  _eachObject,
  _eqdom,
  _extend,
  _cool,
  _isPlainObject,
  _isString,
  eventNameSpace
} from "../../../usestruct";
import {bindDomEvent, removeDomEvent} from "../../domEventSystem";
import {emit, off, on} from "../../../universalEvent";
import { DOCUMENT_TAGS_SHORTCUT } from '../constant/tags';
import pluginList from "../constant/pluginList";

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
  const pluginRenderToString = pugOptions.cache?
    _axtc(pugOptions.render || pugOptions.template, createThis):
    _axt(pugOptions.render || pugOptions.template, createThis);
  const acceptHooks = pugOptions.pluginAcceptRender || _cool;

  // render func
  return function(root, props, view, args, isUpdate){
    const renderData = acceptHooks.call(props, args);

    // prevent render by hooks
    if(renderData === false || renderData == null) return root;

    // dynamic this and render string
    const renderString = pluginRenderToString(renderData, createThis.view = props);

    // prevent render when with same prev renderString
    if(root.__cpprs === renderString) return root;

    // parser to tree
    const target = parser(
      renderString,
      view.props,
      args
    );

    // recreate dom events
    createPluginEvents(root, props, pugOptions.events);

    // compact refs
    if(root.__cpprr) _extend(props.refs, root.__cpprr);

    // new render
    if(!root.axml || (root.__cpprn !== name && isUpdate)){
      root.__cpprn = name;
      root.__cpprs = renderString;
      root.__cpprr = props.refs;

      const internal = createElement((root.axml = target), props, args);
      root.appendChild(internal, root.innerHTML='');

    }else{
      // console.log("update plugin diff render");
      // diff render
      applyPatch(
        root,
        treeDiff(root.axml, target, [], null, null, props, args),
        args,
        (root.axml = target),
        (root.__ccprs = renderString)
      );

      // remove and gc unexist elm ref
      _eachObject(props.refs, function(elm, refName){
        if(!root.contains(elm)) delete props.refs[refName];
      });
    }

    // sync run completeRender event with Plugin
    emit.call(root, "completeRender", args);

    return root;
  };
};

// alias createPlugin
// createGlobalPlugin
export default function(name, pugOptions, idt, existViewPluginList){
  if(!_isString(name) ||
    !_isPlainObject(pugOptions) ||
    !_isString(pugOptions.render || pugOptions.template))
    return console.error(`[cubec view] [plugin] name of [${name}] is not plugin format`);

  if(name in DOCUMENT_TAGS_SHORTCUT){
    console.error(`[cubec view] [plugin] name of [${name}] register can not be HTML5 special tag keyword`);
    return null;
  }

  // createPlugin
  const createPlugin = createPluginRender(name, pugOptions);

  if(idt === _idt && _isPlainObject(existViewPluginList)){
    existViewPluginList[name] = createPlugin;
  }else{
    pluginList[name] = createPlugin;
  }

  return pugOptions;
}

