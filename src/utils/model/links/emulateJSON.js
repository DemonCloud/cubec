import { registerLink } from '../linkSystem';

const linkProto = "emulateJSON";
const emulateJSONLink = function(emulate=true){
  return function(options={}){
    options = options || {};
    options.emulateJSON = emulate;

    if(emulate){
      if(!options.header){ options.header = {}; }
      options.header['Content-Type'] = "application/json";
    }

    return options;
  };
};

registerLink("update",  linkProto, "before", emulateJSONLink);
registerLink("request", linkProto, "before", emulateJSONLink);
