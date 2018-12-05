import struct from '../lib/struct';

const _identify = struct.broken;

export default function(model) {
  let isLock = model._asl(_identify);

  if (isLock)
    model.emit('catch:lock');

  return isLock;
}
