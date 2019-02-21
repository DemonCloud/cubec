import struct from '../../lib/struct';

const _idt = struct.broken;

export default function(model) {
  let isLock = model._asl(_idt);

  if (isLock) model.emit('catch:lock');

  return isLock;
}
