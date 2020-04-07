
export default function(path){
  const res = [];

  if(path.indexOf(".") !== -1){
    // deeppath
    const paths = path.split(".");
    const nameSpace = paths.shift();
    const deepPath = paths.join('.');

    res.push(nameSpace, deepPath);
  }else{
    // single path
    res.push(path);
  }

  return res;
}

