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

export default function update(model, options, runtimeLinks, solveLinks, catchLinks){
  let promiseObj;

  if(modelLockStatus(model)){
    const type = "model on lock, update interrupted";
    const catchError = { http: -1, type: type, response:model.get() };
    promiseObj = Promise.resolve([null, catchError]);

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
      url: url,
      type: MODEL.EMULATEHTTP[requestType] || "GET",
      header: { 'X-HTTP-Method-Override': requestType }
    });

    // create Promise object type
    const singlePromiseObj = new Promise(function(resolve, reject){
      const single = "single";

      if(isSingle) model.emit("update");

      settings.success = function(data, xhr, event){
        let exportData;
        const backData = _clone(data);

        if(useRuntime && isSingle) data = linkCaller(runtimeLinks, [data, single]);

        if(data == null && isSingle){
          const type = "catch links update [runtime] interrupted";
          const catchError = { http: xhr.status, type: type, response: backData };

          if(useCatch) exportData = linkCatchCaller(catchLinks, [catchError, single]);

          // console.warn(catchPreset + type, data, xhr, event);
          resolve([
            exportData,
            catchError
          ]);

          if(isSingle)
            model.emit("catch:update", data, catchError);

          return model;
        }

        const invalidSetData = (data == null);

        if(!invalidSetData){
          exportData = _clone(data);
          exportData = (useSolve && isSingle) ? linkCaller(solveLinks, [exportData, single]) : exportData;
        }

        const invalidExportData = (exportData == null);

        if((invalidSetData || invalidExportData) && isSingle) {
          const type = invalidExportData ?
            "catch links update [solve] interrupted" :
            "catch update-data is not plainobject interrupted";
          const catchError = { http: xhr.status, type: type, response: backData };

          if(useCatch) exportData = linkCatchCaller(catchLinks, [catchError, single]);

          resolve([
            exportData,
            catchError
          ]);

          if(isSingle)
            model.emit("catch:update", data, catchError);
          // console.warn(catchPreset + type, data, xhr, event);
          return model;
        }

        // after runtime
        // after solve
        // is single request
        // set model data
        resolve([exportData]);

        if(isSingle){
          model.set(data);
          model.emit("update:success", data);
        }

        return model;
      };

      settings.error = function(errData, xhr, event){
        let exportData;
        const type = "catch update request http unexcept error";
        const catchError = { http: xhr.status || -1, type: type, response: errData || xhr.response || xhr.responseText };

        if(useCatch && isSingle) exportData = linkCatchCaller(catchLinks, [catchError, single]);

        resolve([
          exportData,
          catchError
        ]);

        if(isSingle)
          model.emit("catch:update", errData, catchError);

        return model;
      };

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
      const multipSign = "multip";

      model.emit('update');

      Promise.all(requestQueue).then(function(datas){
        let exportData;
        const orgDatas = _clone(datas) || MODEL.LINKPERSET;

        if(useRuntime) datas = linkCaller(runtimeLinks, [datas, multipSign]);

        // must use runtime
        if(datas == null || !useRuntime){
          const type = "catch links update [runtime] interrupted";
          const http = [];
          const response = [];

          _map(orgDatas, function(singlePromiseDatas){
            const [data, err] = singlePromiseDatas;
            http.push(data == null ? err.http : 200);
            response.push(singlePromiseDatas);
          });

          const catchError = {
            http: http,
            type: type,
            response: response
          };

          if(useCatch) datas = linkCatchCaller(catchLinks, [catchError, multipSign]);
          // console.warn(catchPreset + type, datas);
          resolve([
            datas,
            catchError
          ]);

          return model.emit("catch:update", datas, catchError);
        }

        // solve values
        const invalidSetData = !datas || !_isPlainObject(datas);
        if(!invalidSetData){
          exportData = _clone(datas);
          exportData = useSolve ? linkCaller(solveLinks, [exportData, multipSign]) : exportData;
        }
        const invalidExportData = (exportData == null);

        if(invalidSetData || invalidExportData) {
          const type = invalidExportData ?
            "catch links update [solve] interrupted" :
            "catch update-data is not plainobject interrupted";
          const http = [];
          const response = [];
          _map(orgDatas, function(singlePromiseDatas){
            const [data, err] = singlePromiseDatas;
            http.push(data == null ? err.http : 200);
            response.push(singlePromiseDatas);
          });

          const catchError = {
            http: http,
            type: type,
            response: response
          };

          if(useCatch) exportData = linkCatchCaller(catchLinks, [catchError, multipSign]);
          // console.warn(catchPreset + type, datas);

          resolve([
            exportData,
            catchError
          ]);

          return model.emit("catch:update", datas, catchError);
        }

        resolve([exportData]);

        model.set(datas);
        return model.emit("update:success", datas);
      });
    });

    return promiseObj;
  }

  // single promise
  promiseObj = createPromiseUpdateTask(model.url, options.param);

  return promiseObj;
}
