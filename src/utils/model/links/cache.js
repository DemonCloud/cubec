import { registerLink } from '../linkSystem';

const linkProto = "cache";
const cacheLink = function(){
  return function(options={}){
    options = options || {};
    options.cache = true;

    return options;
  };
};

registerLink("update",  linkProto, "before", cacheLink);
registerLink("request", linkProto, "before", cacheLink);
