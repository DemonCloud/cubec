import VIEW from '../constant/view.define';

import struct from '../lib/struct';
import catom from './atom';
import cmodel from './model';
import $ from '../lib/jquery';
import slik from '../utils/viewHTMLDiff';
import {on, off, emit} from '../utils/universalEvent';

let vid = 0;

// cubec Template engine
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
const _isArray = struct.type('array');
const _isObj = struct.type('object');
const _isElm = struct.type('elm');
const _isAryL = struct.type('arraylike');
const _get = struct.prop('get');
const _size = struct.size();
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

  let aycrender = function(args) {
    _ayc(_link(() => args, m, c));
    return view;
  };

  // return _link(b,m,c);

  return _link(b, aycrender);
}

function setRender(view, render) {
  if (_isFn(render)) {
    let renderFn = packRender(view, render.bind(view));

    _define(view, 'render', {
      get: function() {
        return renderFn;
      },
      set: function(newRender) {
        if (_isFn(newRender)) {
          renderFn = packRender(view, newRender.bind(view));

          if (_size(view._bounder)) {
            // switch connnect event
            _eachObject(view._bounder, model => {
              model.off('change', view.render);
              model.on('change', renderFn);
            });
          }
        }

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

  if (slotTarget.constructor === view && slotTarget._isExtender) {
    // is extends constructor view
    render = function() {
      let t = slotTarget({root: slot.root});
      t.render.apply(t, slotData);
    };
  } else if (slotTarget instanceof view && _isNum(slotTarget._vid)) {
    render = function() {
      if (slotTarget.root) {
        slotTarget.root = slot.root;
        slotTarget.render.apply(slotTarget, slotData);
      } else {
        slotTarget.mount.apply(slotTarget, [slot.root].concat(slotData));
      }
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
  return `<ct id="_c-${name || 'v' + vid}">${stencil}</ct>`;
}

// extend render methods
$.fn.extend({
  render(newhtml, view, props, args) {
    return this.each(function(i, elm) {
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
  },
});

// Selector.prototype.render = function(newhtml, view, props, args) {};

const view = function(options = {}) {
  this.refs = {};
  this._vid = vid++;
  this._bounder = {};
  this._updateSlotQueue = [];

  options = _extend(_clone(VIEW.DEFAULT_OPTION), options || {});

  let props = _lock(_isObj(options.props) ? options.props : {}),
    vroot = options.root,
    render = options.render,
    events = options.events,
    name = options.name,
    connect = options.connect,
    models = _isArray(connect)
      ? connect
      : (connect instanceof cmodel || connect instanceof catom)
        ? [connect]
        : [],
    stencil = options.template,
    isDirectRender = !!options.directRender;

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
        ? isDirectRender
          ? function() {
              // direct Render without virtual node render!
              let args = _slice(arguments);

              if (args[0] instanceof cmodel) args[0] = args[0].get();

              this.root.innerHTML = stencil.apply(this, args) || '';

              return this;
            }
          : function() {
              // virtual render with patch
              let args = _slice(arguments);

              if (args[0] instanceof cmodel) args[0] = args[0].get();

              $(this.root).render(stencil.apply(this, args), this, props, args);

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

    this.connect.apply(this, models);
  } else {
    this.mount = function(el) {
      if (checkElm(el)) {
        // create Root Element
        this.root = vroot = el;

        // bind events
        _eachObject(events, uon, setRender(this, render));

        this.connect.apply(this, models);
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

let _iid = 1;
const ime = {};
const isFF = navigator.userAgent.indexOf('Firefox') > -1;

function compositionIn(e) {
  if(e.data && e.data.iid){
    ime[e.data.iid] = true;
  }
}

function compositionOut(e) {
  if(e.data && e.data.iid){
    ime[e.data.iid]= false;
    $(e.target).trigger('input');
  }
}

function capCursor(elm) {
  let pos = 0;

  if (elm.selectionStart != null) pos = elm.selectionStart;
  // IE Support
  else if (document.selection) {
    elm.focus();

    let sel = document.selection.createRange();
    sel.moveStart('character', -elm.value.length);
    // The caret position is selection length
    pos = sel.text.length;
  }

  return pos;
}

function setCursor(elm, pos) {
  if (elm.createTextRange) {
    let range = elm.createTextRange();
    range.move('character', pos);
    return range.select();
  }

  return elm.selectionStart
    ? elm.setSelectionRange(pos, pos, elm.focus())
    : elm.focus();
}

view.prototype = {
  constructor: view,

  inject(root){
    let r = root || this.root;

    r._vid = view._vid;

    this.axml = slik.createTreeFromHTML(r.innerHTML);

    return this;
  },

  on: function(type, fn) {
    if (_isFn(fn)) {
      _eachArray(
        _toStr(type).split('|'),
        function(mk) {
          let param = mk.split(':');

          // DOM Element events
          if (param.length > 1) {
            // hack for input
            if (param[0] === 'input') {
              let pid = _iid++;
              let pida = { iid: pid };

              let pfn = function(e){

                if(ime[pid]) return false;

                e.target.focus && e.target.focus();

                let pos = capCursor(e.target);

                fn.apply(this, arguments);

                if (pos) setCursor(e.target, pos);

              }.bind(this);

              fn._fn = pfn;

              $(this.root)
                .on('compositionstart', pida, compositionIn)
                .on('compositionend', pida, compositionOut)
                .on(param[0], param[1], pfn);

            } else {
              let tfn = fn.bind(this);

              fn._fn = tfn;

              $(this.root).on(param[0], param[1], tfn);

            }
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

          if (param.length > 1) {
            $(this.root).off(param[0], param[1], fn._fn || fn);
          } else {
            _off(this, mk, fn);
          }
        },
        this,
      );

      return this;
    }

    $(this.root).off();

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
          $(this.root)
            .find(mkf[1])
            .trigger(mkf[0], args);
        },
        this,
      );
      return this;
    }

    if (k.length > 1) {
      $(this.root)
        .find(k[1])
        .trigger(k[0], args);
      return this;
    }

    return _emit(this, type, args);
  },

  connect: function() {
    let items;

    if(_isAryL(arguments[0])){
      items = arguments[0];
    }else{
      items = _slice(arguments);
    }

    if (items.length) {
      _eachArray(items, item => {
        if ((item instanceof cmodel || item instanceof catom) && item._mid != null) {
          if (!this._bounder[item._mid]) {
            this._bounder[item._mid] = item;

            on.call(item, 'change', this.render);
          }
        }
      });
    }

    return this;
  },

  disconnect: function() {
    let items;

    if(_isAryL(arguments[0])){
      items = arguments[0];
    }else{
      items = _slice(arguments);
    }

    if (items.length) {
      _eachArray(items, item => {
        if ((item instanceof cmodel || item instanceof catom) && item._mid != null ) {
          if (this._bounder[item._mid]) {
            delete this._bounder[item._mid];

            off.call(item, 'change', this.render);
          }
        }
      });
    }

    return this;
  },

  destroy: function(withRoot) {
    this.emit('beforeDestory');

    this.root._vid = void 0;

    let createDestory = ()=>{
      $(this.root).detach();
      this.emit('destroy', delete this.root);
    };

    return createDestory();
  },
};

export default view;
