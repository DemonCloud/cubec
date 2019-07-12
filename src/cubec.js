import _struct from './lib/struct';
import _model from './packages/model';
import _atom from './packages/atom';
import _view from './packages/view';
import _router from './packages/router';
import _verify from './packages/verify';

import { createC, createExtend } from './utils/create';

const cubec = Object.create(null);

// information
cubec.version = "1.5.11";

// utils
export const struct = cubec.struct = _struct;
export const verify = cubec.verify = _verify;

// create module
export const atom = cubec.atom = createC(_atom);
export const model = cubec.model = createC(_model);
export const view = cubec.view = createC(_view);
export const router = cubec.router = createC(_router);

// create Extra option
atom.extend = createExtend(_atom);
model.extend = createExtend(_model);
view.extend = createExtend(_view);
router.extend = createExtend(_router);

export default Object.freeze(cubec);
