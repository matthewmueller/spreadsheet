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
 * @param {Table} table
 * @return {Selection}
 * @api private
 */

function Selection(selection, table) {
  if (!(this instanceof Selection)) return new Selection(selection, table);
  this.table = table;
  this.expr = selection;
  this.cells = this.parse(selection);
}

/**
 * Parse the selection, turning the
 * selection into cells
 */

Selection.prototype.parse = function(selection) {
  var table = this.table;
  var cells = expand(selection, table.largest());

  for (var i = 0, len = selection.length; i < len; i++) {
    cells[i] = table.at(cells[i]) || new Cell(null, cells[i]);
  };

  return cells;
};

/**
 * Insert some data into the tables
 *
 * @param {Mixed} val
 * @return {Selection}
 * @api public
 */

Selection.prototype.insert = function(val) {
  val = isArray(val) ? val : [val];
  var cells = this.cells;
  var table = this.table;



  var sel = this.selection;
  var cells = {};
  var create = 0;
  var cell;

  for (var i = 0, len = val.length; i < len; i++) {
    cell = table.at(sel[i]);
    if (cell) {
      cell.val(val[i]);
    } else {
      cells[sel[i]] = new Cell(val[i], sel[i], table);
      create++;
    }
  }

  if (create) table.insert(cells);
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

Selection.prototype.calc = function(expr) {
  var sel = this.selection;
  var toks = tokens(expr);

  sel.forEach(function(cell) {
    var e = expr;
    toks.forEach(function(tok) {
      var shifted = shift(cell, tok);
      e = e.replace(tok, shifted);
    });



  })

  // var largest = sel[sel.length - 1];
  // var parser = parse(expr, largest);
  // var tokens = parser.tokens();



  // var table = this.table;
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
  var table = this.table;

  if (rcol.test(expr)) {
    expr = expr.replace(rcol, '$1' + s + ':$1' + e);
    return new Selection(expr, table);
  } else if (rrow.test(expr)) {
    expr = expr.replace(rrow, s + '$1:' + e + '$1');
    return new Selection(expr, table);
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
  //   return new Selection(expr, table);
  // } else if (m = rrow.exec(val)) {
  //   expr = expr.replace(/[0-9]+/g, m[1]);
  //   return new Selection(expr, table);
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
  var sel = this.selection;
  var table = this.table;
  var cell;

  for (var i = 0, len = sel.length; i < len; i++) {
    var cell = table.at(sel[i]);
    if (!cell) continue;
    if (isfn) action(cell, sel[i]);
    else cell[action].apply(cell, args);
  };

  return this;
};
