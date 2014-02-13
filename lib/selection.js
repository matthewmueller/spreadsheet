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

/**
 * Export `Selection`
 */

module.exports = Selection;

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
 *
 * @param {String} expr
 * @return {Selection}
 * @api public
 */

Selection.prototype.calc = function(expr) {
  var toks = tokens(expr);

  this.each(function(cell) {
    var e = expr;
    for (var j = 0, tok; tok = toks[j]; j++) {
      var shifted = shift(cell.at, tok);
      e = e.replace(tok, shifted);
    }

    cell.val('= ' + e);
  });

  return this;
}

/**
 * Make the selection editable
 *
 * @return {Selection}
 * @api public
 */

Selection.prototype.editable = function() {
  return this.each('editable');
};

/**
 * Make the selection editable
 *
 * @param {String} format
 * @return {Selection}
 * @api public
 */

Selection.prototype.format = function(format) {
  return this.each('format', format);
};

/**
 * Add a class
 *
 * @param {String} cls
 * @return {Selection}
 */

Selection.prototype.addClass = function(cls) {
  return this.each('addClass', cls)
}

/**
 * Loop through the selection, calling
 * `action` on each present cell in the
 * selection
 *
 * @param {String|Function} action
 * @return {Selection} [description]
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
 * Chain
 *
 * @param {String} sel
 * @return {Selection} new
 */

Selection.prototype.select = function(sel) {
  return new Selection(sel, this.spreadsheet);
}

