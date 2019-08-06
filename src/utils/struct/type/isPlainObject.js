export default function isPlainObject(e){
  return e != null && typeof e === 'object' && e.constructor === Object;
}
