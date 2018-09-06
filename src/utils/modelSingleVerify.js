import struct from '../lib/struct';
import modelMutipleVerify from './modelMultipleVerify';

const _set = struct.prop("set");

function modelSingleVerify(key, val, model){
  return !model._v ||
    modelMutipleVerify(_set(model.get(),key,val), model);
}

export default modelSingleVerify;
