import _model from './packages/model';
import {createC, createExtend} from './utils/create';

const model = createC(_model);
model.extend = createExtend(_model);

export default model;
