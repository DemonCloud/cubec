import axt from './axt';

function memoize(fn,context){
  let i, memo = [];

  return function(data){
    let df;

    for(i=memo.length; i--; )
      if(memo[i][0] === data)
        return (df=memo[i][1]);

    memo.push([data,df=fn.apply(context||this, data)]);

    return df;
  };
}

export default function axtc(){
  return memoize(axt.apply(this, arguments));
}

