import noop from './constant/noop';
import broken from './constant/broken';

import isPlainObject from './type/isPlainObject';
import isString from './type/isString';
import size from './tools/size';
import extend from './tools/extend';
import merge from './tools/merge';
import toNumber from './tools/toNumber';
import trim from './tools/trim';
import paramParse from './tools/paramParse';
import paramStringify from './tools/paramStringify';
import { getCache, setCache } from './optimize/ajaxcache';

import eachObject from './eachObject';
import { isIE } from '../adapter';

const contentIEsupported = !isIE || isIE > 9;
const EmptyAjaxParam = {};

const MIME = {
  'application/x-www-form-urlencoded': 0,
  'application/json' : 1
};

function dataMIME(enableTrans, contentType, param){
  if(enableTrans) {
    switch (contentType) {
      // 'application/x-www-form-urlencoded' form submit
      case 0:
        return paramStringify(param || broken);
      //'application/json' post JSON Data
      case 1:
        return JSON.stringify(param || broken);
      // default as paramString
      default:
        return paramStringify(param || broken);
    }
  }
  // not enableTrans (as FormData)
  return param;
}

function formatRequestUrl(url){
  const splitArray = (url && isString(url) && url.length > 1) ? url.split("?") : ["/", ""];
  const ajaxUrl = trim(splitArray[0]);
  const ajaxParseParam = splitArray[1] ? paramParse(splitArray[1]) : EmptyAjaxParam;

  return {
    ajaxUrl,
    ajaxParseParam
  };
}

export default function ajax(options={}, context=window){
  const config = extend({
    url       : '',
    type      : 'GET',
    param     : EmptyAjaxParam,
    charset   : 'utf-8',
    vaild     : true,
    cache     : false,
    success   : noop,
    error     : noop,
    loading   : noop,
    loadend   : noop,
    header    : {},
    username  : null,
    password  : null,
    timeout   : 0,
    aysnc     : true,
    emulateJSON : false,
    contentType : true
  } , options || broken);

  // format Ajax URL and Default Params
  const { ajaxUrl, ajaxParseParam } = formatRequestUrl(config.url);
  const ajaxParams = config.param ?
    ((isPlainObject(config.param) ? merge(ajaxParseParam, config.param) :
    (isString(config.param) ? paramParse(config.param) :
    (!config.contentType ? config.param : ajaxParseParam)))) :
    ajaxParseParam;

  // create [use] variable
  let useUrl = ajaxUrl;
  let useParams = ajaxParams;
  let useType = config.type || 'GET';
  let useHeader = config.header || {};
  let useCharset = config.charset || 'utf-8';
  let useTimeout = config.timeout || 0;
  let useContentType = !!config.contentType;
  let useHeaderContentType = (isPlainObject(useHeader) && useType !== 'GET') ?
    config.header['Content-Type'] || 'application/x-www-form-urlencoded' :
    false;
  // use ajax cache
  // if success find cache
  const useCache = !!config.cache;

  if(useCache){
    const getCacheData = getCache(ajaxUrl, ajaxParams);

    if(getCacheData){
      config.success.apply(context, getCacheData);
      return getCacheData[1]; //cache xhr
    }
  }

  // create new XHR httprequest
  const xhr = new XMLHttpRequest();

  // with GET method
  // without request body content
  if(useType.toUpperCase() === 'GET'){
    useUrl = useUrl + "?" + paramStringify(useParams);
    useParams = null;
  }

  //set Loading
  if(config.loading !== noop) xhr.addEventListener('loadstart',config.loading);
  if(config.loadend !== noop) xhr.addEventListener('loadend',config.loadend);

  // set accept responseType
  xhr.responseType = config.emulateJSON ? "json" : "text";
  // xhr open ready to send
  xhr.open(
    useType,
    useUrl,
    config.aysnc,
    config.username,
    config.password
  );

  // FormData support
  if(window.FormData && useParams instanceof window.FormData){
    useContentType = false;
    useHeaderContentType = false;
    delete useHeader['Content-Type'];
  }

  // format POST request header [Content-Type] chartSet
  if(useType.toUpperCase() === 'POST' &&
    useContentType && useHeaderContentType &&
    useHeaderContentType.search('application/json') === -1){
    useHeader['Content-Type'] = (useHeaderContentType+'; chartset='+useCharset);
  }

  // set http header
  if(isPlainObject(useHeader) && size(useHeader))
    eachObject(useHeader,function(val,key){ xhr.setRequestHeader(key,val); });
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

  // ready event
  xhr.onreadystatechange = function(event){
    const contentType = xhr.getResponseHeader("Content-Type") || "";
    const contentTypeLowerCase = contentType.toLowerCase();
    const contentAsJSON = (contentType === "application/json" ||
      contentTypeLowerCase === "application/json" ||
      contentTypeLowerCase === "application/json;charset=utf-8" ||
      contentTypeLowerCase === "application/json; charset=utf-8" );

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
          console.error("[cubec struct] [ajax] try parser response data except error", e);
          return config.error.call(context,
            (contentIEsupported && config.emulateJSON && contentAsJSON) ? xhr.response : xhr.responseText, xhr, event);
        }
        // when useCache
        if(useCache) setCache(ajaxUrl, ajaxParams, [result, xhr, event]);
        config.success.call(context, result, xhr, event);

      // error
      } else {
        let errData;

        try{
          errData = (contentIEsupported && xhr.responseType === "json") ? xhr.response : xhr.responseText;
          if(isString(errData) && contentAsJSON) errData = JSON.parse(errData);
        }catch(e){ /* eslint-disable */ }

        config.error.call(context, errData, xhr, event);
      }
    }
  };

  // setTimeout data of ajax
  if(toNumber(useTimeout)){
    xhr.timeout = toNumber(useTimeout);
    xhr.ontimeout = function(event){
      if(xhr.readyState !== 4) config.error.call(context, null, xhr, event);
      xhr.abort();
    };
  }

  // send request
  xhr.send(isPlainObject(useParams) ?
    dataMIME(useContentType, MIME[useHeaderContentType], useParams) :
    useParams
  );

  return xhr;
}
