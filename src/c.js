import model from './packages/model';
import view from './packages/view';
import atom from './packages/atom';
import struct from 'ax-struct-js';

import createC from './utils/createC';
import createExtend from './utils/createExtend';

const c = function(){};
c.prototype = c.__proto__ = null;

c.version = "0.0.1";
c.struct = struct;

c.model = createC(model);
c.model.extend = createExtend(model);

export default Object.freeze(c);
