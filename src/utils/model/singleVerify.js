import {
  _idt,
  _set,
  _get,
  _keys,
  _find,
  _type,
} from '../usestruct';
import output from './outputFormaterVerify';

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
        `model verify of key -> [ ${validKeys[i]} ] except error with checker => ${_type(value).toUpperCase()} [ ${output(value)} ]`,
      );

      break;
    }
  }

  valid = !error.length;

  if (!valid)
    model.emit(`catch:verify,catch:verify:${parKey}`, error);

  return valid;
}
