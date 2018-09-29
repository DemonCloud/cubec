import MODEL from '../constant/model.define';
import struct from '../lib/struct';

const _ajax = struct.ajax();

function modelPipe(type, url, param, fnsucess, fnerror, header) {
  if (this.isLock) return this;

  //param must be object typeof
  let st = {
    url: url || this.url || '',
    type: MODEL.EMULATEHTTP[type],
    async: true,
    emulateJSON: this.emulateJSON,
    param: param || this.param || {},
    header: header || this.header || {},
  };

  if (st.type === 'POST' && this.emulateJSON)
    st.header['Content-Type'] = 'application/json';

  st.header['X-HTTP-Method-Override'] = type;

  // deal with arguments
  // set http header param
  st.success = () => {
    // change the data before dispatch event;
    try{
      fnsucess.apply(this, arguments);
    } catch(error) {
      console.error(error);
      return this.emit("catch",[error])
    }

    this.emit(type + ':success', arguments);
  };

  st.error = () => {
    try {
      fnerror.apply(this, arguments);
    } catch (error) {
      console.error(error);
      return this.emit("catch",[error])
      // return this.emit(type + ':error', arguments);
    }

    this.emit(type + ':error', arguments);
  };

  return this.emit(type, [_ajax(st), st]);
}

export default modelPipe;
