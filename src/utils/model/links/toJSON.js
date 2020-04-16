import MODEL from '../../../constant/model.define';
import { registerLink } from '../linkSystem';

const toJSONLink = function(){
  return function(data){
    return JSON.stringify(data);
  };
};

registerLink("get", "toJSON", MODEL.LINKTYPES.solve, toJSONLink);
