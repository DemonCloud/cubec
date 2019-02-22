import {
  _type,
  _eachArray,
} from '../usestruct';

export default function(list, match) {
  let use = [];

  switch (_type(match)) {
    case 'regexp':
      _eachArray(list, m => match.test(m.name) && use.push(m));
      break;
    case 'string':
      use.push(match);
      break;
    case 'array':
      use = match;
      break;
    case 'function':
      _eachArray(list, m => match(m) && use.push(m));
      break;
    default:
      break;
  }

  return use;
}
