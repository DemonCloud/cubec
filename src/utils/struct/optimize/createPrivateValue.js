import idt from '../constant/broken';

// create private pointer variable [array, object, function]
const createPrivateValue = function(returnValue, brokenValue){
  return function(_idt){
    return _idt === idt ? returnValue : brokenValue;
  };
};

export default createPrivateValue;

