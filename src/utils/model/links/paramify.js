import { registerLink } from '../linkSystem';
import {
  _merge,
  _isObject,
  _slice,
} from '../../usestruct';

const linkProto = "paramify";

const paramifyLink = function(useOptions){
  const staticOptions = useOptions || {};

  return function(params={}){
    const args = _slice(arguments);

    if(args.length > 1)
      params = args;
    else
      params = (params && _isObject(params)) ? params : {};

    const createOptions = _merge(staticOptions, {
      param: params
    });

    return createOptions;
  };
};

registerLink("update",  linkProto, "before", paramifyLink);
registerLink("request", linkProto, "before", paramifyLink);
