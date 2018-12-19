import struct from '../lib/struct';

const _type = struct.type();
const _each = struct.each('array');

function atomAssertMatch(list, match) {
  let use = [];

  switch (_type(match)) {
    case 'regexp':
      _each(list, m => match.test(m.name) && use.push(m));
      break;
    case 'string':
      use.push(match);
      break;
    case 'array':
      use = match;
      break;
    case 'function':
      _each(list, m => match(m) && use.push(m));
      break;
    default:
      break;
  }

  return use;
}

export default atomAssertMatch;
