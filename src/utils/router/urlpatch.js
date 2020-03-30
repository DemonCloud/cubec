import { _isString, http, https, urlSlash } from '../usestruct';

const urlfixer = /^.*\/\/[^\/]+/;

export default function(url){
  if(_isString(url) &&
    (url.match(http) ||
     url.match(https) ||
     url.match(urlSlash))){
    url = url.replace(urlfixer, '');
  }

  return url;
}

