/**
 * Module Dependencies
 */

var Workbook = require('./lib/workbook');

/**
 * Expose `spreadsheet`
 */

exports = module.exports = spreadsheet;

/**
 * Expose the `workbook`
 */

exports.workbook = Workbook;

/**
 * Default workbook
 */

var workbook = new Workbook;

/**
 * Initialize `spreadsheet`
 *
 * @param {Number} cols
 * @param {Number} rows
 * @return {Spreadsheet}
 * @api public
 */

function spreadsheet(cols, rows) {
  return workbook.spreadsheet(cols, rows);
}
