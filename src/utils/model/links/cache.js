import { registerLink } from '../linkSystem';
import MODEL from '../../../constant/model.define';

const linkProto = "cache";
const cacheLink = function(){
  return function(options={}){
    options = options || {};
    options.cache = true;

    return options;
  };
};

registerLink("update",  linkProto, MODEL.LINKTYPES.before, cacheLink);
registerLink("request", linkProto, MODEL.LINKTYPES.before, cacheLink);
