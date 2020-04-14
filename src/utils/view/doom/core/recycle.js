import { _isFn, _eachArray } from '../../../usestruct';

// with old treeNode deep recycle render plugin
export default function recycle(treeNode){
  if(treeNode){
    if(treeNode._recycler && _isFn(treeNode._recycler))
      treeNode._recycler();
    else if(treeNode.child && treeNode.child.length)
      _eachArray(treeNode.child, recycle);
  }
}
