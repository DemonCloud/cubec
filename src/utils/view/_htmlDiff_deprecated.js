import {bindDomEvent, removeDomEvent} from './domEventSystem';
import {on, off, emit, registerEvent} from '../universalEvent';
import {
  _set,
  _isString,
  _isFn,
  _isNumber,
  _isObject,
  _isPlainObject,
  _decode,
  _eachArray,
  _eachObject,
  _map,
  _eq,
  _eqdom,
  _v8,
  _get,
  _idt,
  _ayc,
  _axt,
  _axtc,
  _noop,
  _trim,
  _extend,
  _has,
  eventNameSpace,
  empty
} from '../usestruct';

// 拆分计划
// 和view深度绑定, 不独立
// doom/constant/... 收集固定变量和映射 拆分成多个文件并命名
//      - svg svg 相关的变量定义
//      - attributes 属性相关的变量定义 包括svg
//      - tags 标签类相关的变量定义
// doom/matcher/... 匹配的正则表达式, 匹配方法 多文件并命名
//      - render 渲染解析相关的匹配正则和方法
//      - attributes 属性将官的解析匹配正则方法
//      - slot 额外的解析(slot)
//      - plugin 额外的解析(plugin)
// doom/utils/... 子方法, 类似于attrSetter这种原子操作
//      - render 渲染相关的子方法
//      - attributes 属性类子方法
//        - set 设置属性方法
//        - remove 移除属性方法
//        - get 获取属方法
//      - slot 额外的子方法 ()
//        - 未知
//      - plugin 额外的子方法 ()
//
// doom/core/... 核心方法, 调用各种子方法组合核心API
//      - treeDiff    树状结构的差异化比较, 生成patches的基准数组
//      - createPatch 根据treeDiff生成的基准数组,创建可使用的patch
//      - applyPatch  应用树状结构的patches
//      - parser(createTreeFromHTML) 解析HTML字符串生成对应的tree结构
//      - createTreeNode(createObjElement) 创建单个树的节点, 完整的定义节点的对象信息
//      - createElement(createDOMElement) 根据treeNode创建真实的dom节点
//      - renderSlot 渲染slot插槽组件
//      - renderPlugin 渲染plugin通配组件
//      - registerPlugin 注册plugin组件

// doom/index.js export导出的核心的render方法
//      - render(view, renderToString, renderData)  渲染方法
//      - destroy(view)  销毁视图注册的方法


// 创建svg需要的名称空间
const svgxmlns = "http://www.w3.org/2000/svg";

// attr list mapping
// 属性的映射
const attrList = {
  for: 'htmlFor',
  class: 'className',
  style: 'style.cssText'
};

// 特殊的属性走特殊设置方法, svgElement
const attrSvgNameSpaceMapping = {
  "xlink:href": "http://www.w3.org/1999/xlink"
};

const attrNeedSetAttributes = [
  "placeHolder",
  "maxLength",
  "minLength",
  "tabIndex",
  "cellSpacing",
  "cellPadding",
  "rowSpan",
  "xlink:href",
  "colSpan",
  "contentEditable",
  "useMap",
  "frameBorder",
  "valign",
  "align",
  "abbr",
  "axis",
  "width",
  "height",
  "max",
  "min",
  "href",
  "bgcolor",
  "link",
  "target",
  "reversed",
  "compact",
  "start",
  "coords",
  "char",
  "charoff",
  "charset",
  "hreflang",
  "download",
  "ping",
  "media",
  "type",
  "rel",
  "rev",
  "vlink",
  "alink",
  "background",
  "scrolling",
  "marginwidth",
  "marginheight",
  "frameborder",
  "noresize",
  "size",
  "rows",
  "cols",
  "src",
  "fill",
  "d",
];

const pluginList = {};
const pluginForkViewProps = /^this\./;

const attrBooleanValues = [
  "checked",
  "disabled",
  "required",
  "readOnly",
  "selected",
  "controls",
  "ended",
  "muted",
  "hidden",
  "seeking",
  "paused",
  "loop",
  "autoPlay",
  "multiple",
  "autoFocus",
  "draggable",
  "spellCheck",
  "translate",
  "specified",
  "defer",
  "async",
];

