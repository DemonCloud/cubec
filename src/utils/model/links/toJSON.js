import { registerLink } from '../linkSystem';

registerLink("get", "toJSON", "solve", function(){
  return function(data){
    return JSON.stringify(data);
  };
});
