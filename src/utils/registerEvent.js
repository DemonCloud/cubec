export default function(fn, type) {
  return this.on(type, fn);
}
