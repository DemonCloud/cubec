import slice from '../tools/slice';
import eq from '../tools/eq';
import axt from './axt';

function memoize(fn,context){
  let i, memo = [];
  return function(){
    var args = slice(arguments),df;
    for(i=memo.length; i--; )
      if(eq(memo[i][0],args))
        return (df=memo[i][1]);

    memo.push([args,df=fn.apply(context||this,args)]);
    return df;
  };
}

export default function axtc(){
  return memoize(axt.apply(this,arguments));
}

