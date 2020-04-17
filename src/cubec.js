import _model from './packages/model';
import _atom from './packages/atom';
import _view from './packages/view';
import _router from './packages/router';
import _verify from './packages/verify';
import * as _struct from './utils/usestruct';
import { createC, createExtend } from './utils/create';

// create cubec
const lock = _struct._lock;

export const cubec = Object.create(null);

// information
cubec.version = "1.9.19";

// enter instance
_view.__instance[0] = _model;
_view.__instance[1] = _atom;

// verify utils functions
export const struct = cubec.struct = lock(_struct);
export const verify = cubec.verify = lock(_verify);

// create module
export const model = cubec.model = createC(_model);
export const view = cubec.view = createC(_view);
export const router = cubec.router = createC(_router);

// create extend option
createExtend(view, _view);
createExtend(model, _model);
createExtend(router, _router);

// freeze
lock(cubec);

export default cubec;

