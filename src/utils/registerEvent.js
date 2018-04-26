function registerEvent(fn, type) {
  return this.on(type, fn);
}

export default registerEvent;
