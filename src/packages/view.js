import VIEW from '../constant/view.define';
import ERRORS from '../constant/errors.define';

import defined from '../utils/defined';
import { on, off, emit, registerEvent } from '../utils/universalEvent';
import { bindDomEvent, removeDomEvent, triggerEmitDomEvent } from '../utils/view/domEventSystem';
import { registerPlugin, renderDOOM, destroyDOOM } from '../utils/view/doom';
import polyfillimeInputEvent from '../utils/view/polyfillimeInputEvent';
import connected from '../utils/view/connected';
import {
  _idt,
  _axt,
  _ayc,
  _lock,
  _extend,
  _eachArray,
  _eachObject,
  _fireEvent,
  _some,
  _isFn,
  _isString,
  _isArray,
  _isPlainObject,
  _isDOM,
  _clone,
  _toString,
  _hasEvent,
  _trim,
  _merge,
  _noop,
  _createPrivate,

  broken_object,
  broken_array,

  eventSplit,
  eventInit,
  eventChange,
  eventNameSpace,
} from '../utils/usestruct';

let vid = 0;
const prefix = "#cubec";

// cubec Template engine
function checkElm(el) {
  if (!_isDOM(el))
    throw new TypeError('[cubec view] root element must be typeof DOMElement -> ' + el);
  return true;
}

function breforeCheck(v){
  return !v;
}

const view = function(options=broken_object) {
  let id = vid++;
  let renderData = broken_object;
  let renderIntime = false;

  const name = options.name || "cubec";
  const bounder = {};
  const usePlugins = {};       // { pluginName: pluginView }

  defined(this, {
    name : name,
    prefix : (prefix + "-"+ name + "-" + id),
    _vid : id,
    _asb : _createPrivate(bounder, broken_object),
    _aspu : _createPrivate(usePlugins, broken_object),
    _asso : function(v){
      if(v === _idt){
        const newOptions = _merge(broken_object, options);
        delete newOptions.root;
        return newOptions;
      }
    },
  });

  const newOptions = _extend(_clone(VIEW.DEFAULT_OPTION), options);

  // define property
  let props = _extend({}, _isPlainObject(newOptions.props) ? newOptions.props : broken_object),
      vroot = newOptions.root,
      render,
      events = newOptions.events,
      plugins = _isPlainObject(newOptions.plugin) ? newOptions.plugin : broken_object,
      connect = newOptions.connect,
      stencil = newOptions.template || newOptions.render,
      models = _isArray(connect) ? connect
        : (connect instanceof view.__instance[0] || connect instanceof view.__instance[1]) ? [connect]
        : broken_array;

  // create refs;
  this.refs = {};
  // directRender
  this.directRender = false;
  // defaultProps
  this.defaultProps = _lock(props);

  // create self plugins
  _eachObject(plugins, function(plugin, pluginName){
    registerPlugin.call(this, pluginName, plugin, view, usePlugins);
  }, this);

  // console.log(connect);
  stencil = _toString(_isFn(stencil) ? stencil(props) : stencil);

  // parse template
  // building the render function
  stencil = _axt(_trim(stencil), { view: this });

  // defined view renderToString
  // switchTemplate function
  defined(this, {

    renderToString: function(data){
      if (data instanceof view.__instance[0]) data = data.get();
      // atom data format
      else if (data instanceof view.__instance[1]) data = data.toChunk();
      // console.log(stencil);
      return stencil.call(this, data || broken_object);
    },

    switchTemplate: function(newRender){
      let switchRender = newRender;

      if(_isFn(switchRender))
        switchRender = _toString(switchRender(this.props));

      if(switchRender && _isString(switchRender))
        stencil = _axt(_trim(switchRender), { view: this });
      else
        console.warn(ERRORS.VIEW_SWITCHTEMPLATE, newRender);
    }
  });

  render = function(data, useSyncRender=false){
    const createDestory = ()=>this.destroy();

    // model data format
    if (data instanceof view.__instance[0]) data = data.get();
    // atom data format
    else if (data instanceof view.__instance[1]) data = data.toChunk();

    // before render hook
    // check if should prevent render
    const before = _fireEvent(this, 'beforeRender', [data]);

    if(
      before &&
      before.length &&
      _some(before, breforeCheck)
    )
      return createDestory;

    // render frame process
    // async render process
    if(renderIntime){
      renderData = data;
      return createDestory;
    }

    renderIntime = true;
    renderData = data;

    // async render
    // directRender without virtual node render
    const createRender = function(){
      try{
        const newRenderString = this.renderToString(renderData);
        let executeRender = true;

        // if is same string, not need render
        // if(renderString === newRenderString) return;

        // cache renderString
        // renderString = newRenderString;

        // use render to string
        if(this.directRender)
          this.root.innerHTML = newRenderString;
        // use renderDOOM
        else
          executeRender = renderDOOM(this.root, newRenderString, this, renderData);

        // emit complete render and write vid
        if(executeRender){
          // write _vid
          this.root._vid = this._vid;
          // emit complete event
          this.emit("completeRender", [renderData]);
        }

      }catch(e){
        console.error(ERRORS.VIEW_RENDER, e, renderData);

        // send catch event
        if(!_hasEvent(this,"catch")) throw e;

        else this.emit("catch", [renderData]);
      }

      renderIntime = false;

    }.bind(this);

    // do async render
    if(useSyncRender) _ayc(createRender);
    else createRender();

    return createDestory;

  }.bind(this);

  // if useOptions has more events
  if (vroot && checkElm(vroot)) {
    // bind events
    this.root = vroot;

    _eachObject(events, registerEvent, this);

    defined(this, { render: render });

    this.connect.apply(this, models);
  } else {
    // spec with "init" event
    if(events && events.init){
      this.on(eventInit, events.init);
      delete events.init;
    }

    // create mount method
    this.mount = function(el, data=broken_object, useSyncRender) {
      if (checkElm(el)) {
        // create Root Element
        this.root = vroot = el;

        // bind events
        _eachObject(events, registerEvent, this);

        defined(this, { render: render });

        this.connect.apply(this, models);

        // delete mount
        delete this.mount;

        // trigger render
        return this.render(data, useSyncRender);
      }
    };
  }

  // create view complete
  _extend(this, options, VIEW.IGNORE_KEYWORDS).
    emit(eventInit).
    off(eventInit);
};

