import VIEW from '../constant/view.define';
import ERRORS from '../constant/errors.define';

import $ from '../lib/jquery';
import htmlDiff from '../utils/view/htmlDiff';
import defined from '../utils/defined';
import {on, off, registerEvent } from '../utils/universalEvent';
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
  _isArray,
  _isObject,
  _isDOM,
  _isArrayLike,
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
const idSign = "#";
const empty = "";

// cubec Template engine
function checkElm(el) {
  if (!(_isDOM(el) || _isArrayLike(el)))
    throw new TypeError(
      'el must be typeof DOMElement or NodeList collections -> not ' + el,
    );
  return true;
}

function isUnAllowedRender(val){
   return !val;
}

function packBefore(v) {
  return function() {
    let res = _fireEvent(v, 'beforeRender', arguments);

    if(res && res.length && _some(res, isUnAllowedRender))
      return false;

    return arguments;
  };
}

function packMain(v, renderFunc) {
  return function(args) {
    return renderFunc.apply(v, args);
  };
}

function packComplete(v) {
  return function(args) {
    if(args !== _idt){
      v.root._vid = v._vid;
      return v.emit('completeRender', args);
    }
    return v.emit('catch');
  };
}

function packRender(view, render) {
  let b = packBefore(view),
    m = packMain(view, render),
    c = packComplete(view);

  let aycrender = function(args) {
    if(args) _ayc(_link(function(){ return args; }, m, c));
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

function completeTemplate(stencil, name) {
  return `<ct id="${prefix}${name}">${stencil}</ct>`;
}

// extend render methods
$.fn.render = function(newhtml, view, props, args) {
  return this.each(function(i,elm) {
    let target = htmlDiff.createTreeFromHTML(newhtml, props, args);

    if (elm._vid !== view._vid || !view.axml) {
      elm._destory = () => view.destroy();

      let internal = htmlDiff.createDOMElement((view.axml = target), view, args).firstElementChild;

      elm.appendChild(internal, (elm.innerHTML = ''));
      return view;
    }

    htmlDiff.applyPatch(
      elm,
      htmlDiff.treeDiff(view.axml, target, [], null, null, view, args),
      args,
      (view.axml = target),
    );

    return view;
  });
};

// Selector.prototype.render = function(newhtml, view, props, args) {};
const view = function(options = {}) {
  const id = vid++;

  const bounder = {};
  const slotQueue = [];
  const name = options.name || "v--"+id;

  this.refs = {};

  defined(this, {
    name : name,
    prefix : ("#"+ prefix + name + " "),
    _vid : id,
    _asb : v => v===_idt ? bounder : {},
    _ass : v => v===_idt ? slotQueue : []
  });

  options = _extend(_clone(VIEW.DEFAULT_OPTION), options || _idt);

  let props = _lock(_isObject(options.props) ? options.props : {}),
    vroot = options.root,
    render = options.render,
    events = options.events,
    connect = options.connect,
    models = _isArray(connect)
      ? connect
      : (connect instanceof view.__instance[0] || connect instanceof view.__instance[1])
        ? [connect]
        : [],
    stencil = options.template || '';

  // parse template
  // building the render function
  if (_isFn(render)) {
    render = compactRender(this,render);
  }else{
    stencil = (options.cache ? _axtc : _axt)(
      completeTemplate(_trim(_isFn(stencil) ? stencil.call(this, props) : stencil), name, this._vid),
      props,
    );

    _define(this, "renderToString", {
      value: function(){ return stencil.apply(this, arguments) || ''; }.bind(this),
      writable: false,
      enumerable: false,
      configurable: false,
    });

    render = function(){
      // directRender without virtual node render
      try{
        const args = _slice(arguments);
        if (args[0] instanceof view.__instance[0]) args[0] = args[0].get();
        if (args[0] instanceof view.__instance[1]) args[0] = args[0].toChunk();

        const renderString = this.renderToString.apply(this, args);

        if(this.directRender){
          this.axml = null;
          this.root.innerHTML = renderString;
        }else{
          $(this.root).render(renderString, this, props, args);
        }

        return args;
      }catch(e){
        console.error(ERRORS.VIEW_RENDER,e,arguments);
        if(!_hasEvent(this,"catch")) throw e;
      }
    };
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

view.__instance = [_noop, _noop]; // model, atom

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
                .on(param[0], (param[1][0] === idSign ? empty : this.prefix)+param[1], pfn);

            } else {
              let tfn = fn.bind(this);

              fn._fn = tfn;

              $(this.root).on(param[0], (param[1][0] === idSign ? empty : this.prefix)+param[1], tfn);
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
              $(this.root).off(param[0], (param[1][0] === idSign ? empty : this.prefix)+param[1], fn ? (fn._fn || fn) : fn);
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
        function(params) {
          let param = params.split(eventNameSpace);
          $(this.root)
            .find((param[1][0] === idSign ? empty : this.prefix)+param[1])
            .trigger(param[0], args);
        },
        this,
      );
      return this;
    }

    if (k.length > 1) {
      $(this.root)
        .find((k[1][0] === idSign ? empty : this.prefix)+k[1])
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
        if ((item instanceof view.__instance[0] || item instanceof view.__instance[1]) && item._mid != null) {
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
        if ((item instanceof view.__instance[0] || item instanceof view.__instance[1]) && item._mid != null ) {
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
    if(this.root){
      this.emit('beforeDestroy');
      this.root._vid = void 0;

      const recyclerList = this._ass(_idt);
      let recycler;

      const createDestory = ()=>{

        $(this.root).off();

        _eachObject(this._asb(_idt), (item)=>this.disconnect(item));

        while(recycler = recyclerList.pop()){
          try{ recycler(); }
          catch(e){ }
        }

        if(this.root.parentNode && withRoot) this.root.parentNode.removeChild(this.root);

        this.root.innerHTML = "";

        this.emit('destroy', delete this.root);
      };

      return createDestory();
    }
  },

};

export default view;
