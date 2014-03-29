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
  var cells = [];

  this.each(function(cell, i) {
    // end the loop early if we're done
    if (undefined == val[i]) return false;
    cell.val(val[i]);
    cells.push(cell);
  })

  // find the smallest value of the selection
  var largest = this.largest();

  // insert into the spreadsheet
  this.spreadsheet.fill(largest);
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
 * largest
 */

Selection.prototype.largest = function() {
  var letter = 'A';
  var number = 1;

  this.each(function(cell) {
    var m = match(cell.at);
    var l = lton(m[1]);
    var n = +m[2];

    if (l > letter) letter = l;
    if (n > number) number = n;
  });

  return letter + number;
};


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
 * Add a class
 *
 * @param {String} cls
 * @return {Selection}
 */

Selection.prototype.attr = function(attr, value) {
  return this.each('attr', attr, value);
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

  for (var i = 0, at; at = sel[i]; i++) {
    cell = spreadsheet.at(at) || new Cell(null, at, spreadsheet);

    // use fn or delegate to cell
    ret = isfn ? action(cell, i) : cell[action].apply(cell, args);

    // break if false
    if (false === ret) break;
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

/**
 * Hide
 *
 * @return {Selection}
 * @api public
 */

Selection.prototype.hide = function() {
  return this.each('hide');
}

/**
 * Show
 *
 * @return {Selection}
 * @api public
 */

Selection.prototype.show = function() {
  return this.each('show');
}
