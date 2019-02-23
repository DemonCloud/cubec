import {
  _isDefine,
  _isArrayLike,
  _isFn,
  _size,
  _toString,
} from '../usestruct';

export default function(value){
  let convert = _toString(value);

  if(_isDefine(value,'Object')){
    try{
      convert = _size(value) ? JSON.stringify(value) : '{__EMPTY__}';
    }catch(e){
      convert = `[Object object(special)]`;
    }

  }else if(_isArrayLike(value)){
    convert = `[${_size(value) ? convert : '__EMPTY__'}]`;

  }else if(_isFn(value)){
    convert = `Function ${value.name}`;

  }

  return convert;
}
