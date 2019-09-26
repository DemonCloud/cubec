import {
  _idt,
  _some,
  _ayc,
  _link,
  _define,
  _fireEvent,
} from '../usestruct';

function isUnAllowedRender(val){
  return !val;
}

function packBefore(view) {
  return function(data) {
    let res = _fireEvent(view, 'beforeRender', [data]);
    if(res && res.length && _some(res, isUnAllowedRender)) return false;
    return data;
  };
}

function packMain(renderFunc) {
  return function(data) {
    return renderFunc(data);
  };
}

function packComplete(view) {
  return function(data) {
    if(data === _idt)
      return view.emit('catch', data);
    return view.emit('completeRender', [data, view.root._vid = view._vid]);
  };
}

function packRender(view, render) {
  let b = packBefore(view),
    m = packMain(render),
    c = packComplete(view);

  let aycrender = function(data) {
    if(data) _ayc(_link(function(){ return data; }, m, c));
    return view;
  };

  // return _link(b,m,c);

  return _link(b, aycrender);
}

export default function createRender(view, render) {
  _define(view, 'render', {
    value: packRender(view, render.bind(view)),
    writable: false,
    enumerable: false,
    configurable: false,
  });

  return view;
}
