import {
  _axt,
  _axtc,
  // _ayc,
  _eachObject,
  _eqdom,
  _extend,
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
  const renderToString = pugOptions.cache?
    _axtc(pugOptions.render || pugOptions.template, createThis):
    _axt(pugOptions.render || pugOptions.template, createThis);

  return function(root, props, view, args, isUpdate){
    const pluginWillRender = !_eqdom(root.prevProps, props);
    if(!pluginWillRender) return root; // prevent render

    const target = parser(
      renderToString(createThis.view = props),
      view.props,
      args
    );

    // recreate events
    createPluginEvents(root, props, pugOptions.events);

    // compact refs
    if(root.prevProps && root.prevProps.refs)
      _extend(props.refs, root.prevProps.refs);

    // new render
    if(!root.axml || (root.pugName !== name && isUpdate)){
      root.pugName = name;
      root.prevProps = props;
      const internal = createElement((root.axml = target), props, args);
      root.appendChild(internal, root.innerHTML='');

      // sync run completeRender event with Plugin
      emit.call(root, "completeRender", args);
      return root;
    }

    // diff render
    applyPatch(
      root,
      treeDiff(root.axml, target, [], null, null, props, args),
      args,
      (root.axml = target),
      (root.prevProps = props)
    );

    // sync run completeRender event with Plugin
    emit.call(root, "completeRender", args);

    return root;
  };
};

export default function(name, pugOptions, existViewPluginList){
  if(!_isString(name) ||
    !_isPlainObject(pugOptions) ||
    !_isString(pugOptions.render || pugOptions.template))
    return console.error(`[cubec view] [plugin] name of [${name}] is not plugin format`);

  if(name in DOCUMENT_TAGS_SHORTCUT)
    return console.error(`[cubec view] [plugin] name of [${name}] register can not be HTML5 special tag keyword`);

  // createPlugin
  const createPlugin = createPluginRender(name, pugOptions);

  if(_isPlainObject(existViewPluginList)){
    existViewPluginList[name] = createPlugin;
  }else{
    pluginList[name] = createPlugin;
  }
}

