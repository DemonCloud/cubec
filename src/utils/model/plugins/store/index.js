import CryptoStore from './crypto-store';
import { _idt } from '../../../usestruct';

const storePlugin = {

  constructor(){
    if(this.name){
      // exist name try to get initialize JSON DATA
      const initializedData = CryptoStore.get(this.name);

      // if get exist initialize data
      if(initializedData) this._c(initializedData, _idt);
    }
  },

  clearStore(){
    if(this.name){
      CryptoStore.rm(this.name);

      return true;
    }

    return false;
  },

  syncStore(isStatic){
    if(this.name){
      const syncStoreData = CryptoStore.get(this.name);

      if(syncStoreData){
        this.set(syncStoreData, isStatic);
        return true;
      }
    }

    return false;
  },

  events: {
    // when trigger set
    set(sourceData){
      if(this.name) CryptoStore.set(this.name, sourceData);
    }
  }

};

export default storePlugin;
