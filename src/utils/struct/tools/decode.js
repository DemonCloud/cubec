import toString from './toString';

const decodeReg = /&((g|l|quo)t|amp|#39);/g;
const dcode = {
  '&amp;'  : '&',
  '&gt;'   : '>',
  '&lt;'   : '<',
  '&quot;' : '"',
  '&#x27;' : '\'',
  '&#x60;' : '`'
};
const c_dcode = function(str){ return dcode[str] || str; };

export default function decodeHTML(s){
  return +s===s ? s :
    toString(s).replace(decodeReg,c_dcode);
}
