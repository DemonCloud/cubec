function atomAssertModel(name){
  return function(m){
    return m.name === name;
  };
}

export default atomAssertModel;
