import struct from '../lib/struct';
import $ from '../lib/jquery';

const _set = struct.prop("set");
const _isStr = struct.type("string");
const _isFn = struct.type("func");
const _isObj = struct.type("object");
const _decode = struct.html("decode");
const _toStr = struct.convert("string");
const _eachArray = struct.each("array");
const _eachObject = struct.each("object");
const _map = struct.map();
const _noop = struct.noop();
const _eq = struct.eq();

// attr list mapping
const attrList = {
  class: 'className',
  style: 'style.cssText',
  placeholder: '@placeholder',
  maxlength: '@maxlength',
  minLength: '@minLength',
  max: '@max',
  min: '@min',
  href: '@href',
  checked: '*checked',
  disabled: '*disabled',
  readonly: '*readonly',
  required: '*required',
  selected: '*selected',
  controls: '*controls',
  ended: '*ended',
  muted: '*muted',
  hidden: '*hidden',
  seeking: '*seeking',
  paused: '*paused',
  loop: '*loop',
  autoplay: '*autoplay',
  multiple: '*multiple',
  autofocus: '*autofocus',
  autocomplete: '*autocomplete',
  draggable: '*draggable',
  spellcheck: '*spellcheck',
  translate: '*translate',
  specified: '*specified',
  defer: '*defer',
  async: '*async',
};

const patchList = [
  'no', // 0
  'replace', // 1
  'append', // 2
  'remove', // 3
  'modifytext', // 4
  'withtext', // 5
  'removetext', // 6
  'addattr', // 7
  'modifyattr', // 8
  'removeattr', // 9
];

const slikReg = new RegExp(
  '</([^><]+?)>|' + '<([^><]+?)/>|' + '<([^><]+?)>|' + '([^><]+)|$',
  'g',
);

const tagList = {
  input: 1,
  br: 1,
  hr: 1,
  img: 1,
  meta: 1,
  area: 1,
  base: 1,
  col: 1,
  isindex: 1,
  command: 1,
  embed: 1,
  keygen: 1,
  link: 1,
  head: 1,
  param: 1,
  source: 1,
  track: 1,
  wbr: 1,
  path: 1,
  circle: 1,
  ellipse: 1,
  line: 1,
  rect: 1,
  use: 1,
  stop: 1,
  polyline: 1,
  polygon: 1,
};

