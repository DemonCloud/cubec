export default function toNumber(s){
  return (+s && typeof +s === 'number') ? +s : s>>0;
}
