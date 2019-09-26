import MODEL from '../../constant/model.define';
import modelLockStatus from './lockstatus';
import { linkCaller, linkCatchCaller } from './linkSystem';
import {
  _ajax,
  _isPlainObject,
  _isArrayLike,
  _toString,
  _clone,
  _merge,
  _map,
} from '../usestruct';

// const catchPreset = "[cubec model] [update] ";

export default function(model, options, runtimeLinks, solveLinks, catchLinks){
  let promiseObj;

  if(modelLockStatus(model)){
    promiseObj = Promise.resolve([model.get(), {
      xhr: new XMLHttpRequest(),
      http: -1,
      type:"model on lock, update interrupted",
      response: null
    }]);

    return promiseObj;
  }

  const useCatch = (catchLinks && catchLinks.length) ? catchLinks : false;
  const useSolve = (solveLinks && solveLinks.length) ? solveLinks : false;
  const useRuntime = (runtimeLinks && runtimeLinks.length) ? runtimeLinks : false;
  const defaultOptions = MODEL.UPDATE_OPTIONS;
  const requestType = _toString(options.type || defaultOptions.type).toLowerCase();

  const createPromiseUpdateTask = function(url, param, isSingle=true){
    // create settings
    const settings = _merge(defaultOptions, options, {
      param: param,
      url: model.url,
      type: MODEL.EMULATEHTTP[requestType] || "GET",
      header: { 'X-HTTP-Method-Override': requestType }
    });

    // create Promise object type
    const singlePromiseObj = new Promise(function(resolve, reject){

      settings.success = function(data, xhr, event){
        let exportData;
        const catchArgs = ["single", xhr, event];
        if(useRuntime && isSingle) data = linkCaller(runtimeLinks, [data]);

        if(data == null && isSingle){
          if(useCatch) data = linkCatchCaller(catchLinks, catchArgs);

          const type = "catch links update [runtime] interrupted";
          // console.warn(catchPreset + type, data, xhr, event);

          return resolve([
            data,
            { http: xhr.status, type: type, response: data }
          ]);
        }

        const invalidSetData = !data || !_isPlainObject(data);

        if(!invalidSetData){
          exportData = _clone(data);
          exportData = (useSolve && isSingle) ? linkCaller(solveLinks, [exportData]) : exportData;
        }

        const invalidExportData = (exportData == null);

        if(invalidExportData && isSingle) {
          if(useCatch) exportData = linkCatchCaller(catchLinks, catchArgs);

          const type = invalidExportData ?
            "catch links update [solve] interrupted" :
            "catch update-data is not plainobject interrupted";
          // console.warn(catchPreset + type, data, xhr, event);

          return resolve([
            exportData,
            { http: xhr.status, type: type, response: data }
          ]);
        }

        // after runtime
        // after solve
        // is single request
        // set model data
        if(isSingle){
          model.set(data);
          model.emit("update:success", data);
        }

        resolve([exportData]);
      };

      settings.error = function(errData, xhr, event){
        let exportData;
        const catchArgs = ["single", xhr, event];
        const type = "catch update request http unexcept error";

        if(useCatch) exportData = linkCatchCaller(catchLinks, catchArgs);

        if(isSingle) model.emit("update:error", errData);

        return resolve([
          exportData,
          { http: xhr.status || -1, type: type, response: errData || xhr.response }
        ]);
      };

      if(isSingle) model.emit("update");

      return _ajax(settings);
    });

    return singlePromiseObj;
  };

  // mutilple urls
  if(_isArrayLike(model.url)){
    const requestQueue = _map(model.url, function(url, index){
      const param = (_isArrayLike(options.param) ? options.param[index] : options.param) || {};
      return createPromiseUpdateTask(url, param, false);
    });

    promiseObj = new Promise(function(resolve, reject) {
      Promise.all(requestQueue).then(function(datas){
        let exportData;
        const catchArgs = ["multip"].concat(datas);

        if(useRuntime) datas = linkCaller(runtimeLinks, datas);

        if(datas == null){
          if(useCatch) datas = linkCatchCaller(catchLinks, catchArgs);

          const type = "catch links update [runtime] interrupted";
          // console.warn(catchPreset + type, datas);

          return resolve([
            datas,
            { http: -1, type: type, response: datas }
          ]);
        }

        // solve values
        const invalidSetData = !datas || !_isPlainObject(datas);
        if(!invalidSetData){
          exportData = _clone(datas);
          exportData = useSolve ? linkCaller(solveLinks, [exportData]) : exportData;
        }
        const invalidExportData = (exportData == null);

        if(invalidExportData) {
          if(useCatch) exportData = linkCatchCaller(catchLinks, catchArgs);

          const type = invalidExportData ?
            "catch links update [solve] interrupted" :
            "catch update-data is not plainobject interrupted";
          // console.warn(catchPreset + type, datas);

          return resolve([
            exportData,
            { http: -1, type: type, response: datas }
          ]);
        }

        model.set(datas);
        model.emit("update:success", datas);
      });

      model.emit('update');
    });
  }

  promiseObj = createPromiseUpdateTask(model.url, options.param);

  return promiseObj;
}
