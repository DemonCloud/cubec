import { _idt } from '../usestruct';

export default function(model) {
  let isLock = model._asl(_idt);

  if (isLock) model.emit('catch:lock');

  return isLock;
}

