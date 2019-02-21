import struct from '../../lib/struct';

const urlfixer = /^.*\/\/[^\/]+/;
const _isString = struct.type('isString');

export default function(url){
  if(_isString(url) && (url.match("http://") || url.match("https://") || url.match("//"))){
    url = url.replace(urlfixer, '');
  }

  return url;
}
