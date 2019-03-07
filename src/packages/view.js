import VIEW from '../constant/view.define';
import ERRORS from '../constant/errors.define';

import catom from './atom';
import cmodel from './model';
import $ from '../lib/jquery';
import htmlDiff from '../utils/view/htmlDiff';
import defined from '../utils/defined';
import {on, off} from '../utils/universalEvent';
import registerEvent from '../utils/registerEvent';
import {
  _idt,
  _axt,
  _axtc,
  _lock,
  _extend,
  _some,
  _eachArray,
  _eachObject,
  _slice,
  _isFn,
  _isString,
  _isNumber,
  _isArray,
  _isObject,
  _isElement,
  _isArrayLike,
  _get,
  _size,
  _ayc,
  _link,
  _clone,
  _define,
  _toString,
  _on,
  _off,
  _emit,
  _hasEvent,
  _fireEvent,
  _trim,
  _noop,
} from '../utils/usestruct';

let vid = 0;
const prefix = "__cubec-";
const eventSplit = "|";
const eventNameSpace = ":";

// cubec Template engine
function checkElm(el) {
  if (!(_isElement(el) || _isArrayLike(el)))
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

    if(res && res.length && _some(res, isUnAllowedRender))
      return false;

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
    if(args) _ayc(_link(() => args, m, c));

    return view;
  };

  // return _link(b,m,c);

  return _link(b, aycrender);
}

