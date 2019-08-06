import isNumber from './isNumber';

export default function isInt(e){
  return isNumber(e) && e%1 === 0;
}
