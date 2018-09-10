import struct from '../lib/struct';

const _root = struct.root;
const _each = struct.each();
const _extend = struct.extend();
const _eachArray = struct.each('array');
const _isFn = struct.type('func');
const _isStr = struct.type('string');
const _isAryL = struct.type('arraylike');
const _isElm = struct.type('elm');
const _slice = struct.slice();
const _has = struct.has();

// Performance JavaScript selector
// Just Optimzer this function for sl pref
// @ much more need its better
var capTypes = {
  MouseEvent: [
    'click',
    'dbclick',
    'mouseup',
    'mousedown',
    'mouseout',
    'mouseover',
    'mouseenter',
    'mouseleave',
  ],
  // "UIEvent"       : [
  // 	"focus",
  // 	"blur",
  // 	"focusin",
  // 	"focusout"
  // ],
  // "KeyboardEvent" : [
  // 	"keydown",
  // 	"keypress",
  // 	"keyup"
  // ]
};

const matchzx =
  Element.prototype.matches ||
  Element.prototype.webkitMatchesSelector ||
  Element.prototype.mozMatchesSelector ||
  Element.prototype.msMatchesSelector;

export const Selector = function(elm) {
  this.el = _isAryL(elm) ? _slice(elm) : _isElm(elm) ? [elm] : [];
};

export const z = function(x) {
  return z.init(x);
};

let _zid = 1,
  handlers = {},
  focusinSupported = 'onfocusin' in _root,
  focus = {focus: 'focusin', blur: 'focusout'},
  hover = {mouseenter: 'mouseover', mouseleave: 'mouseout'},
  check = {check: 'change'},
  change = {change: 'input', input: 'input'},
  ininput = ['input', 'keypress', 'keydown', 'keyup'],
  isFF = _root.navigator.userAgent.indexOf('Firefox') > -1;

let ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
  eventMethods = {
    preventDefault: 'isDefaultPrevented',
    stopImmediatePropagation: 'isImmediatePropagationStopped',
    stopPropagation: 'isPropagationStopped',
  };

function zid(element) {
  return element._zid || (element._zid = _zid++);
}

function parse(event) {
  let parts = ('' + event).split('.');

  return {
    e: parts[0],
    ns: parts
      .slice(1)
      .sort()
      .join(' '),
  };
}

function matcherFor(ns) {
  return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
}

function findHandlers(element, event, fn, selector) {
  let matcher = new RegExp();
  event = parse(event);

  if (event.ns) matcher = matcherFor(event.ns);

  return (handlers[zid(element)] || []).filter(function(handler) {
    return (
      handler &&
      (!event.e || handler.e == event.e) &&
      (!event.ns || matcher.test(handler.ns)) &&
      (!fn || zid(handler.fn) === zid(fn)) &&
      (!selector || handler.sel == selector)
    );
  });
}

