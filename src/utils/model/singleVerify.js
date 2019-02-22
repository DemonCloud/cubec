import {
  _idt,
  _set,
  _get,
  _keys,
  _find,
  _toString,
  _type,
} from '../usestruct';

export default function(key, val, model) {
  if (!model._v) return true;

  let verify = model._asv(_idt);
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
        } ) except error with model verify => ${_type(
          value,
        ).toUpperCase()} [ ${_toString(value)} ]`,
      );
      break;
    }
  }

  valid = !error.length;

  if (!valid) {
    model.emit('catch:verify', error);
    model.emit(`catch:verify:${parKey}`, error);
  }

  return valid;
}
