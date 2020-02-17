import MODEL from '../../../constant/model.define';
import { registerLink } from '../linkSystem';

registerLink("get", "toJSON", MODEL.LINKTYPES.solve, function(){
  return function(data){
    return JSON.stringify(data);
  };
});
