import isNumber from './isNumber';

export default function isFloat(e){
  return isNumber(e) && e%1 !== 0;
}
