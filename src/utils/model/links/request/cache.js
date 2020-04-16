import MODEL from '../../../../constant/model.define';
import { registerLink } from '../../linkSystem';

const linkProto = "cache";
const cacheLink = function(){
  return function(options={}){
    options = options || {};
    options.cache = true;

    return options;
  };
};

registerLink("request", linkProto, MODEL.LINKTYPES.before, cacheLink);