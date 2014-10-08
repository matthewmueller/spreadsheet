/**
 * Custom formats
 */

exports['x'] = function(val) {
  return round(val, 1) + 'x';
}

/**
 * Round
 *
 * @param {Number} n
 * @return {Number} decimals
 * @return {Number}
 */

function round(n, decimals) {
  decimals *= 10;
  return Math.round(n * decimals) / decimals;
}
