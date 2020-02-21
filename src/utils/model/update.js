import MODEL from '../../constant/model.define';
import ERRORS from '../../constant/errors.define';
import modelLockStatus from './lockstatus';
import {linkCaller, linkCatchCaller} from './linkSystem';
import {_ajax, _clone, _isArrayLike, _isPlainObject, _map, _eachArray, _merge, _toString,} from '../usestruct';

export default function update(model, options, runtimeLinks, solveLinks, catchLinks){
  let promiseObj;
  const useUrls = options.url || model.url;

  if(modelLockStatus(model)){
    const type = ERRORS.MODEL_LINK_UPDATE_LOCKED;
    const catchError = { http: -1, type: type, response:model.get(), request: options };
    promiseObj = Promise.resolve([null, catchError]);

    return promiseObj;
  }

  if(!useUrls){
    const type = ERRORS.MODEL_LINK_UPDATE_WITHOUT_URL;
    const catchError = { http: -1, type: type, response:model.get(), request: options };
    promiseObj = Promise.resolve([null, catchError]);

    return promiseObj;
  }

  const useCatch = (catchLinks && catchLinks.length) ? catchLinks : false;
  const useSolve = (solveLinks && solveLinks.length) ? solveLinks : false;
  const useRuntime = (runtimeLinks && runtimeLinks.length) ? runtimeLinks : false;

  const defaultOptions = MODEL.UPDATE_OPTIONS;
  const requestType = _toString(options.type || defaultOptions.type).toLowerCase();

  const createPromiseUpdateTask = function(url, param, isSingle=true){

    const option = _merge(options, {
      type: MODEL.EMULATEHTTP[requestType] || "GET",
      param: param,
      url: url,
    });

    // create settings
    const settings = _merge(defaultOptions, option, {
      header: { 'X-HTTP-Method-Override': requestType }
    });

    // create Promise object type
    return new Promise(function (resolve, reject) {
      const single = "single";

      // emit update event;
      if (isSingle) model.emit("update");

      settings.success = function (data, xhr, event) {
        let exportData;
        const backData = _clone(data);

        if (useRuntime && isSingle) data = linkCaller(runtimeLinks, [data, single]);

        if (data == null && isSingle) {
          const type = ERRORS.MODEL_LINK_UPDATE_RUNTIME_CATCH;
          const catchError = {http: xhr.status, type: type, response: backData, request: option};

          if (useCatch) exportData = linkCatchCaller(catchLinks, [catchError, single]);

          // console.warn(catchPreset + type, data, xhr, event);
          resolve([
            exportData,
            catchError
          ]);

          if (isSingle) model.emit("catch:update", data, catchError);

          return model;
        }

        const invalidSetData = (data == null);

        if (!invalidSetData) {
          exportData = _clone(data);
          exportData = (useSolve && isSingle) ? linkCaller(solveLinks, [exportData, single]) : exportData;
        }

        const invalidExportData = (exportData == null);

        if ((invalidSetData || invalidExportData) && isSingle) {
          const type = invalidExportData ?
            ERRORS.MODEL_LINK_UPDATE_SOLVE_CATCH :
            ERRORS.MODEL_LINK_UPDATE_SOLVE_FORMAT_CATCH;
          const catchError = { http: xhr.status, type: type, response: backData, request: option };

          if (useCatch) exportData = linkCatchCaller(catchLinks, [catchError, single]);

          resolve([
            exportData,
            catchError
          ]);

          if (isSingle) model.emit("catch:update", data, catchError);

          // console.warn(catchPreset + type, data, xhr, event);
          return model;
        }

        // after runtime
        // after solve
        // is single request
        // set model data
        resolve([exportData]);

        if (isSingle) {
          model.set(data);
          model.emit("update:success", data);
        }

        return model;
      };

      settings.error = function (errData, xhr, event) {
        let exportData;
        const type = ERRORS.MODEL_LINK_UPDATE_HTTP_CATCH;
        const response = errData != null ? errData :
          (xhr.responseType === '' || xhr.responseType === 'text') ? xhr.responseText : xhr.response;
        const catchError = { http: xhr.status || -1, type: type, response, request: option };

        if (useCatch && isSingle) exportData = linkCatchCaller(catchLinks, [catchError, single]);

        resolve([
          exportData,
          catchError
        ]);

        if (isSingle) model.emit("catch:update", errData, catchError);

        return model;
      };

      return _ajax(settings);
    });
  };

  // update with multiple urls
  if(_isArrayLike(useUrls)){
    const requestQueue = _map(useUrls, function(url, index){
      const param = (_isArrayLike(options.param) ? options.param[index] : options.param) || {};
      return createPromiseUpdateTask(url, param, false);
    });

    promiseObj = new Promise(function(resolve, reject) {
      const multipleSign = "multip";

      model.emit('update');

      Promise.all(requestQueue).then(function(datas){
        let exportData;
        const http = [];
        const response = [];
        const orgDatas = _clone(datas) || MODEL.LINKPERSET;

        if(useRuntime) datas = linkCaller(runtimeLinks, [datas, multipleSign]);

        // must use runtime
        if(datas == null || !useRuntime){
          const type = ERRORS.MODEL_LINK_UPDATE_RUNTIME_CATCH;

          _eachArray(orgDatas, function(singlePromiseDatas){
            const [data, err] = singlePromiseDatas;
            http.push((data == null && err) ? err.http : (err ? err.http : 200));
            response.push(singlePromiseDatas);
          });

          const catchError = {
            http: http,
            type: type,
            response: response,
            request: options
          };

          if(useCatch) datas = linkCatchCaller(catchLinks, [catchError, multipleSign]);
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
          exportData = useSolve ? linkCaller(solveLinks, [exportData, multipleSign]) : exportData;
        }
        const invalidExportData = (exportData == null);

        if(invalidSetData || invalidExportData) {
          const type = invalidExportData ?
            ERRORS.MODEL_LINK_UPDATE_SOLVE_CATCH :
            ERRORS.MODEL_LINK_UPDATE_SOLVE_FORMAT_CATCH;

          _eachArray(orgDatas, function(singlePromiseDatas){
            const [data, err] = singlePromiseDatas;
            http.push((data == null && err) ? err.http : (err ? err.http : 200));
            response.push(singlePromiseDatas);
          });

          const catchError = {
            http: http,
            type: type,
            response: response,
            request: options
          };

          if(useCatch) exportData = linkCatchCaller(catchLinks, [catchError, multipleSign]);
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

  // single url
  promiseObj = createPromiseUpdateTask(useUrls, options.param);

  return promiseObj;
}
