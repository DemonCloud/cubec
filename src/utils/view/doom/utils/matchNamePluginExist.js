import { _idt } from '../../../usestruct';
import pluginList from "../constant/pluginList";

export default function matchNamePluginExist(tagName, relativeView){
  let relativePluginList;

  if(relativeView && relativeView._aspu)
    relativePluginList = relativeView._aspu(_idt);

  return pluginList[tagName] ||
    (relativePluginList && relativePluginList[tagName]);
}
