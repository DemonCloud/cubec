import isObject from './isObject';

export default function isDOM(e){
  return e !=null && isObject(e)
    && (e instanceof Node || e instanceof Element)
    && e.nodeType;
}
