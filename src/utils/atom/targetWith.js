export default function(cmd, args) {
  return function(model) {
    return model[cmd].apply(model, args);
  };
}
