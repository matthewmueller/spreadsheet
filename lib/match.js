/**
 * Module Dependencies
 */

var regex = require('./regex');

/**
 * Export `match`
 */

module.exports = match;

/**
 * Find a match
 *
 * @param {String} str
 * @return {Array} match
 */

function match(str) {
  return str.match(regex.block)
  || str.match(regex.row)
  || str.match(regex.col)
  || str.match(regex.cell)
}
