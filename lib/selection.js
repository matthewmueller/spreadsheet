/**
 * Module dependencies
 */

var slice = [].slice;
var isArray = require('isArray');
var Cell = require('./cell');
var type = require('./type');
var expand = require('./expand');
var utils = require('./utils');
var match = require('./match');
var regex = require('./regex');
var shift = utils.shift;
var lton = utils.lton;
var ntol = utils.ntol;
var largest = utils.largest;
var rows = utils.rows;
var cols = utils.cols;
var tokenizer = require('mini-tokenizer');

/**
 * Token compiler
 */

var rtokens = /\{([A-Za-z0-9]+)\}/g
var tokens = tokenizer(rtokens, '$1');

/**
 * Export `Selection`
 */

module.exports = Selection;

/**
 * Initialize `Selection`
 *
 * @param {String} expr
 * @param {Table} spreadsheet
 * @return {Selection}
 * @api private
 */

function Selection(expr, spreadsheet) {
  if (!(this instanceof Selection)) return new Selection(selection, spreadsheet);
  this.selection = expand(expr, spreadsheet.largest);
  this.spreadsheet = spreadsheet;
  this.type = type(expr);
  this.expr = expr;
}

/**
 * Get the cells of the selection
 *
 * @return {Array}
 * @api public
 */

Selection.prototype.cells = function() {
  var cells = [];
  this.each(function(cell) { cells.push(cell); });
  return cells;
};

/**
 * Add width to a column
 *
 * @param {Number|String} w
 * @return {Selection}
 * @api public
 */

Selection.prototype.width = function(w) {
  if (!/cols?/.test(this.type)) return this;
  w += 'number' == typeof w ? 'px' : '';
  var thead = this.spreadsheet.thead;
  var colhead = thead.querySelector('.colhead');
  var columns = cols(this.selection);
  var el;

  for (var col in columns) {
    el = colhead.querySelector('th[name=' + col + ']');
    if (el) el.style.width = w;
  }

  return this;
};

/**
 * Add height to a row
 *
 * @param {Number|String} h
 * @return {Selection}
 * @api public
 */

Selection.prototype.height = function(h) {
  if (!/rows?/.test(this.type)) return this;
  h += 'number' == typeof h ? 'px' : '';
  var tbody = this.spreadsheet.tbody;
  var rs = rows(this.selection);
  var el;

  for (var row in rs) {
    var el = tbody.querySelector('tr[name="' + row + '"]');
    if (el) el.style.height = h;
  }

  return this;
};

/**
 * Insert some data into the spreadsheets
 *
 * @param {Mixed} val
 * @return {Selection}
 * @api public
 */

Selection.prototype.insert = function(val) {
  val = isArray(val) ? val : [val];
  var spreadsheet = this.spreadsheet;
  var sel = this.selection;

  this.each(function(cell, i) {
    // end the loop early if we're done
    if (undefined == val[i]) return false;
    cell.val(val[i]);
  })

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
 * Loop through the selection, calling
 * `action` on each present cell in the
 * selection
 *
 * @param {String|Function} action
 * @return {Selection}
 */

Selection.prototype.each = function(action) {
  var spreadsheet = this.spreadsheet;
  var args = slice.call(arguments, 1);
  var isfn = 'function' == typeof action;
  var sel = this.selection;
  var cell;
  var ret;

  for (var i = 0, j = 0, at; at = sel[i]; i++) {
    cell = spreadsheet.at(at);

    // ignore merged cells
    if (!cell || cell.at != at) continue;

    // use fn or delegate to cell
    ret = isfn ? action(cell, j++) : cell[action].apply(cell, args);

    // break if false
    if (false === ret) break;
  }

  return this;
};

/**
 * merge
 */

Selection.prototype.merge = function() {
  var cells = this.cells();
  this.spreadsheet.merge(cells);
  return this;
};

/**
 * Merge the rows together
 *
 * @return {Selection}
 * @api public
 */

Selection.prototype.mergeRows = function() {
  var cells = this.cells();
  var cs = cols(cells);

  for (var col in cs) {
    this.spreadsheet.merge(cs[col]);
  }

  return this;
};

/**
 * Merge the cols together
 *
 * @return {Selection}
 * @api public
 */

Selection.prototype.mergeCols = function() {
  var cells = this.cells();
  var rs = rows(cells);

  for (var row in rs) {
    this.spreadsheet.merge(rs[row]);
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
};

/**
 * Delegate each cell in the selection to Cell
 */

[
  'editable',
  'format',
  'addClass',
  'attr',
  'show',
  'hide'
].forEach(function(m) {
  Selection.prototype[m] = function() {
    var args = slice.call(arguments);
    return this.each.apply(this, [m].concat(args));
  };
});
