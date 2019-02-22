import { _eachObject, _define } from './usestruct';

export default function(item, props) {
  _eachObject(props, function(t, n) {
    _define(item, n, {
      value: t,
      writable: false,
      enumerable: false,
      configurable: false,
    });
  });

  return item;
}
