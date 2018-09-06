import model from './packages/model';
import view from './packages/view';
import atom from './packages/atom';
import verify from './packages/verify';
import struct from './lib/struct';

import createC from './utils/createC';
import createExtend from './utils/createExtend';

const c = Object.create(null);

c.version = "0.0.1";
c.struct = struct;
c.verify = verify;

// create module
c.atom = createC(atom);
c.view = createC(view);
c.model = createC(model);

// create Extra option
c.atom.extend = createExtend(atom);
c.view.extend = createExtend(view);
c.model.extend = createExtend(model);

export default Object.freeze(c);
