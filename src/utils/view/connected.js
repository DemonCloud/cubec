import {
  _isArray,
  _eachArray,
  _slice,
} from '../usestruct';

export default function(view, instance, args, caller){
  let items = _isArray(args) ? args : _slice(arguments);

  if (items.length) {
    _eachArray(items, item => {
      if ((
        item instanceof instance[0] ||  // model
        item instanceof instance[1]) && // atom
        item._mid != null
      ) {
        caller.call(view, item);
      }
    });
  }

  return view;
}
