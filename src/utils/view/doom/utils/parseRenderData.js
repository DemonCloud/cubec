import { _isFn } from '../../../usestruct';

// view recycle render parseRenderData should continue to do render
export default function parseRenderData(dataHook, defaultData, context){
  const useHook = _isFn(dataHook) ? dataHook : false;

  if(!useHook) return defaultData;

  let parseData = useHook.call(context, defaultData);

  if(parseData === false || parseData === null || parseData !== parseData) return false;

  if(parseData === void 0) parseData = defaultData;

  return parseData;
}
