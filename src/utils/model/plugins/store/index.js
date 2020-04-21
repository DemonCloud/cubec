import { _idt } from '../../../usestruct';
import useStore from './crypto-store';

const createStorePlugin = function(adapter){
  // create store adapter
  const store = useStore(adapter);

  return {
    constructor(){
      if(this.name){
        // exist name try to get initialize JSON DATA
        const initializedData = store.get(this.name);

        // if get exist initialize data
        if(initializedData) this._c(initializedData, _idt);
      }
    },

    clearStore(){
      if(this.name){
        store.rm(this.name);

        return true;
      }

      return false;
    },

    syncStore(isStatic){
      if(this.name){
        const syncStoreData = store.get(this.name);

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
        if(this.name) store.set(this.name, sourceData);
      },

      // when trigger remove
      remove(sourceData){
        if(this.name) store.set(this.name, sourceData);
      }
    }
  };

};

export const storePlugin = createStorePlugin(window.localStorage);

export const sessionPlugin = createStorePlugin(window.sessionStorage);


