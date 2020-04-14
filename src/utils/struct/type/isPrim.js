export default function isPrimitive(e){
  return typeof e !== 'object' || e == null;
}