const attrShortcut = [];

_eachArray(attrNeedSetAttributes, function(attr){
  const prefix = attr.toLowerCase();
  const value = "@"+prefix;
  attrList[attr] = value;
  attrList[prefix] = value;
});

// 需要设置为真值的属性
_eachArray(attrBooleanValues, function(attr){
  const prefix = attr.toLowerCase();
  const value = "*"+prefix;
  attrList[attr] = value;
  attrList[prefix] = value;
  attrShortcut.push(attr);
  if(prefix !== attr) attrShortcut.push(prefix);
});

// 短路径标签(包含svg)
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
  param: 1,
  source: 1,
  track: 1,
  wbr: 1,
};

// svg对应的标签映射
const svgTagNameMapping = {
  "svg-a": "a",
  "animate": "animate",
  "animatemotion": "animateMotion",
  "animateMotion": "animateMotion",
  "animatetransform": "animateTransform",
  "animateTransform": "animateTransform",
  "circle": "circle",
  "clipPath": "clipPath",
  "color-profile": "color-profile",
  "defs": "defs",
  "desc": "desc",
  "discard": "discard",
  "ellipse": "ellipse",
  "feblend": "feBlend",
  "feBlend": "feBlend",
  "feColorMatrix": "feColorMatrix",
  "fecolormatrix": "feColorMatrix",
  "fecomponenttransfer": "feComponentTransfer",
  "feComponentTransfer": "feComponentTransfer",
  "fecomposite": "feComposite",
  "feComposite": "feComposite",
  "feconvolvematrix": "feConvolveMatrix",
  "feConvolveMatrix": "feConvolveMatrix",
  "fediffuselighting": "feDiffuseLighting",
  "feDiffuseLighting": "feDiffuseLighting",
  "fedistantlight": "feDistantLight",
  "feDistantLight": "feDistantLight",
  "fedropshadow": "feDropShadow",
  "feDropShadow": "feDropShadow",
  "feflood": "feFlood",
  "feFlood": "feFlood",
  "fefunca": "feFuncA",
  "feFuncA": "feFuncA",
  "fefuncb": "feFuncB",
  "feFuncB": "feFuncB",
  "fefuncg": "feFuncG",
  "feFuncG": "feFuncG",
  "fefuncr": "feFuncR",
  "feFuncR": "feFuncR",
  "fegaussianblur": "feGaussianBlur",
  "feGaussianBlur": "feGaussianBlur",
  "feimage": "feImage",
  "feImage": "feImage",
  "femerge": "feMerge",
  "feMerge": "feMerge",
  "femergenode": "feMergeNode",
  "feMergeNode": "feMergeNode",
  "femorphology": "feMorphology",
  "feMorphology": "feMorphology",
  "feoffset": "feOffset",
  "feOffset": "feOffset",
  "fepointlight": "fePointLight",
  "fePointLight": "fePointLight",
  "fespecularlighting": "feSpecularLighting",
  "feSpecularLighting": "feSpecularLighting",
  "fespotlight": "feSpotLight",
  "feSpotLight": "feSpotLight",
  "fetile": "feTile",
  "feTile": "feTile",
  "feturbulence": "feTurbulence",
  "feTurbulence": "feTurbulence",
  "filter": "filter",
  "foreignobject": "foreignObject",
  "foreignObject": "foreignObject",
  "g": "g",
  "hatch": "hatch",
  "hatchpath": "hatchpath",
  "svg-image": "image",
  "line": "line",
  "lineargradient": "linearGradient",
  "linearGradient": "linearGradient",
  "marker": "marker",
  "mask": "mask",
  "mesh": "mesh",
  "meshgradient": "meshgradient",
  "meshpatch": "meshpatch",
  "meshrow": "meshrow",
  "metadata": "metadata",
  "mpath": "mpath",
  "path": "path",
  "pattern" : "pattern",
  "polygon": "polygon",
  "polyline": "polyline",
  "radialgradient": "radialgradient",
  "radialGradient": "radialGradient",
  "rect": "rect",
  "svg-script": "script",
  "set": "set",
  "solidcolor": "solidcolor",
  "stop": "stop",
  "svg-style": "style",
  "svg": "svg",
  "switch": "switch",
  "symbol": "symbol",
  "text": "text",
  "textpath": "textPath",
  "textPath": "textPath",
  "svg-title": "title",
  "tspan": "tspan",
  "unknown": "unknown",
  "use": "use",
  "view": "view",
};

