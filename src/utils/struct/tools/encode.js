import toString from './toString';

const encodeReg = /[&<">'](?:(amp|lt|quot|gt|#39);)?/g;
const ecode = {
  '&' : '&amp;',
  '>' : '&gt;',
  '<' : '&lt;',
  '"' : '$quot;',
  '\'' : '&#x27;',
  '`' : '&#x60'
};
const c_ecode = function(str){ return ecode[str] || str; };

export default function encodeHTML(s){
  return +s===s ? s :
    toString(s).replace(encodeReg,c_ecode);
}
