
// @Ajax Cache Data Struct
// cache = {};
// cache[url] = [
//   // cache one
//   { id, noParam:, data },
//   { id, param, data },
//   { id, param2, data }
// ];

import ERRORS from '../../../constant/errors.define.js'

import eq from '../tools/eq';
import clone from '../tools/clone';
import slice from '../tools/slice';

let id = 0;
const ajaxCache = window.ajaxCache = {};
const EmptyAjaxParam = {};

export const getCache = function(url, param){
  let tapCache;
  const cacheUrlPList = ajaxCache[url];

  if(cacheUrlPList){
    let i = 0;
    const l = cacheUrlPList.length;

    for(let cacheItem; i<l; i++){
      cacheItem = cacheUrlPList[i];
      if(eq(cacheItem.param, param)){
        // create immutable data
        tapCache = slice(cacheItem.data);
        tapCache[0] = clone(tapCache[0]);
        break;
      }
    }
  }

  return tapCache;
};

export const setCache = function(url, param=EmptyAjaxParam, data){
  let setAble = false;

  if(url){
    // first create ajaxCacheUrl Pointer List
    if(!ajaxCache[url]) ajaxCache[url] = [];

    const cacheItem = {
      id: id++,
      param: param,
      data: data
    };
    setAble = true;
    ajaxCache[url].push(cacheItem);
  }

  if(!setAble) console.warn(ERRORS.CUBEC_AJAX_SETCACHE_FAILED, url, param, data);

  return setAble;
};
