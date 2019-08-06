function createBounder(fn, context){
  if(context == null) return fn;

  return function(){
    return fn.apply(context,arguments);
  };
}

export default function eachArray(ary, fn, context){
  const bounder = createBounder(fn,context);
  let i=0, len = ary.length;
  for(; i<len; i++) bounder(ary[i],i,ary);
  return ary;
}
