import toString from './toString';

const qrsReg = /([^&=]+)=?([^&]*)/g;

function rSpace(part){
  return decodeURIComponent(part.replace(/\+/g,' '));
}

export default function paramParse(url){
  const turl = toString(url).split('#').shift(),
        findQuery = turl.indexOf('?'),
        res = {},
        param = ~findQuery ? turl.substr(findQuery+1) : turl;
  let match;

  while((match = qrsReg.exec(param)))
    res[rSpace(match[1])] = rSpace(match[2]);

  delete res[param];

  return res;
}
