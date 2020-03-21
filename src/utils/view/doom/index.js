import parser from "./core/parser";
import createElement from "./core/createElement";
import treeDiff from "./core/treeDiff";
import applyPatch from "./core/applyPatch";
import registerPlugin from "./core/registerPlugin";

export const renderDOOM = function(renderRoot, renderString, view, data){
  // parser new renderString always
  const createNewTree = parser(renderString, view, data);

  // if is not render or is not same view
  if(renderRoot._vid !== view._vid || !view.axml){
    renderRoot._destory = function(){ return view.destroy(); };

    // new Render DOM Element
    const internal = createElement(
      (view.axml = createNewTree),
      view,
      data
    );

    // append render Root
    renderRoot.appendChild(internal, (renderRoot.innerHTML = ''));

    return view;
  }

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

  // apply patches
  applyPatch(
    renderRoot,
    getPatches,
    data,
    (view.axml = createNewTree),
  );

  return view;
};

export const destroyDOOM = function(renderRoot, view, withRemoveRoot=false){
  delete renderRoot._vid;

  view.axml = null;

  if(renderRoot.parentNode && withRemoveRoot)
    renderRoot.parentNode.removeChild(this.root);

  renderRoot.innerHTML = "";
};

export const registerDOOMPlugin = registerPlugin;
