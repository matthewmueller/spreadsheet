/**
 * Regexs
 */

var block = exports.block = /([A-Za-z]+[0-9]+)\:([A-Za-z]+[0-9]+)/;
var cell = exports.cell = /([A-Za-z]+)([0-9]+)/;
var cols = exports.cols = /([A-Za-z]+)\:([A-Za-z]+)/;
var rows = exports.rows = /([0-9]+)\:([0-9]+)/;
var col = exports.col = /([A-Za-z]+)/;
var row = exports.row = /([0-9]+)/;
var any = exports.any = new RegExp([block, cell, cols, rows, col, row].map(source).join('|'), 'g');

/**
 * Get the source of a regex
 *
 * @param {Regex} regex
 * @return {String} source
 * @api private
 */

function source(regex) {
  return regex.source;
}