view.prototype = {

  constructor: view,

  on(type, fn) {
    if (_isFn(fn)) {
      _eachArray(_toString(type).split(eventSplit), function(mk) {
        let param = mk.split(eventNameSpace);

        // DOM Element events
        if (param.length === 2) {
          // console.log(this.prefix+param[1]);
          // hack for input
          if (param[0] === 'input')
            polyfillimeInputEvent(this, param[1], fn);
          else
            bindDomEvent(this, param[0], param[1], fn);
        } else {
          on.call(this, mk, fn);
        }
      }, this);
    }

    return this;
  },

  off(type, fn) {
    if (type && _isString(type)) {
      _eachArray(type.split(eventSplit), function(mk) {
        let param = mk.split(eventNameSpace);

        if (param.length === 2)
          removeDomEvent(this, param[0], param[1], fn);
        else
          off.call(this, mk, fn);
      },this);

      return this;
    }

    removeDomEvent(off.call(this));

    return this;
  },

  emit(type, args) {
    let fixType = _toString(type);
    let emitKey = fixType.split(eventNameSpace);

    if (emitKey.length === 2) {
      _eachArray(fixType.split(eventSplit), function(mk) {
        let param = mk.split(eventNameSpace);
        triggerEmitDomEvent(this, param[0], param[1], args);
      },this);
      return this;
    }

    return emit.call(this, fixType, args);
  },

  connect(m) {
    let bounder = this._asb(_idt);

    return connected(this, view.__instance, m, function(item){
      if(!bounder[item._mid])
        on.call((bounder[item._mid] = item), eventChange, this.render);
    });
  },

  disconnect(m) {
    let bounder = this._asb(_idt);

    return connected(this, view.__instance, m, function(item){
      if(bounder[item._mid]){
        delete bounder[item._mid];
        off.call(item, eventChange, this.render);
      }
    });
  },

  destroy(withRemoveRoot=false) {
    if(this.root){

      this.emit('beforeDestroy');
      // remove event
      removeDomEvent(this);

      // disconnet model
      _eachObject(this._asb(_idt), item=>this.disconnect(item));

      // destroy DOOM html elements
      destroyDOOM(this.root, this, withRemoveRoot);

      // emit destroy event
      this.emit('destroy');
    }
  },

};

//include instance [model, atom]
view.__instance = [_noop, _noop];

// create Global Plugin
view.plugin = function(pluginName, plugin){
  return registerPlugin(pluginName, plugin, view);
};

export default view;

