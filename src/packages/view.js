import VIEW from '../constant/view.define';

import struct from 'ax-struct-js';
import cmodel from './model';
import {z, Selector} from '../utils/viewSelector';
import slik from '../utils/viewHTMLDiff';

// Ax template engine
let vid = 0;
const _axt = struct.doom();
const _axtc = struct.doom('cache');
const _lock = struct.lock();
const _extend = struct.extend();
const _eachArray = struct.each('array');
const _eachObject = struct.each('object');
const _slice = struct.slice();
const _isFn = struct.type('func');
const _isStr = struct.type('string');
const _isNum = struct.type('number');
const _isObj = struct.type('object');
const _isElm = struct.type('elm');
const _isAryL = struct.type('arraylike');
const _get = struct.prop('get');
const _ayc = struct.ayc();
const _noop = struct.noop();
const _link = struct.link();
const _clone = struct.clone();
const _define = struct.define();
const _toStr = struct.convert('string');
const _on = struct.event('on');
const _off = struct.event('off');
const _emit = struct.event('emit');

function uon(fn, type) {
  return this.on(type, fn);
}

function checkElm(el) {
  if (!(_isElm(el) || _isAryL(el)))
    throw new TypeError(
      'el must be typeof DOMElement or NodeList collections -> not ' + el,
    );
  return true;
}

function packBefore(view) {
  return function() {
    view.emit('beforeRender', arguments);
    return arguments;
  };
}

function packMain(view, renderFunc) {
  return function(args) {
    renderFunc.apply(view, args);
    return args;
  };
}

function packComplete(view) {
  return function(args) {
    view.root._vid = view._vid;
    return view.emit('completeRender', args);
  };
}

function packRender(view, render) {
  let b = packBefore(view),
    m = packMain(view, render),
    c = packComplete(view);

  return _link(b, m, c);
}

function setRender(view, render) {
  if (_isFn(render)) {
    let renderFn = packRender(view, render.bind(view));

    _define(view, 'render', {
      get: function() {
        return renderFn;
      },
      set: function(newRender) {
        if (_isFn(newRender)) renderFn = packRender(view, newRender.bind(view));
        return renderFn;
      },
      enumerable: false,
      configurable: false,
    });
  }

  return view;
}

function updateSlotComponent(view, args) {
  if (view && view._updateSlotQueue.length) {
    _eachArray(view._updateSlotQueue, renderSlotComponent.bind(view, args));
    view._updateSlotQueue = [];
  }
}

function renderSlotComponent(args, slot) {
  var slotTarget = _get(this, slot.name);
  if (!slotTarget) return;

  var render = _noop;
  var slotOneArg = args[0];
  var slotData = slot.path
    ? _isObj(slotOneArg)
      ? [_get(slotOneArg, slot.path)]
      : args
    : args;

  if (slotTarget.constructor === view) {
    // is extends constructor view
    render = function() {
      let t = slotTarget({root: slot.root});
      t.render.apply(t, slotData);
    };
  } else if (_isFn(slotTarget)) {
    render = function() {
      slotTarget.apply(this, [slot.root].concat(slotData));
    }.bind(this);
  } else if (_isStr(slotTarget) || _isNum(slotTarget)) {
    render = function() {
      slot.root.textContent = slotTarget;
    };
  } else {
    render = function() {
      slot.root.textContent = '';
    };
  }

  return this.useAsyncRenderSlot ? _ayc(render) : render();
}

function completeTemplate(stencil, name, vid) {
  return `<axt id=${name || vid}>${stencil}</axt>`;
}

Selector.prototype.render = function(newhtml, view, props, args) {
  return this.each(function(elm) {
    let target = slik.createTreeFromHTML(newhtml, props);

    if (elm._vid !== view._vid) {
      elm._destory = () => view.destroy();

      return elm.appendChild(
        slik.createDOMElement((view.axml = target), view).firstElementChild,
        (elm.innerHTML = ''),
      );
    }

    slik.applyPatch(
      elm,
      slik.treeDiff(view.axml, target, [], null, null, view),
      (view.axml = target),
    );
    // async render Slot
    return updateSlotComponent(view, args);
  });
};

const view = function(options = {}) {
  this.refs = {};
  this._vid = vid++;
  this._updateSlotQueue = [];

  var options = _extend(_clone(VIEW.DEFAULT_OPTION), options || {});

  let props = _lock(_isObj(options.props) ? options.props : {}),
    vroot = options.root,
    render = options.render,
    events = options.events,
    name = options.name,
    model = options.model,
    stencil = options.template;

  // parse template
  // building the render function
  if (!_isFn(render)) {
    stencil = _isStr(stencil)
      ? (options.cache ? _axtc : _axt)(
          completeTemplate(stencil.trim(), name, this._vid),
          props,
        )
      : _isFn(stencil)
        ? stencil
        : _noop;

    render =
      stencil != _noop
        ? function() {
            let args = _slice(arguments);

            z(this.root).render(stencil.apply(this, args), this, props, args);

            // async render Slot
            return updateSlotComponent(this, args);
          }
        : _noop;
  }

  // if userobj has more events
  if (vroot && checkElm(vroot)) {
    // bind events
    this.root = vroot;

    _eachObject(events, uon, setRender(this, render));

    if (model instanceof cmodel) model.on('change', this.render);
  } else {
    this.mount = function(el) {
      if (checkElm(el)) {
        // bind events
        this.root = vroot = el;

        _eachObject(events, uon, setRender(this, render));

        if (model instanceof cmodel) model.on('change', this.render);

        // trigger render
        if (1 in arguments) this.render.apply(this, _slice(arguments, 1));

        // delete mount
        delete this.mount;

        return this;
      }
    };
  }

  _extend(this, options, VIEW.IGNORE_KEYWORDS)
    .emit('init')
    .off('init');
};

view.prototype = {
  constructor: view,

  on: function(type, fn) {
    if (_isFn(fn)) {
      _eachArray(
        _toStr(type).split('|'),
        function(mk) {
          let param = mk.split(':');
          // DOM Element events

          if (param.length > 1) {
            z(this.root).on(param[0], param[1], fn, this);
          } else {
            _on(this, mk, fn);
          }
        },
        this,
      );
    }

    return this;
  },

  off: function(type, fn) {
    if (type && _isStr(type)) {
      _eachArray(
        type.split('|'),
        function(mk) {
          let param = mk.split(':');

          z(this.root).off(param[0], param[1], fn);

          _off(this, mk, fn);
        },
        this,
      );

      return this;
    }

    z(this.root).off();

    return this;
  },

  emit: function(type, args) {
    let t = _toStr(type),
      k = t.split(':');

    if (k.length > 2) {
      _eachArray(
        t.split('|'),
        function(mk) {
          var mkf = mk.split(':');
          z(this.root)
            .find(mkf[1])
            .trigger(mkf[0], args);
        },
        this,
      );
      return this;
    }

    if (k.length > 1) {
      z(this.root)
        .find(k[1])
        .trigger(k[0], args);
      return this;
    }

    return _emit(this, type, args);
  },

  destroy: function(withRoot) {
    this.root._vid = void 0;

    let createDestory = function() {
      z(this.root)
        .off()
        [withRoot ? 'remove' : 'html']();
      this.emit('destroy', delete this.root);
    }.bind(this);

    _ayc(createDestory);
  },
};

export default view;
