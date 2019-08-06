export default function ayc(fn){
  if(window.Promise)
    return window.Promise.resolve().then(fn);
  return setTimeout(fn,0);
}
