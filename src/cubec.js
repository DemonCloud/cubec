import struct from './lib/struct';
import model from './packages/model';
import atom from './packages/atom';
import view from './packages/view';
import router from './packages/router';
import verify from './packages/verify';

import createC from './utils/createC';
import createExtend from './utils/createExtend';

const cubec = Object.create(null);

// information
cubec.version = "1.4.2";

// utils
cubec.struct = struct;
cubec.verify = verify;

// create module
cubec.atom = createC(atom);
cubec.model = createC(model);
cubec.view = createC(view);
cubec.router = createC(router);

// create Extra option
cubec.atom.extend = createExtend(atom);
cubec.model.extend = createExtend(model);
cubec.view.extend = createExtend(view);
cubec.router.extend = createExtend(router);

export default Object.freeze(cubec);
