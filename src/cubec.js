import _model from './packages/model';
import _atom from './packages/atom';
import _view from './packages/view';
import _router from './packages/router';
import _verify from './packages/verify';
import htmlDiff from './utils/view/htmlDiff';
import { registerLink } from './utils/model/linkSystem';
import * as _struct from './utils/usestruct';

import { createC, createExtend } from './utils/create';

const cubec = Object.create(null);

// information
cubec.version = "1.8.0";

_view.__instance[0] = _model;
_view.__instance[1] = _atom;

// verify utils functions
// export usestruct for cubec plugin [cubec-jsform]
// since version 1.7.0. struct is not a part of cubec module.
// if you want to import struct
// please ( import struct from "ax-struct-js" ) [ npm install ax-struct-js@latest  ]
// export const struct = cubec.struct = _struct;
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
model.link = registerLink;
view.extend = createExtend(_view);
view.plugin = htmlDiff.pluginRegister;
router.extend = createExtend(_router);

export default Object.freeze(cubec);
