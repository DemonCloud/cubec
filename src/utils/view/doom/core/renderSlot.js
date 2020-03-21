import {_extend, _idt, _isFn, _isNumber, _isString, _noop} from "../../../usestruct";

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
  const slotId = `${view.name}-slot`;
  // remake id
  root.setAttribute("id",slotId);

  if (slotRender.constructor === view.constructor && slotRender._isExtender) {
    // is extends constructor view
    render = function() {
      const renderNewView = slotRender({ root });
      renderNewView._assp(_idt, createParentProps(view));
      renderNewView.render(data);
      return function(){ renderNewView.destroy(true); };
    };
  } else if (slotRender instanceof view.constructor && _isNumber(slotRender._vid)) {
    // render
    render = function() {
      // createParentProps
      slotRender._assp(_idt, createParentProps(view));

      if (slotRender.root && slotRender.render) {
        // same root between rerender
        if(slotRender.root !== root){
          slotRender.root.setAttribute("id",slotId);
          // ????
          if(root.parentNode)
            root.parentNode.replaceChild(slotRender.root, root);
          else{
            // when it root has not mount at document, it is new node at internal storage
            // setTimeout(function(){ root.parentNode.replaceChild(slotRender.root, root); }, 60);
            // const eventsHandlers = slotRender._ase(_idt);

            // removeDomEvent(slotRender);
            // _eachObject(eventsHandlers, registerEvent, slotRender);
            root.__replaceToSlotRoot = slotRender.root;
          }

        }

        slotRender.render(data);
      } else {
        slotRender.mount(root, data);
      }


      if(!slotRender.__recycle){
        slotRender.__recycle = true;
        return function(){ slotRender.destroy(true); };
      }
    };
  } else if (_isFn(slotRender)) {
    render = function() {
      const renderResult = slotRender.call(view, root, data, function(){ return createParentProps(view); });

      if(!renderResult || !_isFn(renderResult))
        console.warn("[cubec view] case performance, the custom <slot> render function component should return a recycle function");

      return renderResult;
    };
  } else if (_isString(slotRender) || _isNumber(slotRender)) {
    render = function() {
      root.textContent = slotRender;
    };
  }

  // execute render
  return render();
};

export default renderSlot;
