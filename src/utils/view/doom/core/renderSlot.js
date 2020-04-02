import {_noop, _extend, _idt, _isFn, _isNumber} from "../../../usestruct";

// get parents props
const createParentProps = function(view){
  return _extend(
    // call view getParentProps proto function
    _extend({}, view.getParentProps()),
    { [view.name]: view.props },
  );
};

// call SLOT render
const renderSlot = function(slotRender, root, view, data){
  let render = _noop;

  if(_isFn(slotRender.slotAcceptRender)){
    const renderData = slotRender.slotAcceptRender(data);
    if(renderData === false || renderData == null) return;
  }

  // view to render;
  if (slotRender instanceof view.constructor &&
      _isNumber(slotRender._vid)) {

    // render
    render = function() {
      // createParentProps
      slotRender._assp(_idt, createParentProps(view));

      if (slotRender.root && slotRender.render) {
        // same root between rerender
        if(slotRender.root !== root){
          // ????
          if(root.parentNode)
            root.parentNode.replaceChild(slotRender.root, root);
          else{
            // when it root has not mount at document,
            // it is new node at internal storage
            root.__replaceToSlotRoot = slotRender.root;
          }
        }

        slotRender.render(data);
      } else if(slotRender.mount) {
        // mount render
        slotRender.mount(root, data);
      }

      return function(){ return slotRender.destroy(true); };
    };

  } else if (_isFn(slotRender)) {
    render = function() {
      const renderRecycler = slotRender.call(
        view,
        root,
        data,
        function(){ return createParentProps(view); }
      );

      if(!_isFn(renderRecycler))
        console.warn("[cubec view] case performance, the custom <slot> render function component should return a recycle function");

      return renderRecycler;
    };
  }

  // execute render
  return render();
};

export default renderSlot;

