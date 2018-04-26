function atomTargetWith(cmd, args) {
  return function(model) {
    return model[cmd].apply(model, args);
  };
}

export default atomTargetWith;
