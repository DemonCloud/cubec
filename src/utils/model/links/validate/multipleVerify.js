import {
  _keys,
  _get,
  _type,
} from '../../../usestruct';
import output from './outputFormaterVerify';

export default function(newData, model, verify, eventName) {
  const error = [];
  const key = _keys(verify);
  const s = key.length;
  let i = 0;
  let isRequired, value, valid, errorKey;

  for (; i < s; i++) {
    // get validate funtion
    isRequired = verify[key[i]];
    value = _get(newData, key[i]);

    if (!isRequired(value)) {
      error.push(key[i], value);

      console.error(`[cubec model] [${model.name || model._mid}] model verify of key [${key[i]}] except error with checker => ${_type(value).toUpperCase()} [ ${output(value)} ]`);

      errorKey = key[i];

      break;
    }
  }

  valid = !error.length;

  if (!valid) model.emit(`${eventName},${eventName}:${errorKey}`, error);

  return valid;
}

