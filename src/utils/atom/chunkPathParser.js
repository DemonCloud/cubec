import { dot } from '../usestruct';

export default function(path){
  const res = [];

  if(path){

    if(path.indexOf(dot) !== -1){
      // deeppath
      const paths = path.split(dot);
      const nameSpace = paths.shift();
      const deepPath = paths.join(dot);
      res.push(nameSpace, deepPath);
    }else{
      // single path
      res.push(path);
    }

  }

  return res;
}

