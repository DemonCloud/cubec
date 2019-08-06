import _view from './packages/view';
import {createC, createExtend} from './utils/create';

const view = createC(_view);
view.extend = createExtend(_view);

export default view;
