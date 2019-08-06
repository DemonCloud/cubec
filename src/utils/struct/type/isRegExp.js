import isDefine from './isDefine';

export default function isRegExp(e){
  return e && isDefine(e,'RegExp');
}
