export default function isNaN(n){
  return typeof n === 'number' && n !== n;
}
