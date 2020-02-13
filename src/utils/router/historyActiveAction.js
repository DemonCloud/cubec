import {
  _isFn,
  _eachArray,
  _fireEvent,
  _emit
} from '../usestruct';

export default function(router, path, actions, args, isResolve, isPopState, isStart){
  const emitargs = [path].concat(args);

  try{
    const allow = _fireEvent(router, "beforeActions", emitargs);

    if(allow && allow[0]){

      if(!isPopState && !isStart) history[isResolve ? 'replaceState' : 'pushState'](args[2], null, path);

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
