import _struct from './lib/struct';
import _model from './packages/model';
import _atom from './packages/atom';
import _view from './packages/view';
import _router from './packages/router';
import _verify from './packages/verify';

import createC from './utils/createC';
import createExtend from './utils/createExtend';

const cubec = Object.create(null);

// information
cubec.version = "1.4.4";

// utils
cubec.struct = _struct;
cubec.verify = _verify;

// create module
cubec.atom = createC(_atom);
cubec.model = createC(_model);
cubec.view = createC(_view);
cubec.router = createC(_router);

// create Extra option
cubec.atom.extend = createExtend(_atom);
cubec.model.extend = createExtend(_model);
cubec.view.extend = createExtend(_view);
cubec.router.extend = createExtend(_router);

export const struct = _struct;
export const verify = _verify;
export const atom = cubec.atom;
export const model = cubec.model;
export const view = cubec.view;
export const router = cubec.router;

export default Object.freeze(cubec);
