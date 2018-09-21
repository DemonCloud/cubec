import model from './packages/model';
import view from './packages/view';
import atom from './packages/atom';
import router from './packages/router';
import verify from './packages/verify';
import struct from './lib/struct';

import createC from './utils/createC';
import createExtend from './utils/createExtend';

const cubec = Object.create(null);

cubec.version = "1.0.0";
cubec.struct = struct;
cubec.verify = verify;

// create module
cubec.atom = createC(atom);
cubec.view = createC(view);
cubec.model = createC(model);
cubec.router = createC(router);

// create Extra option
cubec.atom.extend = createExtend(atom);
cubec.view.extend = createExtend(view);
cubec.model.extend = createExtend(model);
cubec.router.extend = createExtend(router);

export default Object.freeze(cubec);
