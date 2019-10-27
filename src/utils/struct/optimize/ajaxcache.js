// cache = {};
// cahce[url] = {
//   ":": [cachedata, xhr, event]
//   param: [cachedata, xhr, event]
// }
import get from '../props/get';
import set from '../props/set';

const cache = {};

export const getCache = function(url, paramString){
  const cacheUrl = cache[url];
  if(cacheUrl){
    return get(cacheUrl, paramString || ":");
  }
};

export const setCache = function(url, paramString, dataObject){
  paramString = paramString || ":";
  if(url && dataObject){
    if(!cache[url]) cache[url] = {};
    set(cache[url], paramString, dataObject);
  }
};
