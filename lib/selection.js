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
var match = require('./match');
var shift = utils.shift;
var lton = utils.lton;
var ntol = utils.ntol;
var largest = utils.largest;
var rows = utils.rows;
var cols = utils.cols;

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
  this.cache = {};
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
 * Insert some data into the spreadsheets
 *
 * @param {Mixed} val
 * @return {Selection}
 * @api public
 */

Selection.prototype.insert = function(val) {
  val = isArray(val) ? val : [val];
  var cells = [];

  this.each(function(cell, i) {
    // end the loop early if we're done
    if (undefined == val[i]) return false;
    cell.val(val[i]);
    cells.push(cell);
  })

  // insert into the spreadsheet
  this.spreadsheet.insert(cells);

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
    cell = spreadsheet.at(at) || this.cache[at] || (this.cache[at] = new Cell(null, at, spreadsheet));

    // ignore merged cells
    if (cell.at != at) {
      continue;
    }

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
 * TODO: Add support after we resolve
 * merge bug. *update* which bug? haha...
 *
 * @return {Selection}
 * @api public
 */

// Selection.prototype.mergeRows = function() {
//   var cells = this.cells();
//   var cs = cols(cells);
//   for (var i = 0, col; col = cs[i]; i++) {
//     this.spreadsheet.merge(col);
//   }
//   return this;
// };

/**
 * Merge the cols together
 *
 * @return {Selection}
 * @api public
 */

Selection.prototype.mergeCols = function() {
  var cells = this.cells();
  var rs = rows(cells);
  for (var i = 0, row; row = rs[i]; i++) {
    this.spreadsheet.merge(row);
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
