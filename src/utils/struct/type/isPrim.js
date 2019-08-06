export default function isPrimitive(e){
  return e == null || typeof e !== 'object';
}