const slikReg = new RegExp(
  '</([^><]+?)>|<([^><]+?)/>|<([^><]+?)>|([^><]+)|$',
  'g',
);

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
  'updateslot', // 10
  'updateplugin' // 11
];

let attrexec = /(\S+)=["'](.*?)["']|([\w-]+)/gi,
  // attreval = /^\{|\}$/gi,
  // attrprops = /^\{([^'"\s]+)\}$/i,
  excapetab = /^[\r\n\f\t\s]+|[\r\n\f\t\s]+$/gi,
  defaultAttr = /^default[^\s]+/i;

const attrSetter = function(elm, attr, values) {
  let attrName = attrList[attr] || attr;
  const isSvgElement = elm instanceof (window.SVGElement || window.HTMLElement);
  const val = _isString(values) ? _decode(values) : values;

  // if(attrName === "*checked"){
  //   console.log("*checked", val);
  // }

  // with defaultValue, must redo default setting
  if (defaultAttr.test(attrName)) {
    // is defaultAttr
    attrName = attrName.slice(7).toLowerCase();
    let notExistDefaultValue = elm.getAttribute(attrName) || elm[attrName];

    if (notExistDefaultValue == null || notExistDefaultValue === '') attrSetter(elm, attrName, val);
  }
  else if (attrName[0] === '*')
    _set(elm, attrName.slice(1), (val === 'true' || val === true));
  else if (attrName[0] === '@') {
    const getAttrName = attrName.slice(1);

    if(isSvgElement){
      const existNameSpace = attrSvgNameSpaceMapping[getAttrName];
      existNameSpace ? elm.setAttributeNS(existNameSpace, getAttrName, val) : elm.setAttribute(getAttrName, val);
    }else {
      elm.setAttribute(getAttrName, val);
    }
  } else {
    if(isSvgElement){
      const existNameSpace = attrSvgNameSpaceMapping[attrName];
      existNameSpace ? elm.setAttributeNS(existNameSpace, attrName, val) : _set(elm, attrName, val);
    }else {
      _set(elm, attrName, val);
    }
  }
};

const attrClear = function(elm, key, val) {
  if (elm[key] && !delete elm[key])
    try { elm[key] = null; } catch (e) { /*empty*/ }
  else elm.removeAttribute(key);
};

const patchAttr = function(o, t) {
  let s = {};
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
    let t = patch.s;

    if (t && t.parentNode) t.parentNode.replaceChild(patch.n, t);
    // t.parentNode.insertBefore(patch.n,t);
    // t.parentNode.removeChild(t);
  },
  //2 append
  function(patch) {
    let t = patch.s;
    if (t) t.appendChild(patch.n);
  },
  //3 remove
  function(patch) {
    let t = patch.s;
    if (t.parentNode) t.parentNode.removeChild(t);
  },
  //4 modifytext
  function(patch) {
    let t = patch.s;
    if (patch.isSlot) {
      return t.parentNode.replaceChild(patch.n, t);
    }
    t.textContent = _decode(patch.c);
  },
  //5 withtext
  function(patch) {
    let t = patch.s;
    if (patch.isSlot) {
      return t.parentNode.replaceChild(patch.n, t);
    }
    t.textContent = _decode(patch.c);
  },
  //6 removetext
  function(patch) {
    let t = patch.s;
    t.innerHTML = '';
    while(patch.n.childNodes.length)
      t.appendChild(patch.n.firstChild);
  },
  //7 addattr
  function(patch) {
    _eachObject(patch.a, function(value, key) {
      attrSetter(patch.s, key, value);
    });
  },
  //8 modifyattr
  function(patch) {
    let t = patch.s;
    let s = patchAttr(patch.o, patch.a);

    _eachObject(patch.o, function(value, key) {
      if (!(key in s)) attrClear(t, key, value);
    });
    _eachObject(patch.a, function(value, key) {
      if (!(key in s)) attrSetter(t, key, value);
    });
  },
  //9 removeattr
  function(patch) {
    _eachObject(patch.a, function(value, key) {
      attrClear(patch.s, key, value);
    });
  },
  //10 updateslot
  function(patch, htmlDiff, args) {
    let c = patch.c;
    let o = patch.o;
    let t = patch.s;

    if(c === o){
      // directly createPatch updateslot
      htmlDiff.createDOMElement(patch.tag, patch.view, args, t);
    }else{
      t.parentNode.replaceChild(htmlDiff.createDOMElement(patch.tag, patch.view, args),t);
    }

  },
  // 11 updateplugin
  function(patch, htmlDiff, args) {
    let t = patch.s;
    // directly createPatch updateplugin
    htmlDiff.createDOMElement(patch.tag, patch.view, args, false, t);
  }
];

