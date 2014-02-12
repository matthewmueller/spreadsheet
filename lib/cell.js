/**
 * Module dependencies
 */

var event = require('event');
var Emitter = require('emitter');
var domify = require('domify');
var classes = require('classes');
var props = require('props');
var type = require('./type');

/**
 * Templates
 */

var el = domify('<td></td>');
var editable = domify('<input type="text">');

/**
 * Export `Cell`
 */

module.exports = Cell;

/**
 * Initialize `Cell`
 *
 * @param {Mixed} value
 * @param {Number} pos
 * @param {Table} table
 */

function Cell(value, pos, table) {
  if (!(this instanceof Cell)) return new Cell(value, pos, table);
  this.el = el.cloneNode();
  this.el.innerHTML = value;
  this.classes = classes(this.el);
  this.table = table;
  this.value = value;
  this.pos = pos;
}

/**
 * Get or set the value of the cell
 */

Cell.prototype.val = function(val, opts) {
  if (!val) return this.value;
  opts = opts || {};
  var table = this.table;
  var prev = this.value;
  this.value = val;

  if (prev) {
    console.log('here...');
  } else {
    console.log('new');
  }

  if (this.input) {
    this.input.value = val;
  } else {
    this.el.innerHTML = val;
  }

  if (!opts.silent) {
    table.emit('change ' + this.pos, val, prev);
  }

  return this;
};

/**
 * Check to see if the cell is blank
 */

Cell.prototype.blank = function() {
  return null == this.val;
};

/**
 * Render the cell
 *
 * @api private
 */


Cell.prototype.render = function() {
  return this.el;
}

/**
 * Make the cell editable
 */

Cell.prototype.editable = function() {
  var self = this;
  var input = editable.cloneNode(true);
  input.value = this.el.innerHTML;
  this.input = input;

  this.el.innerHTML = '';
  this.el.appendChild(input);
  this.classes.add('editable');

  event.bind(input, 'input', function(e) {
    self.val(input.value);
  });

  event.bind(input, 'focus', function(e) {
    input.value = self.val();
    self.classes.add('active');
  });

  event.bind(input, 'blur', function(e) {
    self.val(self.val());
    self.classes.remove('active');
  });

  return this;
};

/**
 * Shift
 */

// Cell.prototype.shift = function(expr) {
//   return type(expr)
//     .col(col)
//     .row(row)
//     .value;

//   function col(m) {

//   }

//   function row(m) {

//   }
// }

/**
 * Observe `cells` for changes
 */

Cell.prototype.observe = function(cells) {
  // expr = expr.replace(/\:(\w+)/g, '$.$1');

  // console.log(expr);
}

/**
 * Rowspan
 *
 * @return {Cell}
 */

Cell.prototype.rowspan = function() {

};

/**
 * Colspan
 *
 * @return {Cell}
 */

Cell.prototype.colspan = function() {

};
