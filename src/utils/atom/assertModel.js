export default function(name){
  return function(m){
    return m.name === name;
  };
}
