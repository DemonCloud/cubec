import struct from '../../lib/struct';

const _identify = struct.broken;
const _keys = struct.keys();
const _get = struct.prop('get');
const _toString = struct.convert('string');
const _typec = struct.type();

function modelMutipleVerify(newData, model) {
  if (!model._v) return true;

  let verify = model._asv(_identify);
  let error = [];
  let key = _keys(verify);
  let i = 0;
  let s = key.length;
  let isRequired, value, valid, errorKey;

  for (; i < s; i++) {
    // get validate funtion
    isRequired = verify[key[i]];
    value = _get(newData, key[i]);

    if (!isRequired(value)) {
      error.push(key[i], value);

      console.error(
        `model of key ( ${key[i]} ) except error with model verify => ${_typec(
          value,
        ).toUpperCase()} [ ${_toString(value)} ]`,
      );

      errorKey = key[i];

      break;
    }
  }

  valid = !error.length;

  if (!valid) {
    model.emit('catch:verify', error);
    model.emit(`catch:verify:${errorKey}`, error);
  }

  return valid;
}

export default modelMutipleVerify;
