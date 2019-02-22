import {
  _idt,
  _isFn,
  _eachArray,
  _emit
} from '../usestruct';

export default function(router, path, actions, args, isResolve, isPopState, isStart){
  const emitargs = [path].concat(args);
  const beforeActions = router._b(_idt);

  try{
    if(beforeActions.apply(router,emitargs)){

      if(!isPopState && !isStart) history[isResolve ? 'replaceState' : 'pushState'](args[2], null, path);

      // use action
      _eachArray(actions, function(action){ if(_isFn(action)) action.apply(router,args); });

      _emit(router,"completeActions",emitargs);
    }else{
      _emit(router,'preventActions', emitargs);
    }
  }catch(e){
    console.error(e);
    _emit(router,"catch",emitargs);
  }
}
