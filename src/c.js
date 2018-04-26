import model from './packages/model';
import view from './packages/view';
import atom from './packages/atom';
import verify from './packages/verify';
import struct from 'ax-struct-js';

import createC from './utils/createC';
import createExtend from './utils/createExtend';

const c = Object.create(null);

c.version = "0.0.1";
c.struct = struct;
c.verify = verify;

c.atom = createC(atom);
c.model = createC(model);

c.atom.extend = createExtend(atom);
c.model.extend = createExtend(model);

export default Object.freeze(c);
