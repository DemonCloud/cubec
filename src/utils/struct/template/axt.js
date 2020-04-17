import extend from '../tools/extend';
import trim from '../tools/trim';
import encode from '../tools/encode';
import est from '../tools/est';
import each from '../each';

const escaper = /\\|'|\r|\n|\u2028|\u2029/g;
const cmExec = /^([\S]+)\s?([\s\S]+)?/;
const agExec = /[\[\]]*/g;
const escapes = {
  '\''     : '\'',
  '\\'     : '\\',
  '\r'     : 'r',
  '\n'     : 'n',
  '\u2028' : 'u2028',
  '\u2029' : 'u2029'
};
const optimizer = {
  line     : /[\r\n\f]/gim,
  quot     : /\s*;;\s*/gim,
  space    : /[\x20\xA0\uFEFF]+/gim,
  assert   : /_p\+='(\\n)*'[^+]/gim,
  comment  : /<!--(.*?)-->/gim,
  tagleft  : /\s{2,}</gim,
  tagright : />\s{2,}/gim
};
const axtSetting  = {
  escape      : '{{-([\\s\\S]+?)}}',   // {{-value}}
  interpolate : '{{#([\\s\\S]+?)}}',   // {{#value}}
  command     : '{{\\*([\\s\\S]+?)}}', // {{*commander}}
  evaluate    : '{{([\\s\\S]+?)}}',    // {{ javascript }}
};
const tools = {
  est,
  each,
  encode,
  extend
};

function c_escape(et){ return '\\' + escapes[et]; }

function compiLing(usestruct,who,useargs){
  return '\'; __t__.'+usestruct+'('+who+','+
    'function('+useargs.replace(agExec,'')+'){ _p+=\'';
}

// evaluate
function makeEvaluate(evaluate){
  let evaluatec  = evaluate;
  const parserEval = trim(evaluatec);
  const ifpart = parserEval.slice(0,3);
  const elsepart = parserEval.slice(0,5);
  const elseifpart = parserEval.slice(0,7);
  const lastpart = parserEval[parserEval.length-1];

  if(
    parserEval === '/if'  ||
    parserEval === '/for' ||
    parserEval === '/'
  )
    evaluatec = '}';

  if(lastpart !== '}' && lastpart  !== '{'){

    if(
      (ifpart === 'if ' ||
        ifpart  === 'if(' )
    )
      evaluatec = 'if('+parserEval.slice(2)+'){';

    else if(
      (elseifpart === 'elseif' ||
        elseifpart === 'elseif(' ||
        elseifpart === 'else if(' ||
        elseifpart === 'else if')
    )
      evaluatec = '}else if(' + parserEval.slice(6) + '){';

    else if(
      (elsepart === 'elif ' ||
        elsepart === 'elif(')
    )
      evaluatec = '}else if(' + parserEval.slice(4) + '){';

    else if(
      elsepart === 'else'
    )
      evaluatec = '}else{';

  }

  return evaluatec;
}

// command
function makeComand(command){
  let res = '',
    cms = cmExec.exec(trim(command)),
    cmd = cms[1],
    param = cms[2];

  if(cmd){
    switch(cmd.toLowerCase()){
      // {{* / }}
      // {{* end }}
      case '/':
      case 'end':
      case '/for':
      case '/each':
      case '/if':
      case '/exist':
        res = '\';}, this); _p+=\'';
        break;
      case 'if':
      case 'exist':
        // {{* if abc }}
        res = '\'; var ' + param + ' = ' + param + ' || false; '+
          '_est('+ param +',function(){ _p+=\'';
        break;
      case 'for':
      case 'each':
        // {{* each [item,index] in list }}
        param = param.split(' in ');
        res = compiLing('each',param[1],param[0]);
        break;
      default:
        break;
    }
  }

  return res;
}

export default function axt(txt, binder={}){

  let renderToString, render, position = 0,
    res = '_p+=\'',

    exp = new RegExp(
      axtSetting.escape +
      '|' + axtSetting.interpolate +
      '|' + axtSetting.command +
      '|' + axtSetting.evaluate +
      '|$',
      'gi');

  // Start parse
  const fixTxt = trim(txt);

  fixTxt.replace(exp,function(
    match,
    escape,
    interpolate,
    command,
    evaluate,
    offset
  ){
    res += fixTxt.slice(position, offset).replace(escaper,c_escape);
    // refresh index where to find text string
    position = offset + match.length;

    if(escape)
      // if command is - should encodeHTML string
      res += "'+((_t=(" + escape + "))==null?'':_(_t))+'";
    else if(interpolate)
      res += "'+((_t=(" + interpolate + "))==null?'':_t)+'";
    else if(command)
      res += makeComand(command, res);
    else if(evaluate)
      res += "';" + makeEvaluate(evaluate) + ";_p+='";
    return match;
  });

  // console.log(res);

  // Minix compline && optimizer
  res = res.replace(optimizer.line,'').
    replace(optimizer.comment,'').
    replace(optimizer.assert,'').
    replace(optimizer.quot,';').
    replace(optimizer.space,' ').
    replace(optimizer.tagright,'> ').
    replace(optimizer.tagleft,' <');

  // End wrap res@ String
  // use default paramKey to compline
  res = 'with(__x__||{}){ ' + res + '\'; }';
  res = '\n var _t,_d,_est=__t__.est,_=__t__.encode,__=__t__.extend,_p=\'\'; ' + res + ' return _p; \n';

  // Complete building Function string
  // try to build anmousyous function
  // console.warn(res);
  try{
    // render = ev('(function(__tools__,__x__){ '+res+' })');
    render = new Function("__t__", "__x__", res);
  }catch(e){
    console.error("[cubec view] render template parser error!", { render : res });
    e.res = res;
    throw e;
  }

  // @ Precomplete JavaScript Template Function
  // @ the you build once template that use diff Data, not use diff to build function again
  // @ protect your template code other can observe it?
  renderToString = function(data){
    return trim(render.call(binder.view, tools, data));
  };

  return renderToString;

  // class hidden in v8
  eval(res); //eslint-disable-line
}
