import _model from './packages/model';
import _atom from './packages/atom';
import _view from './packages/view';
import _router from './packages/router';
import _verify from './packages/verify';
import * as _struct from './utils/usestruct';
import { createC, createExtend } from './utils/create';

export const cubec = Object.create(null);

// information
cubec.version = "1.9.13";
cubec.author = "YiJun";

// enter instance
_view.__instance[0] = _model;
_view.__instance[1] = _atom;

// verify utils functions
export const struct = cubec.struct = _struct;
export const verify = cubec.verify = _verify;

// create module
export const atom = cubec.atom = createC(_atom);
export const model = cubec.model = createC(_model);
export const view = cubec.view = createC(_view);
export const router = cubec.router = createC(_router);

// create extend option
atom.extend = createExtend(_atom);
view.extend = createExtend(_view);
model.extend = createExtend(_model);
router.extend = createExtend(_router);

Object.freeze(cubec);

export default cubec;
