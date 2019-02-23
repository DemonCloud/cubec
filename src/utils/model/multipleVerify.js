import {
  _idt,
  _keys,
  _get,
  _type,
} from '../usestruct';
import output from './outputFormaterVerify';

export default function(newData, model) {
  if (!model._v) return true;

  let verify = model._asv(_idt);
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
        `model verify of key [ ${key[i]} ] except error with checker => ${_type(value).toUpperCase()} [ ${output(value)} ]`
      );

      errorKey = key[i];

      break;
    }
  }

  valid = !error.length;

  if (!valid)
    model.emit(`catch:verify,catch:verify:${errorKey}`, error);

  return valid;
}
