import $ from '../../lib/jquery';
import { idSign, empty } from '../usestruct';

const fixDelegateSelectorPath = function(prefix, delegateSelector){
  delegateSelector = delegateSelector || "";
  return ((delegateSelector[0] === idSign ? empty : prefix)+delegateSelector) || "*";
};

export const bindDomEvent = function(view, eventName, delegateSelector, handler) {
  if(delegateSelector && handler){
    const bindHandler = handler.bind(view);
    handler._fn = bindHandler;
    $(view.root).on(
      eventName,
      fixDelegateSelectorPath(view.prefix, delegateSelector),
      bindHandler
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
        fixDelegateSelectorPath(view.prefix, delegateSelector),
        handler ? (handler._fn || handler) : handler
      );
    return view;
  }

  // remove all
  $(view.root).off();

  return view;
};

export const triggerEmitDomEvent = function(view, eventName, delegateSelector, args) {
  $(view.root).find(
    fixDelegateSelectorPath(view.prefix, delegateSelector)).
    trigger(eventName, args);
  return view;
};

