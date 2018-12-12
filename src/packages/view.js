import VIEW from '../constant/view.define';

import struct from '../lib/struct';
import catom from './atom';
import cmodel from './model';
import $ from '../lib/jquery';
import slik from '../utils/viewHTMLDiff';
import defined from '../utils/defined';
import {on, off} from '../utils/universalEvent';
import registerEvent from '../utils/registerEvent';

let vid = 0;

// cubec Template engine
const _idt = struct.broken;
const _axt = struct.doom();
const _axtc = struct.doom('cache');
const _lock = struct.lock();
const _extend = struct.extend();
const _some = struct.some();
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
const _hasEvent = struct.event('has');
const _fireEvent = struct.fireEvent();

function checkElm(el) {
  if (!(_isElm(el) || _isAryL(el)))
    throw new TypeError(
      'el must be typeof DOMElement or NodeList collections -> not ' + el,
    );
  return true;
}

function isUnAllowedRender(val){
   return !val;
}

function packBefore(view) {
  return function() {
    let res = _fireEvent(view, 'beforeRender', arguments);

    if(res && res.length && _some(res, isUnAllowedRender)){
      return false;
    }

    return arguments;
  };
}

function packMain(view, renderFunc) {
  return function(args) {
    return renderFunc.apply(view, args);
  };
}

function packComplete(view) {
  return function(args) {
    if(args !== _idt){
      view.root._vid = view._vid;
      return view.emit('completeRender', args);
    }

    return view.emit('catch');
  };
}

function packRender(view, render) {
  let b = packBefore(view),
    m = packMain(view, render),
    c = packComplete(view);

  let aycrender = function(args) {
    if(args){
      // run complete render
      _ayc(_link(() => args, m, c));
    }

    return view;
  };

  // return _link(b,m,c);

  return _link(b, aycrender);
}

function compactRender(view,render){
  return function(){
    try{
      return render.apply(view, arguments);
    }catch(e){
      console.error("view {custom} render static throw error with using illegality arguments",e,arguments);
      if (!_hasEvent(view, "catch")) throw e;
      return _idt;
    }
  };
}

function setRender(view, render) {
  if (_isFn(render)) {
    let renderFn = packRender(view, render.bind(view));
    let bounder = view._asb(_idt);

    _define(view, 'render', {
      get: function() {
        return renderFn;
      },
      set: function(newRender) {
        if (_isFn(newRender)) {
          let prevFn = view.render;
          renderFn = packRender(view, compactRender(view, newRender.bind(view)));

          if (_size(bounder)) {
            // switch connnect event
            _eachObject(bounder, item => {
              off.call(item, 'change', prevFn);
              on.call(item, 'change', renderFn);
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
  const slotQueue = view._ass(_idt);
  if (view && slotQueue.length) {
    _eachArray(slotQueue.splice(0, slotQueue.length), renderSlotComponent.bind(view, args));
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

      if (elm._vid !== view._vid || !view.axml) {
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
  let bounder = {};
  let slotQueue = [];

  defined(this, {
    _vid : vid++,
    _asb : (v)=>(v===_idt ? bounder : {}),
    _ass : (v)=>(v===_idt ? slotQueue : [])
  });

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
      stencil != _noop ?
        function() {
          // directRender without virtual node render!
          let args = _slice(arguments);

          try{
            if (args[0] instanceof cmodel) args[0] = args[0].get();
            if (args[0] instanceof catom) args[0] = args[0].toChunk();

            if(this.directRender){
              this.axml = null;
              this.root.innerHTML = stencil.apply(this, args) || '';
            }else{
              $(this.root).render(stencil.apply(this, args), this, props, args);
            }

            return arguments;
          }catch(e){
            console.error("view render static throw error with using illegality arguments",e,arguments);
            if(!_hasEvent(this,"catch")) throw e;
            return _idt;
          }
        } : _noop;
  }else{
    render=compactRender(this,render);
  }

  // if userobj has more events
  if (vroot && checkElm(vroot)) {
    // bind events
    this.root = vroot;

    _eachObject(events, registerEvent, setRender(this, render));

    this.connect.apply(this, models);
  } else {
    // spec with "init" event
    if(events && events.init){
      this.on("init", events.init);
      delete events.init;
    }

    this.mount = function(el) {
      if (checkElm(el)) {
        // create Root Element
        this.root = vroot = el;

        // bind events
        _eachObject(events, registerEvent, setRender(this, render));

        this.connect.apply(this, models);
        // trigger render
        if (1 in arguments) this.render.apply(this, _slice(arguments, 1));

        // delete mount
        delete this.mount;
      } else {
        console.error("mount position is not a pure HTMLElement or Node");
      }

      return this;
    };
  }

  _extend(this, options, VIEW.IGNORE_KEYWORDS)
    .emit('init')
    .off('init');
};

let _iid = 1;
const ime = {};

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
            $(this.root).off(param[0], param[1], fn ? (fn._fn || fn) : fn);
          } else {
            _off(this, mk, fn);
          }
        },
        this,
      );

      return this;
    }

    $(this.root).off(); _off(this);

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
    let bounder = this._asb(_idt);

    if(_isAryL(arguments[0])){
      items = arguments[0];
    }else{
      items = _slice(arguments);
    }

    if (items.length) {
      _eachArray(items, item => {
        if ((item instanceof cmodel || item instanceof catom) && item._mid != null) {
          if (!bounder[item._mid]) {
            bounder[item._mid] = item;
            on.call(item, 'change', this.render);
          }
        }
      });
    }

    return this;
  },

  disconnect: function() {
    let items;
    let bounder = this._asb(_idt);

    if(_isAryL(arguments[0])){
      items = arguments[0];
    }else{
      items = _slice(arguments);
    }

    if (items.length) {
      _eachArray(items, item => {
        if ((item instanceof cmodel || item instanceof catom) && item._mid != null ) {
          if (bounder[item._mid]) {
            delete bounder[item._mid];
            off.call(item, 'change', this.render);
          }
        }
      });
    }

    return this;
  },

  destroy: function(withRoot) {
    this.emit('beforeDestroy');

    this.root._vid = void 0;

    let createDestory = ()=>{
      $(this.root).detach();
      this.emit('destroy', delete this.root);
    };

    return createDestory();
  },
};

export default view;
