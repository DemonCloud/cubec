import MODEL from '../constant/model.define';
import struct from '../lib/struct';

const _ajax = struct.ajax();

function modelFetch(type, url, param, header) {
  if (this.isLock) return this;

  let promiseObj = new Promise((resolve, reject)=> {

    //param must be object typeof
    let st = {
      url: url || this.url || '',
      type: MODEL.EMULATEHTTP[type],
      async: true,
      emulateJSON: this.emulateJSON,
      param: param || this.param || {},
      header: header || this.header || {},
    };

    st.header['X-HTTP-Method-Override'] = type;

    // deal with arguments
    // set http header param
    st.success = (data) => {
      // change the data before dispatch event;
      resolve(data);
    };

    st.error = (xhr) => {
      reject(xhr);
    };

    this.emit(type, [_ajax(st), st]);
  });


  return promiseObj;
}

export default modelFetch;