const createParentProps = function(view){
  return _extend(
    _extend({}, view.getParentProps()),
    { [view.name]: view.props },
  );
};

// singe html parse and diff
// with virtual dom algorithm
const _htmlDiff_deprecated = {
  treeDiff: function(org, tag, patch, orgParent, tagParent, view, args) {
    if (org === void 0)
      // new node
      patch.unshift(this.createPatch(orgParent, tag, 2, view, args));
    else if (tag === void 0)
      // remove node
      patch.push(this.createPatch(org, 0, 3, view, args));
    else if (org.tagName === tag.tagName) {
      if (tag.isSlot && org.isSlot && tag.id === org.id){
        // update slot
        patch.push(this.createPatch(org, tag, 10, view, args));
        return patch;
      }else if(tag.isSlot || org.isSlot){
        patch.push(this.createPatch(org, tag, 5, view, args));
        return patch;
      }

      if(tag.isPlug || org.isPlug){
        // update plugin
        patch.push(this.createPatch(org, tag, 11, view, args));
        return patch;
      }

      if (!_eq(org.attributes, tag.attributes)) {
        if (org.attributes && tag.attributes)
          patch.push(this.createPatch(org, tag, 8, view, args));
        else if (!org.attributes)
          patch.push(this.createPatch(org, tag, 7, view, args));
        else if (!tag.attributes)
          patch.push(this.createPatch(org, tag, 9, view, args));
      }

      // some node , maybe modify
      if (org.text !== tag.text) {
        if (org.text && tag.text && org.text !== tag.text)
          patch.push(this.createPatch(org, tag, 4, view, args));
        else if (!org.text) patch.push(this.createPatch(org, tag, 5, view, args));
        // if org has text, but tag not have text (maybe tag has child elements)
        else if (!tag.text) patch.push(this.createPatch(org, tag, 6, view, args));
        return patch;
      }

      // with child diff
      // optimzer patch at child diff
      let i,
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
            patch.push(this.createPatch(org, tag.child[i], 2, view, args));
          for (i = o; i--; )
            this.treeDiff(org.child[i], tag.child[i], patch, org, tag, view, args);

          // org > tag ( exist remove tag )
        } else if (o > t) {
          for (i = o - 1; i >= t; i--)
            patch.push(this.createPatch(org.child[i], 0, 3, view, args));
          for (i = t; i--; )
            this.treeDiff(org.child[i], tag.child[i], patch, org, tag, view, args);
        } else {
          // org === tag ( modify )
          for (i = Math.max(o, t); i--; )
            this.treeDiff(org.child[i], tag.child[i], patch, org, tag, view, args);
        }
      }
    } else if (org.tagName !== tag.tagName)
      patch.push(this.createPatch(org, tag, 1, view, args));

    return patch;
  },

  applyPatch: function(oDOM, patchs, args) {
    // console.log(patchs);
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
        patchHack[patch.t].call(oDOM, patch, _htmlDiff_deprecated, args);
      },
    );
  },

  mapTreeNode: function(oDOM, path) {
    let target,
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
    let path = [org.i];
    while ((org = org.parent)) if (org.i !== void 0) path.unshift(org.i);
    return path;
  },

  createPatch: function(org, tag, type, view, args) {
    let node,
      patch,
      sl = this.createSelector(org);
    let isSlot = tag.isSlot;

    switch (patchList[type]) {
      case 'replace': //1
        node = this.createDOMElement(tag, view, args);
        patch = {t: 1, s: sl, n: node};
        break;
      case 'append': //2
        node = this.createDOMElement(tag, view, args);
        patch = {t: 2, s: sl, n: node};
        break;
      case 'remove':  //3
        patch = {t: 3, s: sl};
        break;
      case 'modifytext': //4
        patch = {t: 4, s: sl, c: tag.text, isSlot: isSlot};
        if (isSlot) patch.n = this.createDOMElement(tag, view, args);
        break;
      case 'withtext':  //5
        patch = {t: 5, s: sl, c: tag.text, isSlot: isSlot};
        if (isSlot) patch.n = this.createDOMElement(tag, view, args);
        break;
      case 'removetext': //6
        node = this.createDOMElement(tag, view, args);
        patch = {t: 6, s: sl, n: node};
        break;
      case 'addattr': //7
        patch = {t: 7, s: sl, a: tag.attributes};
        break;
      case 'modifyattr': //8
        patch = {t: 8, s: sl, a: tag.attributes, o: org.attributes};
        break;
      case 'removeattr': //9
        patch = {t: 9, s: sl, a: org.attributes};
        break;
      case 'updateslot': //10
        patch = {t: 10, s: sl, c: tag.text, o: org.text, tag: tag, view: view };
        break;
      case 'updateplugin':  // 11
        patch = {t: 11, s: sl, tag: tag, view: view };
        break;
      default:
        patch = {t: 0};
        break;
    }

    return patch;
  },

  createTreeFromHTML: function(html, vprops, args) {
    let cubecRoot = {
      tagName: '__CUBEC_VIEWROOT__',
      isRoot: true,
      child: [],
    };

    let id = 1;
    let p = cubecRoot,
      c = cubecRoot.child,
      n;

    let skip = false;
    let skipSign = '';
    let skipHTML = '';

    html.replace(
      slikReg,
      function(match, close, stag, tag, text) {
        if (!match || !match.replace(excapetab, '')) return match;

        // match plugin skip
        if(skip){
          const closeTagName = (close||"").split(" ")[0];
          // not match plugin
          if(closeTagName !== skipSign){
            skipHTML += match;
            return match;
          }

          // skip end
          skip = false;
          skipSign = '';
          p.children = _trim(skipHTML);
          p.text = void 0;
          skipHTML = '';
        }

        // close tag
        if (close) {
          p = p.parent;
          c = p.child;
        // special tag
        } else if (stag) {
          n = this.createObjElement(stag, vprops, id++, args);
          n.i = c.length;
          c.push(n);
          n.parent = p;
        // normal tag
        } else if (tag) {
          n = this.createObjElement(tag, vprops, id++, args);
          const tagName = tag.split(" ")[0];

          if(pluginList[tagName]){
            skip = true;
            skipSign = tagName;
          }

          n.i = c.length;
          c.push(n);
          n.parent = p;

          if (!(n.tagName in tagList)) {
            p = n;
            c = n.child;
          }
        } else if (text) {
          if (_trim(text)) p.text = text;
        }
        return match;
      }.bind(this),
    );

    return cubecRoot;
  },

  createObjElement: function(str, vprops, id, args) {
    let arr = str.split(' '),
      tagName = arr.shift(),
      attributes = arr.join(' '),
      elm = {tagName, child: [], id};

    // cubec slot tag
    if (tagName === 'slot') elm.isSlot = true;  // define is view slot
    // cubec plugin register
    else if(pluginList[tagName]) elm.isPlug = true; // define is register view plugin
    // svg element is not HTML Web Standard
    else if(svgTagNameMapping[tagName]){
      elm.tagName = svgTagNameMapping[tagName];
      elm.isSvg = true;
    }  // define is SVG Element

    if (attributes) {
      let attrs = {}, s, tg;
      while ((s = attrexec.exec(attributes))) {
        if (!s[1]) {
          // shortcut props in html5
          if(_has(attrShortcut, s[0])){
            attrs[s[0]] = true;
          } else if(!tg) {
            tg = s[0];
          } else {
            attrs[tg] = s[0];
            tg = 0;
          }
        } else {
          // 设置属性
          attrs[s[1]] = s[2];
        }
      }

      // 嵌入属性
      elm.attributes = attrs;
    }

    return elm;
  },

  createDOMElement: function(obj, view, args, isUpdateSlot=false, isUpdatePlugin=false) {
    let elm = isUpdateSlot || isUpdatePlugin;

    if(!elm) elm = obj.isSvg ?
      document.createElementNS(svgxmlns, obj.tagName) :
      document.createElement(obj.tagName);

    // registered view.refs Update
    if (obj.attributes && obj.attributes.ref){
      view.refs[obj.attributes.ref] = elm;

      if(view.view && view.view.refs) view.view.refs[obj.attributes.ref] = elm;
    }

    // set all Attribute
    _eachObject(obj.attributes, function(value, key) {
      attrSetter(elm, key, value);
    });

    // parse if it's <slot>
    // slot is significative in [ax.view]
    if (view && obj.isSlot && obj.text) {
      const slotStr = _isString(obj.text) ? obj.text : '';

      if(slotStr){
        const slotParse = _trim(slotStr).split('::');
        const slotName = _trim(slotParse[0] || "");
        const slotDataPath = _trim(slotParse[1] || "");

        const getSlotRender = _get(view, slotName);

        if(getSlotRender){
          const slotData = (slotDataPath && _isObject(args)) ?
            _get(args, slotDataPath) : args; // dell with slotdata shortcut
          const recycler = this.renderSlot(getSlotRender, elm, view, slotData);

          if(_isFn(recycler)) view._ass(_idt).push(recycler);
        }
        // view._ass(_idt).push(slot);
      }

      if(elm.__replaceToSlotRoot){
        const slotElm = elm.__replaceToSlotRoot;
        delete elm.__replaceToSlotRoot;
        return slotElm;
      }

      return elm;
    }

    // parse if it's [cubec.view.plugin]
    if (view && obj.isPlug){
      const getPluginRender = pluginList[obj.tagName];

      return getPluginRender(elm, this.createPluginProps(elm, obj, view, args), view, args, isUpdatePlugin);
    }

    if (obj.text) {
      // pureText content
      elm.textContent = _decode(obj.text);
    }

    if (obj.child.length) {
      _eachArray(obj.child, function(child) {
        const newChild = this.createDOMElement(child, view, args)
        elm.appendChild(newChild);
      }, this);
    }

    return elm;
  },

  renderSlot: function(slotRender, root, view, data){
    let render = _noop;
    const slotId = `${view.name}-slotroot`;

    root.setAttribute("id",slotId);

    if (slotRender.constructor === view.constructor && slotRender._isExtender) {
      // is extends constructor view
      render = function() {
        const renderNewView = slotRender({ root });
        renderNewView._assp(_idt, createParentProps(view));
        renderNewView.render(data);
        return function(){ renderNewView.destroy(true); };
      };
    } else if (slotRender instanceof view.constructor && _isNumber(slotRender._vid)) {
      render = function() {
        // createParentProps
        slotRender._assp(_idt, createParentProps(view));

        if (slotRender.root && slotRender.render) {
          // same root between rerender
          if(slotRender.root !== root){
            slotRender.root.setAttribute("id",slotId);
            // ????
            if(root.parentNode)
              root.parentNode.replaceChild(slotRender.root, root);
            else{
              // when it root has not mount at document, it is new node at internal storage
              // setTimeout(function(){ root.parentNode.replaceChild(slotRender.root, root); }, 60);
              // const eventsHandlers = slotRender._ase(_idt);

              // removeDomEvent(slotRender);
              // _eachObject(eventsHandlers, registerEvent, slotRender);
              root.__replaceToSlotRoot = slotRender.root;
            }

          }

          slotRender.render(data);
        } else {
          slotRender.mount(root, data);
        }


        if(!slotRender.__recycle){
          slotRender.__recycle = true;
          return function(){ slotRender.destroy(true); };
        }
      };
    } else if (_isFn(slotRender)) {
      render = function() {
        const renderResult = slotRender.call(view, root, data, function(){ return createParentProps(view); });

        if(!renderResult || !_isFn(renderResult))
          console.warn("[cubec view] case performance, the custom <slot> render component should return a recycle function");

        return renderResult;
      };
    } else if (_isString(slotRender) || _isNumber(slotRender)) {
      render = function() {
        root.textContent = slotRender;
      };
    } else {
      render = function() {
        root.textContent = '';
      };
    }

    return render();
  },

  createDynamicProps: function(attrs, view, data) {
    let props = {};

    _eachObject(attrs, function(v,k){
      if(k[0] === "#"){
        k = k.substr(1);
        v = pluginForkViewProps.test(v) ?
          _get(view, v.replace("this.","")) :
          _get(data||{}, v);
      }
      props[k] = v;
    });

    return props;
  },

  createPluginProps: function(elm, obj, view, args){
    return {
      view: view,
      root: elm,
      refs: {},
      name: obj.tagName,
      prefix: empty,
      props: _extend(
        _htmlDiff_deprecated.createDynamicProps(obj.attributes, view, args),
        { children: obj.children }
      )
    };
  },

  createPluginEvents: function(root, newProps, events) {
    // remove event
    off.call(root);
    removeDomEvent(newProps);

    // rebind events
    _eachObject(events, function(callback,event){
      event = event.split(eventNameSpace);
      const eventName = event[0];
      const eventSelector = event[1];
      if(event.length === 1)
        return on.call(root, eventName, callback.bind(newProps));
      return bindDomEvent(newProps, eventName, eventSelector, callback);
    });
  },

  createPluginRender: function(name, pugOptions){
    const createThis = {};
    const renderToString = pugOptions.cache?
      _axtc(pugOptions.render || pugOptions.template, createThis):
      _axt(pugOptions.render || pugOptions.template, createThis);

    return function(root, props, view, args, isUpdate){
      const pluginWillRender = !_eqdom(root.prevProps, props);
      if(!pluginWillRender) return root;


      const target = this.createTreeFromHTML(
        renderToString(createThis.view = props),
        view.props,
        args
      );

      // recreate events
      this.createPluginEvents(root, props, pugOptions.events);

      // compact refs
      if(root.prevProps && root.prevProps.refs)
        _extend(props.refs, root.prevProps.refs);

      // new render
      if(!root.axml || (root.pugName !== name && isUpdate)){
        root.pugName = name;
        root.prevProps = props;
        const internal = this.createDOMElement((root.axml = target), props, args).firstElementChild;
        root.appendChild(internal, root.innerHTML='');

        _ayc(()=>emit.call(root, "completeRender", args));
        return root;
      }

      // console.log(createThis);

      // diff render
      this.applyPatch(
        root,
        this.treeDiff(root.axml, target, [], null, null, props, args),
        args,
        (root.axml = target),
        (root.prevProps = props)
      );

      _ayc(()=>emit.call(root, "completeRender", args));
      return root;

    }.bind(this);
  },

  // import plugin from view
  // cubec.view.plugin(pluginName, functionalPlugin);
  pluginRegister: function(name, pugOptions){
    if(!_isString(name) ||
       !_isPlainObject(pugOptions) ||
       !_isString(pugOptions.render || pugOptions.template))
      return console.error(`[cubec view] [plugin] name of [${name}] is not plugin format`);

    if(name in tagList)
      return console.error(`[cubec view] [plugin] name of [${name}] register can not be HTML5 special tag keyword`);

    pluginList[name] = _htmlDiff_deprecated.createPluginRender(name, pugOptions);
  }
};

export default Object.freeze(_v8(_htmlDiff_deprecated));