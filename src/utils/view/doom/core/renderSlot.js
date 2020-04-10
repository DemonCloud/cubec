import {_noop, _cool, _extend, _idt, _isFn, _isNumber} from "../../../usestruct";

import parseRenderData from '../utils/parseRenderData';

// get parents props
const createParentProps = function(view){
  return _extend(
    // call view getParentProps proto function
    _extend({}, view.getParentProps()),
    { [view.name||view._vid]: view.props },
  );
};

// call SLOT render
const renderSlot = function(slotRender, root, view, data){
  let render = _noop;
  const renderData = parseRenderData(slotRender.slotAcceptRender, data, slotRender);

  // console.log("slotrender", slotRender, data, renderData);
  // if parser data as false, will prevent render
  if(renderData === false) return;

  // view slot render
  if(slotRender instanceof view.constructor && _isNumber(slotRender._vid)){
    // render
    render = function() {
      // createParentProps
      slotRender._assp(_idt, createParentProps(view));

      if (slotRender.root && slotRender.render) {
        // same root between rerender
        if(slotRender.root !== root){

          if(root.parentNode)
            // ????
            root.parentNode.replaceChild(slotRender.root, root);
          else{
            // when it root has not mount at document,
            // it is new node at internal storage
            root.__replaceToSlotRoot = slotRender.root;
          }

        }

        slotRender.render(renderData);

      } else if(slotRender.mount) {

        // mount render
        slotRender.mount(root, renderData);
      }

      return function(){ return slotRender.destroy(true); };

    };

  } else if (_isFn(slotRender)) {

    render = function() {

      const renderRecycler = slotRender.call(
        view,
        root,
        renderData,
        function(){ return createParentProps(view); }
      );

      if(!_isFn(renderRecycler))
        console.warn("[cubec view] [slot] case performance, the custom <slot> render should return a recycle function");

      return renderRecycler;

    };

  }

  // execute render
  return render();
};

export default renderSlot;

