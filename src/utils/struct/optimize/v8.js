 export default function v8(obj){
  let $ = function(){};
  $.prototype = obj;

  let l = 8;
  while(l--) new $();
  return obj;
  // Prevent the function from being optimized through dead code elimination
  // or further optimizations. This code is never reached but even using eval
  // in unreachable code causes v8 to not optimize functions.

  eval(obj); // eslint-disable
}
