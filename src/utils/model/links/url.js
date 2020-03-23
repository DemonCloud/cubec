import MODEL from '../../../constant/model.define';
import { registerLink } from '../linkSystem';
import { _slice, _trim } from '../../usestruct';

const linkProto = "url";

const urlLink = function(){
  const requestUrl = _trim(_slice(arguments).join(""));

  return function(options={}){
    options = options || {};
    options.url = requestUrl;
    return options;
  };
};

registerLink("request", linkProto, MODEL.LINKTYPES.before, urlLink);
