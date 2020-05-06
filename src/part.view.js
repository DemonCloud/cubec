import _view from './packages/view';
import { createC, createExtend } from './utils/create';

// create cubec
export const view = createC(_view);

// create extend option
createExtend(view, _view);

export default view;

