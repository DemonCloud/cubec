import MODEL from '../../constant/model.define';
import modelLockStatus from './lockstatus';
import { _ajax } from '../usestruct';

export default function(type, url, param, fnsucess, fnerror, header) {
  if (modelLockStatus(this)) return this;

  //param must be object typeof
  let st = {
    url: url || this.url || '',
    type: MODEL.EMULATEHTTP[type],
    async: true,
    cache: this.cache || false,
    emulateJSON: this.emulateJSON,
    param: param || this.param || {},
    header: header || this.header || {},
  };

  if (st.type === 'POST' && this.emulateJSON)
    st.header['Content-Type'] = 'application/json';

  st.header['X-HTTP-Method-Override'] = type;

  // deal with arguments
  // set http header param
  st.success = function(){
    // change the data before dispatch event;
    try{
      fnsucess.apply(this, arguments);
    } catch(error) {
      console.error(error);
      this.emit(`catch:request:${type}`,[error]);
      return this.emit("catch",[error]);
    }

    this.emit(type + ':success', arguments);
  }.bind(this);

  st.error = function(){
    try {
      fnerror.apply(this, arguments);
    } catch (error) {
      console.error(error);
      this.emit(`catch:request:${type}`,[error]);
      return this.emit("catch",[error]);
      // return this.emit(type + ':error', arguments);
    }

    this.emit(type + ':error', arguments);
  }.bind(this);

  return this.emit(type, [_ajax(st), st]);
}
