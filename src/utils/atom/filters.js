import { _has } from '../usestruct';

const filters = function(atomInstance, models, existModels, reval=false){
  return models.filter(function(m){
    const res = _has(existModels, m);
    return reval ? res : !res;
  });
};

export default filters;
