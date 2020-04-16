import { _idt, _isInt, _clone } from '../../usestruct';
import defined from '../../defined';

const historyPlugin = {
  constructor(config){
    const historys = [];

    let preHistoryData = this._ast(_idt);

    defined(this, {
      // push to history queue
      __push_stack_history__(newHistoryData, idt){
        // equal with prev
        if(idt === _idt){
          historys.push(preHistoryData);
          preHistoryData = newHistoryData;
        }
      },

      __back_stack_prevhistory(backHistoryData, idt){
        if(idt === _idt)
          preHistoryData = backHistoryData;
      },

      // get history queue
      __get_queue_history__(idt){
        if(idt === _idt) return historys;
      },

    });
  },

  backHistory(pos, isStatic) {
    if(!_isInt(pos)){
      isStatic = !!pos;
      pos = -1;
    }

    let index;
    let source;
    const historys = this.__get_queue_history__(_idt);
    const existHistorys = historys.length;

    if(existHistorys){
      index = pos < 0 ?
        Math.max(0, (existHistorys + pos)) :
        Math.min(pos, existHistorys - 1);

      source = historys[index];
      // splice chunk with historys
      historys.splice(index);

      if(source){
        this.__temp_inback_stack_history__ = true;

        const copySource = this.set(source, isStatic);

        this.__back_stack_prevhistory(source, _idt);

        delete this.__temp_inback_stack_history__;

        if(!isStatic)
          this.emit('backHistory', [copySource]);

        return true;
      }
    }

    return false;
  },

  events: {
    // when trigger set
    set(sourceData){
      if(!this.__temp_inback_stack_history__){
        this.__push_stack_history__(
          _clone(sourceData), _idt
        );
      }
    }
  }

};

export default historyPlugin;
