// DOOM
// author: YiJun
// Date: 2019.12.21
// #cubec.view core render engine
import { _eachObject, _isFn, _isPlainObject, _merge, _idt, empty } from '../../usestruct';
import pluginList from './constant/pluginList';
import parser from "./core/parser";
import createElement from "./core/createElement";
import treeDiff from "./core/treeDiff";
import recycle from "./core/recycle";
import applyPatch from "./core/applyPatch";

export const renderDOOM = function(renderRoot, renderString, view, data){
  let render = false;

  // parser new renderString always
  const createNewTree = parser(renderString, view, data);

  // if is not render or is not same view, do first render;
  if(renderRoot._vid !== view._vid || !view.axml){

    // new Render DOM Element
    const internal = createElement(
      (view.axml = createNewTree),
      view,
      data
    );

    // append render Root
    renderRoot.appendChild(internal, (renderRoot.innerHTML = empty));

    render = true;
  }else{
    // is Diff Render
    // create patches
    const getPatches = treeDiff(
      view.axml,
      createNewTree,
      [],
      null,
      null,
      view,
      data
    );

    if(getPatches.length){
      // apply patches
      applyPatch(
        renderRoot,
        getPatches,
        view,
        data,
        (view.axml = createNewTree),
      );

      render = true;
    }

    // recollect and cleaner refs when update views;
    _eachObject(view.refs, function(elm, refName){
      if(!renderRoot.contains(elm)) delete view.refs[refName];
    });
  }

  return render;
};

export const destroyDOOM = function(renderRoot, view, withRemoveRoot=false){
  delete renderRoot._vid;

  // recycle child view render
  recycle(view.axml);

  view.axml = null;

  if(renderRoot.parentNode && withRemoveRoot)
    renderRoot.parentNode.removeChild(renderRoot);

  renderRoot.innerHTML = empty;
};

export const registerPlugin = function(pluginName, plugin, viewConstructor ,selfPluginBlock){
  let render;

  const useBlock = selfPluginBlock || pluginList;
  const isCustomRender = _isFn(plugin);
  const isCreateNewView = _isPlainObject(plugin);

  if(plugin){
    // current view
    if(plugin instanceof viewConstructor){
      // get store view option
      const newPlugin = plugin._asso(_idt);
      newPlugin.name = pluginName;
      render = newPlugin;

    // view.extend
    }else if(
      isCustomRender &&
      plugin.constructor === viewConstructor &
      plugin._isExtender){
      // get store view option
      const newPlugin = plugin()._asso(_idt);
      newPlugin.name = pluginName;
      render = newPlugin;

    // function register
    }else if(isCustomRender){
      render = plugin;

    // view options [new view]
    }else if(isCreateNewView){
      const newPlugin = _merge(plugin, { name: pluginName });
      newPlugin.name = pluginName;
      delete newPlugin.root;

      render = newPlugin;
    }
  }

  // not require self render
  if(render && this !== plugin){
    useBlock[pluginName] = render;
  }else{
    console.error("[cubec view] unexpect token register view.plugin with", pluginName, plugin, this);
    throw new Error("[cubec view] register global|self view.plugin() failed");
  }

  return render;
};
