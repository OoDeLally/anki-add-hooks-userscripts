/**
 * Retrieve the array key corresponding to the largest element in the array.
 *
 * @param {Array.<number>} array Input array
 * @return {number} Index of array element with largest value
 */

const isLarger = (a, b) => a > b;


export default (array, predicate = isLarger) =>
  array.map((x, i) => [x, i]).reduce((r, a) => (predicate(a[0], r[0]) ? a : r))[1];
