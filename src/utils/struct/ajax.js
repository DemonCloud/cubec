import noop from './constant/noop';
import broken from './constant/broken';

import isPlainObject from './type/isPlainObject';
import isString from './type/isString';
import keys from './tools/keys';
import extend from './tools/extend';
import toNumber from './tools/toNumber';
import paramStringify from './tools/paramStringify';
import { getCache, setCache } from './optimize/ajaxcache';

import eachObject from './eachObject';
import { isIE } from '../adapter';

const contentIEsupported = !isIE || isIE > 9;
const MIME = {
  'application/x-www-form-urlencoded': 0,
  'application/json' : 1
};

function dataMIME(enable, header, param){
  if(enable)
    switch(header){
      case 0:
        return paramStringify(param || broken);
      case 1:
        return JSON.stringify(param || broken);
      default:
        return paramStringify(param || broken);
    }
  return param;
}

export default function ajax(options={}, context=window){
  const config = extend({
    url       : '',
    type      : 'GET',
    param     : broken,
    charset   : 'utf-8',
    vaild     : true,
    cache     : false,
    success   : noop,
    error     : noop,
    loading   : noop,
    loadend   : noop,
    header    : broken,
    username  : null,
    password  : null,
    timeout   : 0,
    aysnc     : true,
    emulateJSON : false,
    contentType : true
  } , options || broken);

  // check isObjisObjisObjif has ajax cache
  // #TODO rewirte
  // const cacheParam = config.param ? (isPlainObject(config.param) ? paramStringify(config.param) : config.param) : "";
  // const cacheUrl = config.url + "$$" + cacheParam;
  const ajaxParams = config.param ? (isPlainObject(config.param) ? paramStringify(config.param) : config.param) : "";
  const ajaxCache = config.cache && config.url && isString(ajaxParams);

  // use ajax cache
  // if success find cache
  if(ajaxCache){
    const cacheObject = getCache(config.url, ajaxParams);

    if(cacheObject){
      config.success.apply(context, cacheObject);
      return cacheObject[1]; //cache xhr
    }
  }


  const xhr = new XMLHttpRequest();

  // with GET method
  if(config.type.toUpperCase() === 'GET'){
    config.url += (~config.url.search(/\?/g) ? '&' : (keys(config.param).length ? '?' : ''))+ajaxParams;
    config.param = null;
  }

  xhr.responseType = config.emulateJSON ? "json" : "text";

  //set Loading
  if(config.loading !== noop) xhr.addEventListener('loadstart',config.loading);
  if(config.loadend !== noop) xhr.addEventListener('loadend',config.loadend);

  // xhr open
  xhr.open(
    config.type,
    config.url,
    config.aysnc,
    config.username,
    config.password
  );

  // with POST method
  let cType = config.header['Content-Type'] || 'application/x-www-form-urlencoded';

  // FormData support
  if(window.FormData && config.param instanceof window.FormData){
    cType = '';
    config.contentType = false;
    delete config.header['Content-Type'];
  }

  if(config.type.toUpperCase() === 'POST' &&
    config.contentType === true &&
    cType.search('json') === -1){
    config.header['Content-Type'] = (cType+'; chartset='+config.charset);
  }

  if(config.header !== broken && isPlainObject(config.header))
    eachObject(config.header,function(val,key){ xhr.setRequestHeader(key,val); });
  xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');

  xhr.onreadystatechange = function(event){
    const contentType = xhr.getResponseHeader("Content-Type");
    const contentAsJSON = (contentType === "application/json" ||
      contentType.toLowerCase() === "application/json; charset=utf-8" ||
      contentType.toLowerCase() === "application/json;charset=utf-8");

    // response HTTP response header 200 or lower 300
    // 304 not modifined
    if(xhr.readyState === 4){
      // success
      if(( xhr.status >= 200 && xhr.status < 300) || xhr.status === 304){
        let result;

        try{
          result = (contentIEsupported && xhr.responseType === "json") ? xhr.response :
          (config.emulateJSON && contentAsJSON ? JSON.parse(xhr.responseText) : xhr.responseText);
        }catch(e){
          console.error(e);
          return config.error.call(context,
            (contentIEsupported && config.emulateJSON && contentAsJSON) ? xhr.response : xhr.responseText, xhr, event);
        }

        config.success.call(context, result, xhr, event);

        // if use ajaxCache, just set cache
        if(ajaxCache) setCache(config.url, ajaxParams, [result, xhr, event]);

      // error
      } else {
        let errData;

        try{
          errData = (contentIEsupported && xhr.responseType === "json") ? xhr.response : xhr.responseText;
          if(isString(errData) && contentAsJSON) errData = JSON.parse(errData);
        }catch(e){ }

        config.error.call(context, errData||'', xhr, event);
      }
    }
  };

  // setTimeout data of ajax
  if(toNumber(config.timeout)){
    xhr.timeout = toNumber(config.timeout);
    xhr.ontimeout = function(){
      if(xhr.readyState !== 4)
        config.error.call(context, null, xhr, event);
      xhr.abort();
    };
  }

  // send request
  xhr.send(config.param ?
    (isPlainObject(config.param) ?
      dataMIME(config.contentType, MIME[cType], config.param) :
      config.param)
    : null);

  return xhr;
}
