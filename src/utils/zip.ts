export default function zip<T>(arrays: T[][]): T[][] {
  return arrays[0].map((_, i) => arrays.map((array) => array[i]));
}
