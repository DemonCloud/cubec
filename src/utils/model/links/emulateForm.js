import MODEL from '../../../constant/model.define';
import { registerLink } from '../linkSystem';

const linkProto = "emulateForm";
const emulateFormLink = function(){
  return function(options={}){
    options = options || {};
    options.type = "POST";

    if(options.header) {
      delete options.header['Content-Type'];
    }

    return options;
  };
};

registerLink("update",  linkProto, MODEL.LINKTYPES.before, emulateFormLink);
registerLink("request", linkProto, MODEL.LINKTYPES.before, emulateFormLink);
