import {
  _isFn,
  _eachArray,
  _fireEvent,
  _lock,
  _emit
} from '../usestruct';

export default function(router, path, actions, args, isResolve, isPopState, isStart){
  const emitargs = ([path].concat(args)).concat([_lock({
    resolve: isResolve,
    popstate: isPopState,
    start: isStart
  })]);

  try{
    const allow = _fireEvent(router, "beforeActions", emitargs);

    if(allow && allow[0]){

      // not popstate or static refresh current path
      if(!isPopState && !isStart)
        history[isResolve ? 'replaceState' : 'pushState'](args[2], null, path);

      // console.log(router);

      // use action
      _eachArray(actions, function(action){ if(_isFn(action)) action.apply(router, emitargs); });

      _emit(router,"completeActions",emitargs);
    }else{
      _emit(router,'preventActions', emitargs);
    }
  }catch(e){
    _emit(router,"catch",emitargs);
    console.error(e);
  }
}

