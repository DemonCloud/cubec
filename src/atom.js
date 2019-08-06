import _atom from './packages/atom';
import {createC, createExtend} from './utils/create';

const atom = createC(_atom);
atom.extend = createExtend(_atom);

export default atom;
