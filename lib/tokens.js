/**
 * Module Dependencies
 */

var regex = require('./regex');

/**
 * Export `tokens`
 */

module.exports = tokens;

/**
 * Initialize `tokens`
 */

function tokens(expr) {
  var toks = [];
  expr.replace(regex.any, function(m) {
    toks.push(m);
  });
  return toks;
}
