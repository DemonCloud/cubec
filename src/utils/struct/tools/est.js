import slice from './slice';

export default function exist(check){
  var args = slice(arguments,1);
  if(check) args[args.length-1].apply(this,args);
}
