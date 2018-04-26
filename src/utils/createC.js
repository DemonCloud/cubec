function createC(module) {
  return function(o) {
    return new module(o || {});
  };
}

export default createC;
