import {
  _idt,
  _isString,
  _eachArray,
  _get,
  _eq,
} from '../usestruct';

const replaceChangeReg = /^change:/;

function changeDetector(model,currentData,prevData,preset){
  const res = [];
  const detectList = model._asc(_idt);
  model.emit("change", [currentData,prevData]);

  if(detectList.length){
    if(preset && _isString(preset)){
      const currentPath = `change:${preset}`;
      const testReg = new RegExp(`^${currentPath}\\.([a-zA-Z_$0-9])+`);

      _eachArray(detectList, function(path){
        if(currentPath === path || testReg.test(path)){
          const spath = path.replace(replaceChangeReg,'');
          const cv = _get(currentData,spath);
          const pv = _get(prevData,spath);

          if(!_eq(cv,pv)) res.push([path,[cv,pv]]);
        }
      });
    }else{
      _eachArray(detectList, function(path){
        const spath = path.replace(replaceChangeReg,'');
        const cv = _get(currentData,spath);
        const pv = _get(prevData,spath);

        if(!_eq(cv,pv)) res.push([path,[cv,pv]]);
      });
    }
  }

  _eachArray(res,function([event,args]){ model.emit(event,args); });

  return model;
}

export default changeDetector;
