import noop from './constant/noop';
import broken from './constant/broken';

import isPlainObject from './type/isPlainObject';
import keys from './tools/keys';
import extend from './tools/extend';
import toNumber from './tools/toNumber';
import paramStringify from './tools/paramStringify';

import eachObject from './eachObject';

const MIME = {
  'application/x-www-form-urlencoded': 0,
  'application/json' : 1
};

// const cacheAJAX = {};

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

  // if(config.cache && config.url){
  //   let data;
  //   let item = cacheAJAX[cacheUrl];

  //   // *Init set localStorage
  //   if(!item){
  //     item = '{}';
  //     cacheAJAX[cacheUrl] = item;
  //   }

  //   if((data = item) != null){
  //     try{
  //       data = config.emulateJSON ? JSON.parse(data) : data;
  //     }catch(e){
  //       console.error("[cubec.struct] parse error with ajax cache data under emulateJSON");
  //       return config.error.call(context, data);
  //     }

  //     return config.success.call(context, data, new XMLHttpRequest());
  //   }
  // }
  const xhr = new XMLHttpRequest();

  // with GET method
  if(config.type.toUpperCase() === 'GET' && config.param){
    config.url += (~config.url.search(/\?/g) ? '&' : (keys(config.param).length ? '?' : ''))+
      paramStringify(config.param);
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
    // response HTTP response header 200 or lower 300
    // 304 not modifined
    if(xhr.readyState === 4){
      var status = xhr.status;

      if(( status >= 200 && status < 300) || status === 304){
        var result;

        try{
          const contentType = xhr.getResponseHeader("Content-Type");
          result = (config.emulateJSON && contentType === "application/json" ) ? xhr.response :
            (contentType === "application/json" ? JSON.parse(xhr.responseText) : xhr.responseText);
        }catch(e){
          console.error(e);
          return config.error.call(context, config.emulateJSON ? xhr.response : xhr.responseText, xhr,event);
        }

        config.success.call(context, result, xhr, event);
        // if cache been set writeJSON in chache
        // #TODO rewirte cache
        // if(config.cache && config.url){
        //   cacheAJAX[cacheUrl] = xhr.responseText;
        // }
      } else {
        var errData = '';

        try{
          errData = xhr.response || JSON.parse(xhr.responseText);
        }catch(e){
          console.error(e);
        }

        config.error.call(context, errData, xhr, event);
      }
    }
  };

  // setTimeout data of ajax
  if(toNumber(config.timeout)){
    xhr.timeout = toNumber(config.timeout);
    xhr.ontimeout = function(){
      if(xhr.readyState !== 4 || xhr.responseText==null)
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
