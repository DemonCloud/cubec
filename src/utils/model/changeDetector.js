import {
  _idt,
  _isString,
  _eachArray,
  _get,
  _has,
  _eq,
  empty
} from '../usestruct';

const sign = ".";
const replaceChangeReg = /^change:/;

// match set path matcher
const presetParser = function(setPath){
   // setPath-> a.b.c => [a.b.c, a.b, a];
   const paths = [];
   if(setPath && setPath.length){
     const getDotPath = setPath.split(sign);
     if(getDotPath.length > 1){
       // first pop one sign
       getDotPath.pop();
       while(getDotPath.length){
         // pop end path
         paths.push(getDotPath.join(sign));
         getDotPath.pop();
       }
     }
   }

   return paths;
};

// detector change with currentData & prevData
function changeDetector(model ,currentData ,prevData ,preset){
  const res = [];
  const detectList = model._asc(_idt);

  // first target change event
  model.emit("change", [currentData,prevData]);

  if(detectList.length){
    if(preset && _isString(preset)){
      const currentPath = `change:${preset}`;
      const testReg = new RegExp(`^${currentPath}\\.([a-zA-Z_$0-9])+`);

      _eachArray(detectList, function(path){
        if(currentPath === path || testReg.test(path)){
          const spath = path.replace(replaceChangeReg,empty);
          const cv = _get(currentData,spath);
          const pv = _get(prevData,spath);
          if(!_eq(cv,pv)) res.push([path, [cv, pv]]);
        }
      });

      // if preset change
      // then enter emit tasks [parent path]
      _eachArray(presetParser(preset), function (ppath) {
        const fixEvent = `change:${ppath}`;
        // if preset parent in detectList
        if (_has(detectList, fixEvent)) {
          const cv = _get(currentData, ppath);
          const pv = _get(prevData, ppath);
          if (!_eq(cv, pv)) res.push([fixEvent, [cv, pv]]);
        }
      });

    }else{
      // not preset, detect all
      _eachArray(detectList, function(path){
        const spath = path.replace(replaceChangeReg,empty);
        const cv = _get(currentData,spath);
        const pv = _get(prevData,spath);
        if(!_eq(cv,pv)) res.push([path,[cv,pv]]);
      });

    }
  }

  // emit deep.key tasks
  _eachArray(res, function([event,args]){
    model.emit(event,args);
  });

  return model;
}

export default changeDetector;

