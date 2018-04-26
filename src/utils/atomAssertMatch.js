import struct from 'ax-struct-js';

const _type = struct.type();
const _each = struct.each('array');

function atomAssertMatch(list, match) {
  var use = [];

  switch (_type(match)) {
    case 'regexp':
      _each(list, m => match.test(m.name) && use.push(m.name));
      break;
    case 'string':
      use.push(match);
      break;
    case 'array':
      use = match;
      break;
    default:
      break;
  }

  return use;
}

export default atomAssertMatch;
