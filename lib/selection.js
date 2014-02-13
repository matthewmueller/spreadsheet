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
  this.cells = this.parse(selection);
}

/**
 * Parse the selection, turning the
 * selection into cells
 */

Selection.prototype.parse = function(selection) {
  var spreadsheet = this.spreadsheet;
  var expanded = expand(selection, spreadsheet.largest());
  var cells = [];

  for (var i = 0, len = expanded.length; i < len; i++) {
    cells[cells.length] = spreadsheet.at(expanded[i]) || new Cell(null, expanded[i], spreadsheet);
  };

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
  var cells = this.cells;
  var spreadsheet = this.spreadsheet;
  var v;

  for (var i = 0, cell; cell = cells[i]; i++) {
    v = val[i];
    v = undefined == v ? '' : v;
    cell.val(v);
  }

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
  // sel.forEach(function(cell) {
  //   var e = expr;
  //   toks.forEach(function(tok) {
  //     var shifted = shift(cell, tok);
  //     e = e.replace(tok, shifted);
  //   });



  // })

  // var largest = sel[sel.length - 1];
  // var parser = parse(expr, largest);
  // var tokens = parser.tokens();



  // var spreadsheet = this.spreadsheet;
  // var selections = [];

  // // get the expanded forms of each token
  // for (var i = 0, len = tokens.length; i < len; i++) {
  //   var type = parser.type(tokens[i]);
  //   selections.push(this.shift(tokens[i]));
  // };

  // sel.forEach(function(cell, i) {

  // })

  // tokens.forEach(function(tok) {
  //   var type = tok[1];
  //   tok = tok[0].match(/[A-Za-z]+/)[0];

  //   sel.forEach(function(cell) {
  //     if ('col' == type) {
  //       var row = cell.match(/[A-Za-z]+([0-9]+)/);
  //       console.log(expr);
  //     }
  //   });
  // })
};

/**
 * range
 */

Selection.prototype.range = function(s, e) {
  var expr = this.expr;
  var spreadsheet = this.spreadsheet;

  if (rcol.test(expr)) {
    expr = expr.replace(rcol, '$1' + s + ':$1' + e);
    return new Selection(expr, spreadsheet);
  } else if (rrow.test(expr)) {
    expr = expr.replace(rrow, s + '$1:' + e + '$1');
    return new Selection(expr, spreadsheet);
  } else {
    throw new Error('unsupported range');
  }
};

/**
 * shift
 */

Selection.prototype.shift = function(val) {
  var expr = this.expr;
  var m = null;



  // type(val)
  //   .col(col);


  // function col(m) {

  // }


  // if (m = rcol.exec(val)) {
  //   expr = expr.replace(/[A-Za-z]+/g, m[1]);
  //   return new Selection(expr, spreadsheet);
  // } else if (m = rrow.exec(val)) {
  //   expr = expr.replace(/[0-9]+/g, m[1]);
  //   return new Selection(expr, spreadsheet);
  // } else {
  //   throw new Error('unsupported shift');
  // }
};




/**
 * Loop through the selection, calling
 * `action` on each present cell in the
 * selection
 */

Selection.prototype.each = function(action) {
  var args = slice.call(arguments, 1);
  var isfn = 'function' == typeof action;
  var cells = this.cells;
  var cell;

  for (var i = 0, len = cells.length; i < len; i++) {
    var cell = cells[i];
    if (isfn) action(cell);
    else cell[action].apply(cell, args);
  };

  return this;
};
