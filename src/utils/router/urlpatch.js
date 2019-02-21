import struct from '../../lib/struct';

const rootSign = '/';
const urlfixer = /^[a-z]{4,5}\:\/{2}[a-z]{1,}\:[0-9]{1,4}.(.*)/;
const _isString = struct.type('isString');

export default function(url){
  if(_isString(url) && (url.match("http://") || url.match("https://") || url.match("//"))){
    url = rootSign + url.replace(urlfixer,'$1');
  }

  return url;
}
