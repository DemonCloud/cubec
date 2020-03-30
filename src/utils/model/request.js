import MODEL from '../../constant/model.define';
import ERRORS from '../../constant/errors.define';
import modelLockStatus from './lockstatus';
import { linkCaller, linkCatchCaller } from './linkSystem';
import {
  _ajax,
  _toString,
  _clone,
  _merge,
} from '../usestruct';

// import { isIE } from '../adapter';
// const contentIEsupported = !isIE || isIE > 9;

export default function request(model, options, runtimeLinks, solveLinks, catchLinks){
  let promiseObj;

  if(modelLockStatus(model)){
    const type = ERRORS.MODEL_LINK_REQUEST_LOCKED;
    const catchError = { http: -1, type: type, response: null, request: options };
    promiseObj = Promise.resolve([null, catchError]);
    return promiseObj;
  }

  if(!options ||
     !options.url){
    const type = ERRORS.MODEL_LINK_REQUEST_WITHOUT_URL;
    const catchError = { http: -1, type: type, response: null, request: options };
    promiseObj = Promise.resolve([null, catchError]);
    return promiseObj;
  }

  const useCatch = (catchLinks && catchLinks.length) ? catchLinks : false;
  const useSolve = (solveLinks && solveLinks.length) ? solveLinks : false;
  const useRuntime = (runtimeLinks && runtimeLinks.length) ? runtimeLinks : false;
  const defaultOptions = MODEL.REQUEST_OPTIONS;
  const requestType = _toString(options.type || defaultOptions.type).toLowerCase();

  const createPromiseUpdateTask = function(option){

    // create settings
    const settings = _merge(defaultOptions, option, {
      type: MODEL.EMULATEHTTP[requestType] || "GET",
      header: { 'X-HTTP-Method-Override': requestType }
    });

    // create Promise object type
    return new Promise(function(resolve, reject){
      const single = "single";

      settings.success = function(data, xhr, event){
        let exportData;
        const backData = _clone(data);

        if(useRuntime) data = linkCaller(runtimeLinks, [data, single]);

        if(data == null){
          const type = ERRORS.MODEL_LINK_REQUEST_RUNTIME_CATCH;
          const catchError = { http: xhr.status, type: type, response: backData, request: option };

          if(useCatch) exportData = linkCatchCaller(catchLinks, [catchError, single]);
          // console.warn(catchPreset + type, data, xhr, event);

          resolve([
            exportData,
            catchError
          ]);

          return model.emit("catch:request", data, catchError);
        }

        const invalidSetData = (data == null);

        if(!invalidSetData){
          exportData = _clone(data);
          exportData = useSolve ? linkCaller(solveLinks, [exportData, single]) : exportData;
        }

        const invalidExportData = (exportData == null);

        if(invalidExportData) {
          const type = ERRORS.MODEL_LINK_REQUEST_SOLVE_CATCH;
          const catchError = { http: xhr.status, type: type, response: backData, request: option };

          if(useCatch) exportData = linkCatchCaller(catchLinks, [catchError, single]);

          resolve([
            exportData,
            catchError
          ]);

          // console.warn(catchPreset + type, data, xhr, event);
          return model.emit("catch:request", data, catchError);
        }

        // after runtime
        // after solve
        // is single request
        resolve([exportData]);

        return model.emit("request:success", data);
      };

      settings.error = function(errData, xhr, event){
        let exportData;
        const type = ERRORS.MODEL_LINK_REQUEST_HTTP_CATCH;
        const response = errData != null ? errData :
          (xhr.responseType === '' || xhr.responseType === 'text') ? xhr.responseText : xhr.response;
        const catchError = { http: xhr.status || -1, type: type, response, request: option };

        if(useCatch) exportData = linkCatchCaller(catchLinks, [catchError, single]);

        resolve([
          exportData,
          catchError
        ]);

        return model.emit("catch:request", errData, catchError);
      };

      model.emit("request");

      return _ajax(settings);
    });
  };

  // single promise
  promiseObj = createPromiseUpdateTask(options);

  return promiseObj;
}

