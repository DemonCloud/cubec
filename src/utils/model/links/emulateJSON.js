import MODEL from '../../../constant/model.define';
import { registerLink } from '../linkSystem';

const linkProto = "emulateJSON";
const emulateJSONLink = function(emulate=true){
  return function(options={}){
    options = options || {};
    options.emulateJSON = emulate;

    if(emulate){
      if(!options.header){ options.header = {}; }
      if(!options.type || (options.type && options.type.toLowerCase() !== "get"))
        options.header['Content-Type'] = "application/json";
    }

    return options;
  };
};

registerLink("update",  linkProto, MODEL.LINKTYPES.before, emulateJSONLink);
registerLink("request", linkProto, MODEL.LINKTYPES.before, emulateJSONLink);
