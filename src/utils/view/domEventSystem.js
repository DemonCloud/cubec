import $ from '../../lib/jquery';

const createDelegateEventHandler = function(view, handlerFn){
  return (handlerFn._fn = function(e){
    const elm = e.currentTarget;
    // console.log(arguments);

    if(elm && elm._veid === view._vid){
      return handlerFn.apply(view, arguments);
    }
  });
};

export const bindDomEvent = function(view, eventName, delegateSelector, handler) {
  if(delegateSelector && handler){
    $(view.root).on(
      eventName,
      delegateSelector,
      createDelegateEventHandler(view, handler)
    );
  }
  return view;
};

export const removeDomEvent = function(view, eventName, delegateSelector, handler){
  if(eventName){
    if(!delegateSelector)
      $(view.root).off(eventName);
    else
      $(view.root).off(
        eventName,
        delegateSelector,
        handler ? (handler._fn || handler) : handler
      );
    return view;
  }

  // remove all
  $(view.root).off();

  return view;
};

export const triggerEmitDomEvent = function(view, eventName, delegateSelector, args) {
  $(view.root).find(delegateSelector).trigger(eventName, args);
  return view;
};

