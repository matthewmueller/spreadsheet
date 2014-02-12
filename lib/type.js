/**
 * Module Dependencies
 */

var regex = require('./regex');

/**
 * Export `type`
 */

module.exports = type;

/**
 * Initialize `type`
 */

function type(str) {
  return parse(str);
}

/**
 * Parse the type
 */

function parse(str) {
  if (regex.block.test(str)) return 'block';
  if (regex.cell.test(str)) return 'cell';
  if (regex.row.test(str)) return 'row';
  if (regex.col.test(str)) return 'col';
};
