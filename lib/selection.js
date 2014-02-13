/**
 * Module dependencies
 */

var slice = [].slice;
var isArray = require('isArray');
var Cell = require('./cell');
var type = require('./type');
var tokens = require('./tokens');
var expand = require('./expand');
var utils = require('./utils');
var shift = utils.shift;
var lton = utils.lton;
var ntol = utils.ntol;

/**
 * Export `Selection`
 */

module.exports = Selection;

/**
 * Regexs
 */

var regex = require('./regex');
var rblock = regex.block;
var rcell = regex.cell;
var rrow = regex.row;
var rcol = regex.col;

/**
 * Initialize `Selection`
 *
 * @param {String} selection
 * @param {Table} spreadsheet
 * @return {Selection}
 * @api private
 */

function Selection(selection, spreadsheet) {
  if (!(this instanceof Selection)) return new Selection(selection, spreadsheet);
  this.spreadsheet = spreadsheet;
  this.expr = selection;
  this.selection = expand(selection, spreadsheet.largest());
}

/**
 * Insert some data into the spreadsheets
 *
 * @param {Mixed} val
 * @return {Selection}
 * @api public
 */

Selection.prototype.insert = function(val) {
  val = isArray(val) ? val : [val];

  this.each(function(cell, i) {
    var v = undefined == val[i] ? '' : val[i];
    cell.val(v);
  });

  return this;
};

/**
 * Make the selection editable
 */

Selection.prototype.editable = function() {
  return this.each('editable');
};

/**
 * Make the selection editable
 */

Selection.prototype.format = function(format) {
  return this.each('format', format);
};

/**
 * Make the selection editable
 */

Selection.prototype.calc = function(expr) {
  var cells = this.cells;
  var toks = tokens(expr);
  var e = expr;

  for (var i = 0, cell; cell = cells[i]; i++) {
    e = expr;
    for (var j = 0, tok; tok = toks[j]; j++) {
      var shifted = shift(cell.at, tok);
      e = e.replace(tok, shifted);
    }

    cell.val('= ' + e);
  }


  return this;
}

/**
 * Loop through the selection, calling
 * `action` on each present cell in the
 * selection
 */

Selection.prototype.each = function(action) {
  var spreadsheet = this.spreadsheet;
  var args = slice.call(arguments, 1);
  var isfn = 'function' == typeof action;
  var sel = this.selection;
  var cell;

  for (var i = 0, cell; cell = sel[i]; i++) {
    cell = spreadsheet.at(cell) || new Cell(null, cell, spreadsheet);
    if (isfn) action(cell, i);
    else cell[action].apply(cell, args);
  }

  return this;
};

/**
 * Add a class
 */

Selection.prototype.addClass = function(cls) {
  return this.each('addClass', cls)
}
