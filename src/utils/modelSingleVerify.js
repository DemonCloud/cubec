import struct from '../lib/struct';
import modelMutipleVerify from './modelMultipleVerify';

const _identify = struct.broken;
const _set = struct.prop('set');
const _keys = struct.keys();
const _get = struct.prop('get');
const _find = struct.find();
const _toString = struct.convert('string');
const _typec = struct.type();

// function modelSingleVerify(key, val, model){
//   return !model._v ||
//     modelMutipleVerify(_set(model.get(),key,val), model);
// }

function modelSingleVerify(key, val, model) {
  if (!model._v) return true;

  let verify = model._asv(_identify);
  let validData = _set(model.get(), key, val);
  let keys = _keys(verify);
  let parReg = new RegExp(
    `^(${key.replace('.', '\\.')}|(${key.replace('.', '\\.')}\\.[^\s\S]*))$`,
    'm',
  );

  let validKeys = _find(keys, parReg);
  let error = [];
  let isRequired, valid, value, parKey;

  let i = 0;
  let s = validKeys.length;

  for (; i < s; i++) {
    parKey = validKeys[i];
    isRequired = verify[parKey];
    value = _get(validData, parKey);

    if (!isRequired(value)) {
      error.push(parKey, value);

      console.error(
        `model of key ( ${
          validKeys[i]
        } ) except error with model verify => ${_typec(
          value,
        ).toUpperCase()} [ ${_toString(value)} ]`,
      );
      break;
    }
  }

  valid = !error.length;

  if (!valid) {
    model.emit('catch:verify', error);
  }

  return valid;
}

export default modelSingleVerify;