let attrexec = /(\S+)=["'](.*?)["']|([\w-]+)/gi,
  attreval = /^\{|\}$/gi,
  attrprops = /^\{([^'"\s]+)\}$/i,
  excapetab = /^[\r\n\f\t\s]+|[\r\n\f\t\s]+$/gi,
  defaultAttr = /^default[^\s]+/i;

const attrSetter = function(elm, attr, values) {
  let attrName = attrList[attr] || attr;
  let val = _isStr(values) ? _decode(values) : values;

  if (defaultAttr.test(attrName)) {
    // is defaultAttr
    attrName = attrName.slice(7).toLowerCase();
    var inval = elm.getAttribute(attrName) || elm[attrName];

    if (inval == null || inval === '') attrSetter(elm, attrName, val);
  } else if (attrName[0] === '*')
    _set(elm, attrName.slice(1), val === 'true' || val === true);
  else if (attrName[0] === '@') elm.setAttribute(attrName.slice(1), val);
  else if (attrName[0] === ':') $(elm).on(attrName.slice(1), val);
  else _set(elm, attrName, val);
};

const attrClear = function(elm, key, val) {
  if (key[0] === ':' && _isFn(val)) $(elm).off(key.slice(1), val);
  else if (elm[key] && !delete elm[key])
    try {
      elm[key] = null;
    } catch (e) { }
  else elm.removeAttribute(key);
};

const attrEvent = function(key, val, props) {
  let res = val,
    fn;

  // parse props
  if (attrprops.test(val)) {
    fn = props[val.replace(attreval, '')];
    res = fn !== void 0 ? fn : val;
  }

  if (key[0] === ':') res = _isFn(fn) ? fn : Function('event', _toStr(val));

  return res;
};

const patchAttr = function(o, t) {
  var s = {};
  _eachObject(t, function(v, k) {
    if (o[k] === v) s[k] = 1;
  });
  return s;
};

const patchHack = [
  //0 nopatch
  _noop,
  //1 replace
  function(patch) {
    var t = patch.s;

    if (t && t.parentNode) t.parentNode.replaceChild(patch.n, t);
    // t.parentNode.insertBefore(patch.n,t);
    // t.parentNode.removeChild(t);
  },
  //2 append
  function(patch) {
    var t = patch.s;
    if (t) t.appendChild(patch.n);
  },
  //3 remove
  function(patch) {
    var t = patch.s;
    if (t.parentNode) t.parentNode.removeChild(t);
  },
  //4 modifytext
  function(patch) {
    var t = patch.s;
    if (patch.isSlot) {
      if (t._destory) t._destory();
      return t.parentNode.replaceChild(patch.n, t);
    }
    t.textContent = _decode(patch.c);
  },
  //5 withtext
  function(patch) {
    var t = patch.s;
    if (patch.isSlot) {
      if (t._destory) t._destory();
      return t.parentNode.replaceChild(patch.n, t);
    }
    t.textContent = _decode(patch.c);
  },
  //6 removetext
  function(patch) {
    var t = patch.s;
    t.innerHTML = patch.n.innerHTML;
  },
  //7 addattr
  function(patch) {
    _eachObject(patch.a, function(value, key) {
      attrSetter(patch.s, key, value);
    });
  },
  //8 modifyattr
  function(patch) {
    var t = patch.s;
    var s = patchAttr(patch.o, patch.a);

    _eachObject(patch.o, function(value, key) {
      if (!(key in s)) attrClear(t, key, value);
    });
    _eachObject(patch.a, function(value, key) {
      if (!(key in s)) attrSetter(t, key, value);
    });
  },
  //8 removeattr
  function(patch) {
    _eachObject(patch.a, function(value, key) {
      attrClear(patch.s, key, value);
    });
  },
];

// createSlot
const patchSlot = function(slot, elm) {
  var name = _isStr(slot) ? slot : '';

  if (name && elm) {
    var sloter = {};
    var slotParse = name.trim().split('::');

    sloter.name = slotParse[0];
    sloter.path = slotParse[1];
    sloter.root = elm;

    return sloter;
  }
};

// SLIK singe html parse and diff
const slik = {
  treeDiff: function(org, tag, patch, orgParent, tagParent, view) {
    if (org === void 0)
      // new node
      patch.unshift(this.createPatch(orgParent, tag, 2, view));
    else if (tag === void 0)
      // remove node
      patch.push(this.createPatch(org, 0, 3, view));
    else if (org.tagName === tag.tagName) {
      if (tag.isSlot || org.isSlot) {
        patch.push(this.createPatch(org, tag, 5, view));
        return patch;
      }

      if (!_eq(org.attributes, tag.attributes)) {
        if (org.attributes && tag.attributes)
          patch.push(this.createPatch(org, tag, 8, view));
        else if (!org.attributes)
          patch.push(this.createPatch(org, tag, 7, view));
        else if (!tag.attributes)
          patch.push(this.createPatch(org, tag, 9, view));
      }

      // some node , maybe modify
      if (org.text !== tag.text) {
        if (org.text && tag.text && org.text !== tag.text)
          patch.push(this.createPatch(org, tag, 4, view));
        else if (!org.text) patch.push(this.createPatch(org, tag, 5, view));
        else if (!tag.text) patch.push(this.createPatch(org, tag, 6, view));
        return patch;
      }

      // with child diff
      // optimzer patch at child diff
      var i,
        o = org.child.length,
        t = tag.child.length;

      // There is an algorithm problem
      // and if you need the smallest patcher -
      // you need to make extreme comparisons and optimizations to diff child nodes
      // but it also leads to more cycles and complexity
      // *will rebuild using some algorithm with reduce the patcher
      if (o || t) {
        // org < tag ( add tag )
        if (o < t) {
          // don't be naive. There are order problems
          for (i = o; i < t; i++)
            patch.push(this.createPatch(org, tag.child[i], 2, view));
          for (i = o; i--; )
            this.treeDiff(org.child[i], tag.child[i], patch, org, tag, view);

          // org > tag ( exist remove tag )
        } else if (o > t) {
          for (i = o - 1; i >= t; i--)
            patch.push(this.createPatch(org.child[i], 0, 3, view));
          for (i = t; i--; )
            this.treeDiff(org.child[i], tag.child[i], patch, org, tag, view);
        } else {
          // org === tag ( modify )
          for (i = Math.max(o, t); i--; )
            this.treeDiff(org.child[i], tag.child[i], patch, org, tag, view);
        }
      }
    } else if (org.tagName !== tag.tagName)
      patch.push(this.createPatch(org, tag, 1, view));

    return patch;
  },

  applyPatch: function(oDOM, patchs) {
    _eachArray(
      _map(
        patchs,
        function(patch) {
          patch.path = patch.s;
          patch.s = this.mapTreeNode(oDOM, patch.s);
          return patch;
        }.bind(this),
      ),
      function(patch) {
        patchHack[patch.t].call(oDOM, patch);
      },
    );
  },

  mapTreeNode: function(oDOM, path) {
    var target,
      i = 0,
      p = oDOM.children;
    for (; i < path.length; i++) {
      if (p[path[i]]) {
        target = p[path[i]];
        p = target.children;
      } else break;
    }
    return target;
  },

  createSelector: function(org) {
    var path = [org.i];
    while ((org = org.parent)) if (org.i !== void 0) path.unshift(org.i);
    return path;
  },

  createPatch: function(org, tag, type, view) {
    var node,
      patch,
      sl = this.createSelector(org);
    var isSlot = tag.isSlot;

    switch (patchList[type]) {
      case 'replace':
        node = this.createDOMElement(tag, view);
        patch = {t: 1, s: sl, n: node};
        break;
      case 'append':
        node = this.createDOMElement(tag, view);
        patch = {t: 2, s: sl, n: node};
        break;
      case 'remove':
        patch = {t: 3, s: sl};
        break;
      case 'modifytext':
        patch = {t: 4, s: sl, c: tag.text, isSlot: isSlot};
        if (isSlot) patch.n = this.createDOMElement(tag, view);
        break;
      case 'withtext':
        patch = {t: 5, s: sl, c: tag.text, isSlot: isSlot};
        if (isSlot) patch.n = this.createDOMElement(tag, view);
        break;
      case 'removetext':
        node = this.createDOMElement(tag, view);
        patch = {t: 6, s: sl, n: node};
        break;
      case 'addattr':
        patch = {t: 7, s: sl, a: tag.attributes};
        break;
      case 'modifyattr':
        patch = {t: 8, s: sl, a: tag.attributes, o: org.attributes};
        break;
      case 'removeattr':
        patch = {t: 9, s: sl, a: org.attributes};
        break;
      default:
        patch = {t: 0};
        break;
    }

    return patch;
  },

  createTreeFromHTML: function(html, vprops) {
    var cubecRoot = {
      tagName: '__CUBEC_VIEWROOT__',
      isRoot: true,
      child: [],
    };

    var p = cubecRoot,
      c = cubecRoot.child,
      n;

    html.replace(
      slikReg,
      function(match, close, stag, tag, text) {
        if (!match || !match.replace(excapetab, '')) return match;
        if (close) {
          p = p.parent;
          c = p.child;
        } else if (stag) {
          n = this.createObjElement(stag, vprops);
          n.i = c.length;
          c.push(n);
          n.parent = p;
        } else if (tag) {
          n = this.createObjElement(tag, vprops);
          n.i = c.length;
          c.push(n);
          n.parent = p;
          if (!(n.tagName in tagList)) (p = n), (c = n.child);
        } else if (text) {
          if (text.trim()) p.text = text;
        }
        return match;
      }.bind(this),
    );

    return cubecRoot;
  },

  createObjElement: function(str, vprops) {
    var arr = str.split(' '),
      props = _isObj(vprops) ? vprops : {},
      tagName = arr.shift(),
      attributes = arr.join(' '),
      elm = {tagName: tagName, child: []};

    if (tagName === 'slot') elm.isSlot = true;

    if (attributes) {
      var attrs = {},
        s,
        tg;
      while ((s = attrexec.exec(attributes))) {
        if (!s[1]) {
          if (!tg) {
            tg = s[0];
          } else {
            attrs[tg] = attrEvent(tg, s[0], props);
            tg = 0;
          }
        } else {
          attrs[s[1]] = attrEvent(s[1], s[2], props);
        }
      }
      elm.attributes = attrs;
    }

    return elm;
  },

  createDOMElement: function(obj, view) {
    var elm = document.createElement(obj.tagName);

    // registered view.refs Update
    if (view && obj.attributes && obj.attributes.ref)
      view.refs[obj.attributes.ref] = elm;

    _eachObject(obj.attributes, function(value, key) {
      attrSetter(elm, key, value);
    });

    // parse if it's <slot>
    // slot is significative in [ax.view]
    if (view && obj.isSlot) {
      var slotComponent = patchSlot(obj.text, elm);
      // parser success
      if (slotComponent) view._updateSlotQueue.push(slotComponent);

      return elm;
    }

    if (obj.text) {
      // pureText content
      elm.textContent = _decode(obj.text);
    }

    if (obj.child.length) {
      _eachArray(
        obj.child,
        function(child) {
          elm.appendChild(this.createDOMElement(child, view));
        },
        this,
      );
    }

    return elm;
  }
};

export default slik;
