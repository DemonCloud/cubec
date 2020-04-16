import _model from './packages/model';
import _atom from './packages/atom';
import _view from './packages/view';
import _router from './packages/router';
import _verify from './packages/verify';
import * as _struct from './utils/usestruct';
import { createC, createExtend } from './utils/create';

// create cubec
export const cubec = Object.create(null);

// information
cubec.version = "1.9.19";

// enter instance
_view.__instance[0] = _model;
_view.__instance[1] = _atom;

// verify utils functions
export const struct = cubec.struct = Object.freeze(_struct);
export const verify = cubec.verify = _verify;

// create module
export const model = cubec.model = createC(_model);
export const view = cubec.view = createC(_view);
export const router = cubec.router = createC(_router);

// create extend option
view.extend = createExtend(_view);
model.extend = createExtend(_model);
router.extend = createExtend(_router);

// freeze
Object.freeze(cubec);

export default cubec;
