export default function(module) {
  return function(o) {
    return new module(o || {});
  };
}