function eventCapture(handler, captureSetting) {
  return (
    (handler.del && (!focusinSupported && handler.e in focus)) ||
    !!captureSetting
  );
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

function realEvent(type) {
  return (
    hover[type] ||
    change[type] ||
    check[type] ||
    (focusinSupported && focus[type]) ||
    type
  );
}

// I Just want to fuck zepto, because the rubbish lib give not work for new browser
function zaddEvent(element, events, fn, data, selector, delegator, capture) {
  let id = zid(element),
    set = handlers[id] || (handlers[id] = []);

  _each(events.split(/\s/), function(event) {
    let handler = parse(event);
    handler.fn = fn;
    handler.sel = selector;

    // emulate mouseenter, mouseleave
    if (handler.e in hover)
      fn = function(e) {
        let related = e.relatedTarget;
        if (!related || (related !== this && !this.contains(related)))
          return handler.fn.apply(this, arguments);
      };

    handler.del = delegator;
    let callback = delegator || fn;

    handler.proxy = function(e) {
      let pos,
        type = e.type,
        tname = e.target.nodeName,
        editable = e.target.contentEditable === 'true',
        isinput =
          _has(ininput, type) &&
          (tname === 'INPUT' || tname === 'TEXTAREA' || editable);

      let fe = new z.xEvent((e = compatible(e)));

      if (
        e.isImmediatePropagationStopped() ||
        (isinput && e.target._compositionIn)
      )
        return false;

      // # Chrome event handler assign Error with CompositionEvent
      fe.data = data;

      if (isinput) pos = capCursor(e.target);

      let result = callback.apply(
        element,
        fe._args === void 0 ? [fe] : [fe].concat(fe._args),
      );

      if (result === false) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (pos) setCursor(e.target, pos);

      return result;
    };

    handler.i = set.length;
    set.push(handler);

    let tEvent = realEvent(handler.e);

    if (tEvent in change) {
      element.addEventListener('compositionstart', function(e) {
        e.target._compositionIn = true;
      });
      element.addEventListener('compositionend', function(e) {
        e.target._compositionIn = false;
        if (!isFF) z(e.target).trigger('input');
      });
    }

    element.addEventListener(
      tEvent,
      handler.proxy,
      eventCapture(handler, capture),
    );
  });
}

function zremoveEvent(element, events, fn, selector, capture) {
  let id = zid(element);
  _eachArray((events || '').split(/\s/), function(event) {
    _each(findHandlers(element, event, fn, selector), function(handler) {
      delete handlers[id][handler.i];

      element.removeEventListener(
        realEvent(handler.e),
        handler.proxy,
        eventCapture(handler, capture),
      );
    });
  });
}

function returnTrue() {
  return true;
}

function returnFalse() {
  return false;
}

function compatible(event, source) {
  if (source || !event.isDefaultPrevented) {
    source || (source = event);

    _each(eventMethods, function(predicate, name) {
      let sourceMethod = source[name];

      event[name] = function() {
        this[predicate] = returnTrue;
        return sourceMethod && sourceMethod.apply(source, arguments);
      };

      event[predicate] = returnFalse;
    });

    try {
      event.timeStamp || (event.timeStamp = Date.now());
    } catch (ignored) {
      /*ignore*/
    }

    if (
      source.defaultPrevented !== void 0
        ? source.defaultPrevented
        : 'returnValue' in source
          ? source.returnValue === false
          : source.getPreventDefault && source.getPreventDefault()
    )
      event.isDefaultPrevented = returnTrue;
  }
  return event;
}

function createProxy(event) {
  let key,
    proxy = {originalEvent: event};
  for (key in event)
    if (!ignoreProperties.test(key) && event[key] !== void 0)
      proxy[key] = event[key];

  return compatible(proxy, event);
}

z.init = function(x) {
  return new Selector(x);
};

z.matchz = function(elm, selector) {
  return (
    elm !== null &&
    elm !== document &&
    _isStr(selector) &&
    matchzx.call(elm, selector)
  );
};

z.event = {
  add: zaddEvent,
  remove: zremoveEvent,
};

z.proxy = function(fn, context) {
  let args = 2 in arguments && _slice(arguments, 2);

  if (_isFn(fn)) {
    let proxyFn = function() {
      return fn.apply(
        context,
        args ? args.concat(_slice(arguments)) : arguments,
      );
    };

    proxyFn._zid = zid(fn);
    return proxyFn;
  } else if (_isStr(context)) {
    if (args) return z.proxy.apply(null, (args.unshift(fn[context], fn), args));

    return z.proxy(fn[context], fn);
  }

  throw new TypeError('expected function');
};

// z Custom Events
z.Event = function(type, props) {
  let name;

  if (!_isStr(type)) (props = type), (type = props.type);

  let event = document.createEvent(
      _has(capTypes.MouseEvent, type) ? 'MouseEvent' : 'Events',
    ),
    bubbles = true;

  if (props)
    for (name in props)
      name === 'bubbles'
        ? (bubbles = !!props[name])
        : (event[name] = props[name]);

  event.initEvent(type, bubbles, true);
  return compatible(event);
};

z.xEvent = function(event) {
  let key;

  for (key in event) this[key] = event[key];
};

Selector.prototype = {
  get: function(index) {
    return 0 in arguments
      ? this.el[+index + (index < 0 ? this.length : 0)]
      : this.el;
  },

  each: function(fn, context) {
    _eachArray(this.el, fn, context || this);
    return this;
  },

  find: function(sl) {
    let res = [];
    _eachArray(this.el, function(e) {
      res = _slice(e.querySelectorAll(sl)).concat(res);
    });
    return z(res);
  },

  closest: function(selector, element) {
    let el = this.el,
      tmp = this.get(0),
      find,
      i = 0,
      l = el.length;

    for (; i < l; i++, tmp = el[i]) {
      while (tmp && !find && tmp !== element)
        if (z.matchz((tmp = tmp.parentNode), selector)) find = tmp;
      if (find) break;
    }

    return z(find || []);
  },

  on: function(event, selector, data, callback, context) {
    var delegator;

    if (event && !_isStr(event)) {
      _each(
        event,
        function(fn, type) {
          this.on(type, selector, data, fn, context);
        },
        this,
      );

      return this;
    }

    if (!_isStr(selector) && !_isFn(callback) && callback !== false)
      (callback = data), (data = selector), (selector = void 0);
    if (callback === void 0 || data === false)
      (callback = data), (data = void 0);

    if (_isFn(data) && _isStr(selector)) {
      context = callback;
      callback = data;
    }

    if (callback === false) callback = returnFalse;

    return this.each(function(element) {
      if (selector)
        delegator = function(e) {
          var match = z.matchz(e.target, selector)
            ? e.target
            : z(e.target)
                .closest(selector, element)
                .get(0);

          if (match && match !== element)
            callback.apply(
              context || match,
              [_extend(e, {currentTarget: match, liveFired: element})].concat(
                _slice(arguments, 1),
              ),
            );
        };

      zaddEvent(element, event, callback, data, selector, delegator);
    });
  },

  off: function(event, selector, callback) {
    if (event && !_isStr(event)) {
      _each(
        event,
        function(fn, type) {
          this.off(type, selector, fn);
        },
        this,
      );
      return this;
    }

    if (!_isStr(selector) && !_isFn(callback) && callback !== false)
      (callback = selector), (selector = void 0);

    if (callback === false) callback = returnFalse;

    return this.each(function(element) {
      zremoveEvent(element, event, callback, selector);
    });
  },

  trigger: function(event, args) {
    event = _isStr(event) ? z.Event(event) : compatible(event);
    event._args = args;

    return this.each(function(element) {
      // handle focus(), blur() by calling them directly
      if (event.type in focus && _isFn(element[event.type]))
        element[event.type]();
      // items in the collection might not be DOM elements
      else if ('dispatchEvent' in element) element.dispatchEvent(event);
      else z(element).triggerHandler(event, args);
    });
  },

  triggerHandler: function(event, args) {
    var e, result;
    this.each(function(element) {
      e = createProxy(_isStr(event) ? z.Event(event) : event);

      e._args = args;
      e.target = element;

      _each(findHandlers(element, event.type || event), function(handler) {
        result = handler.proxy(e);
        if (e.isImmediatePropagationStopped()) return false;
        return true;
      });
    });

    return result;
  },

  html: function(html) {
    return this.each(function(elm) {
      elm.innerHTML = _toStr(html);
    });
  },

  remove: function() {
    return this.each(function(elm) {
      elm.parentNode.removeChild(
        z(elm)
          .off()
          .get(0),
      );
    });
  },
};
