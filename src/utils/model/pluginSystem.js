import MODEL from '../../constant/model.define';
import {
  _noop,
  _isObject,
  _isFn,
  _isString,
  _isArray,
  _extend,
  _eachObject,
  _eachArray,
  _lock,

  broken_object,
  broken_array,
} from '../usestruct';
import { isIE } from '../adapter';
import { registerEvent } from '../universalEvent';

const pluginList = {};

export const parsePlugin = function(context, config){
  if(config.plugin){
    _eachArray(config.plugin, function(usePlugin){
      // use global plugin
      const useGlobal = _isString(usePlugin);

      const plugin =
        _isArray(usePlugin) ? usePlugin : // private plugin
        useGlobal ? pluginList[usePlugin] :  // global plugin
        broken_array;

      const cons = plugin[0];
      const apis = plugin[1];
      const events = plugin[2];

      if(cons)
        cons.call(context, config);

      if(apis)
        _eachObject(apis, function(api, apiName){
          if(context[apiName]) // exist plugin apiName
            console.warn("[cubec model] [plugin] plugin use write self caller with exist property, it will be overwritte by new plugin caller", `-> [${useGlobal ? usePlugin : "private"}]`, apiName);

          context[apiName] = api;
        });

      if(events)
        _eachObject(events, registerEvent, context);
    });
  }

  return context;
};

export const createPlugin = function(pluginName, pluginOptions){
  if(pluginName && _isObject(pluginName)){
    pluginOptions = pluginName;
    pluginName = null;
  }

  pluginOptions = pluginOptions || broken_object;

  const cons = pluginOptions.constructor || _noop;
  const pluginCutsomsAPIS = _extend({}, pluginOptions, MODEL.IGNORE_KEYWORDS);
  const bindEvents = _extend({}, pluginOptions.events || broken_object);

  // Function.name
  if(isIE){
    // write name for function hooks
    _eachObject(pluginCutsomsAPIS, function(api, apiName){
      if(_isFn(api)) api.name = apiName;
    });
  }

  // [ constructor, customAPISPrefixWithIE*(canUseLinkSystem), events ]
  const plugin = _lock([cons, _lock(pluginCutsomsAPIS), _lock(bindEvents)]);

  // if exist pluginName, register to global
  if(pluginName) pluginList[pluginName] = plugin;

  return plugin;
};
