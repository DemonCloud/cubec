import {
  _set,
  _get,
  _keys,
  _type,
} from '../../../usestruct';
import output from './outputFormaterVerify';

export default function(key, val, model, verify, eventName) {
  // if (!model._v) return true;

  let validData = _set(model.get(), key, val);
  let keys = _keys(verify);
  let parReg = new RegExp(
    `^(${key.replace('.', '\\.')}|(${key.replace('.', '\\.')}\\.[^\s\S]*))$`,
    'm',
  );

  let validKeys = keys.filter(v=>parReg.test(v));
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

      console.error(`model verify of key -> [${validKeys[i]}] except error with checker => ${_type(value).toUpperCase()} [ ${output(value)} ]`);

      break;
    }
  }

  valid = !error.length;

  if (!valid)
    model.emit(`${eventName},${eventName}:${parKey}`, error);

  return valid;
}