function compactRender(view,render){
  // custom compactRender
  return function(){
    try{
      if(view.root){
        let useroot;
        const userootId = _trim(view.prefix);
        const currentId = userootId.substr(1);
        const existRoot = view.root.querySelectorAll(userootId);

        if(
          existRoot &&
          existRoot[0] &&
          existRoot[0].tagName.toLowerCase() === "ct" &&
          existRoot[0].getAttribute("id") === currentId
        ){
          useroot = existRoot[0];
          render.apply(view, [useroot].concat(_slice(arguments)));
        } else {
          useroot = document.createElement("ct");
          useroot.setAttribute("id", currentId);
          render.apply(view, [useroot].concat(_slice(arguments)));
          _ayc(()=>view.root.appendChild(useroot));
        }

      }else{
        throw new Error(ERRORS.VIEW_MISSING_ROOT);
      }
    }catch(e){
      console.error(ERRORS.VIEW_CUSTOM_RENDER, e, arguments);
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
      get() {
        return renderFn;
      },
      set(newRender) {
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
  const _view = this;

  let slotTarget = _get(this, slot.name);

  if (!slotTarget) return;

  let render = _noop;
  let slotId = `${prefix}slotroot-${_view.name}`;
  let slotOneArg = args[0];
  let slotData = slot.path
    ? _isObject(slotOneArg)
      ? [_get(slotOneArg, slot.path)]
      : args
    : args;
  slot.root.setAttribute("id",slotId);

  if (slotTarget.constructor === view && slotTarget._isExtender) {
    // is extends constructor view
    render = function() {
      let t = slotTarget({ root: slot.root });
      t.render.apply(t, slotData);
    };
  } else if (slotTarget instanceof view && _isNumber(slotTarget._vid)) {
    render = function() {
      if (slotTarget.root && slotTarget.render) {
        // same root between rerender
        if(slotTarget.root === slot.root){
          slotTarget.render.apply(slotTarget, slotData);
        }else{
          slotTarget.root.setAttribute("id",slotId);
          slot.root.parentNode.replaceChild(slotTarget.root, slot.root);
          slotTarget.render.apply(slotTarget, slotData);
        }
      } else {
        slotTarget.mount.apply(slotTarget, [slot.root].concat(slotData));
      }
    };
  } else if (_isFn(slotTarget)) {
    render = function() {
      slotTarget.apply(this, [slot.root].concat(slotData));
    }.bind(this);
  } else if (_isString(slotTarget) || _isNumber(slotTarget)) {
    render = function() {
      slot.root.textContent = slotTarget;
    };
  } else {
    render = function() {
      slot.root.textContent = '';
    };
  }

  return render();
}

function completeTemplate(stencil, name) {
  return `<ct id="${prefix}${name}">${stencil}</ct>`;
}

// extend render methods
$.fn.render = function(newhtml, view, props, args) {
  return this.each(function(i,elm) {
    let target = htmlDiff.createTreeFromHTML(newhtml, props);

    if (elm._vid !== view._vid || !view.axml) {
      elm._destory = () => view.destroy();

      let internal = htmlDiff.createDOMElement((view.axml = target), view).firstElementChild;
      updateSlotComponent(view, args);

      elm.appendChild(internal, (elm.innerHTML = ''));

      return view;
    }

    htmlDiff.applyPatch(
      elm,
      htmlDiff.treeDiff(view.axml, target, [], null, null, view),
      (view.axml = target),
    );

    // sync render Slot
    updateSlotComponent(view, args);

    return view;
  });
};

// Selector.prototype.render = function(newhtml, view, props, args) {};

const view = function(options = {}) {
  const id = vid++;

  let bounder = {};
  let slotQueue = [];
  let name = options.name || "v--"+id;

  this.refs = {};

  defined(this, {
    name : name,
    prefix : ("#"+ prefix + name + " "),
    _vid : id,
    _asb : v => v===_idt ? bounder : {},
    _ass : v => v===_idt ? slotQueue : []
  });

  options = _extend(_clone(VIEW.DEFAULT_OPTION), options || {});

  let props = _lock(_isObject(options.props) ? options.props : {}),
    vroot = options.root,
    render = options.render,
    events = options.events,
    connect = options.connect,
    models = _isArray(connect)
      ? connect
      : (connect instanceof cmodel || connect instanceof catom)
        ? [connect]
        : [],
    stencil = options.template;

  // parse template
  // building the render function
  if (_isFn(render)) {
    render=compactRender(this,render);
  }else{
    stencil = _isString(stencil)
      ? (options.cache ? _axtc : _axt)(
          completeTemplate(_trim(stencil), name, this._vid),
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
            console.error(ERRORS.VIEW_RENDER,e,arguments);
            if(!_hasEvent(this,"catch")) throw e;
            return _idt;
          }
        } : _noop;
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
        console.error(ERRORS.VIEW_MOUNT);
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

    this.axml = htmlDiff.createTreeFromHTML(r.innerHTML);

    return this;
  },

  on(type, fn) {
    if (_isFn(fn)) {
      _eachArray(
        _toString(type).split(eventSplit),
        function(mk) {
          let param = mk.split(eventNameSpace);

          // DOM Element events
          if (param.length > 1) {
            // console.log(this.prefix+param[1]);
            // hack for input
            if (param[0] === 'input') {
              let pid = _iid++;
              let pida = { iid: pid };

              let pfn = function(e){

                if(ime[pid]) return false;

                if(e.target && e.target.focus) e.target.focus();

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

              $(this.root).on(param[0], this.prefix+param[1], tfn);

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

  off(type, fn) {

    if (type && _isString(type)) {
      _eachArray(
        type.split(eventSplit),
        function(mk) {
          let param = mk.split(eventNameSpace);

          if (param.length > 1) {
            if(param[1] === ""){
              $(this.root).off(param[0]);
            }else{
              $(this.root).off(param[0], this.prefix+param[1], fn ? (fn._fn || fn) : fn);
            }
          } else {
            _off(this, mk, fn);
          }
        },
        this,
      );

      return this;
    }

    $(this.root).off();
    _off(this);

    return this;
  },

  emit(type, args) {
    let t = _toString(type),
      k = t.split(eventNameSpace);

    if (k.length > 2) {
      _eachArray(
        t.split(eventSplit),
        function(mk) {
          let mkf = mk.split(eventNameSpace);
          $(this.root)
            .find(this.prefix+mkf[1])
            .trigger(mkf[0], args);
        },
        this,
      );
      return this;
    }

    if (k.length > 1) {
      $(this.root)
        .find(this.prefix+k[1])
        .trigger(k[0], args);
      return this;
    }

    return _emit(this, type, args);
  },

  connect() {
    let items;
    let bounder = this._asb(_idt);

    if(_isArrayLike(arguments[0])){
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

  disconnect() {
    let items;
    let bounder = this._asb(_idt);

    if(_isArrayLike(arguments[0])){
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

  destroy(withRoot) {
    this.emit('beforeDestroy');

    this.root._vid = void 0;

    const createDestory = ()=>{
      $(this.root).off();
      this.root.innerHTML = "";
      _eachObject(this._asb(_idt), (item)=>this.disconnect(item));
      if(this.root.parentNode && withRoot) this.root.parentNode.removeChild(this.root);
      this.emit('destroy', delete this.root);
    };

    return createDestory();
  },
};

export default view;
