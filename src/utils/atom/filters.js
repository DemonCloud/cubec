import model from '../../packages/model';
import { _has } from '../usestruct';

const filters = function(models, existModels, reval=false){
  const filterUnUsed = models.filter(function(m){
    return m instanceof model;
  });

  return filterUnUsed.filter(function(m){
    const res = _has(existModels, m);
    return reval ? res : !res;
  });
};


export default filters;
