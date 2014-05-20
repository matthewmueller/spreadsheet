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
 */

function spreadsheet() {
  return workbook.spreadsheet();
}
