import { _eachObject, empty } from '../../usestruct';
import parser from "./core/parser";
import createElement from "./core/createElement";
import treeDiff from "./core/treeDiff";
import applyPatch from "./core/applyPatch";
import registerPlugin from "./core/registerPlugin";

export const renderDOOM = function(renderRoot, renderString, view, data){
  let render = false;
  // parser new renderString always
  const createNewTree = parser(renderString, view, data);

  // if is not render or is not same view, do first render;
  if(renderRoot._vid !== view._vid || !view.axml){
    renderRoot._destory = function(){ return view.destroy(); };

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

  view.axml = null;

  if(renderRoot.parentNode && withRemoveRoot)
    renderRoot.parentNode.removeChild(renderRoot);

  renderRoot.innerHTML = empty;
};

export const registerDOOMPlugin = registerPlugin;
