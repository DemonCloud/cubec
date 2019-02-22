import { _isString } from '../usestruct';

const urlfixer = /^.*\/\/[^\/]+/;

export default function(url){
  if(_isString(url) && (url.match("http://") || url.match("https://") || url.match("//"))){
    url = url.replace(urlfixer, '');
  }

  return url;
}
