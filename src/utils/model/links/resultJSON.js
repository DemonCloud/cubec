import { registerLink } from '../linkSystem';
import {
  _map,
  _isString,
  _isArrayLike,
  _isPlainObject
} from '../../usestruct';

const linkProto = "resultJSON";
const resultJSON = function(){
  return function(data, mode){
    let isMultiple = (mode === "multip");
    let parseData = null;

    if(data && _isString(data))
      try{
        parseData = JSON.parse(data);
      }catch(e){ /*eslint-disable*/ }

    else if(_isArrayLike(data) && isMultiple)
      parseData = _map(data, function(singleData){
        let single = null;

        try{
          let [pickData, err] = singleData;

          if(err)
            single = singleData;
          else if(!err && _isString(pickData))
            single = JSON.parse(pickData);
          else if(pickData && (_isPlainObject(pickData) || _isArrayLike(pickData)))
            single = pickData;

        }catch(e){ /*eslint-disable*/ }

        return single === singleData ? singleData : [single];
      })
    else if(_isPlainObject(data) || _isArrayLike(data))
      parseData = data;

    // console.log(parseData);

    return [parseData, mode];
  };
};

registerLink("update",  linkProto, "runtime", resultJSON);
registerLink("request", linkProto, "runtime", resultJSON);
