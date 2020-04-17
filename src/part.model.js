import _model from './packages/model';
import _verify from './packages/verify';
import * as _struct from './utils/usestruct';
import { createC, createExtend } from './utils/create';

const lock = _struct._lock;

// create cubec
export const model = createC(_model);

// information
model.version = "1.9.19";

// verify utils functions
export const struct = model.struct = lock(_struct);
export const verify = model.verify = lock(_verify);

// create extend option
createExtend(model, _model);

export default model;

