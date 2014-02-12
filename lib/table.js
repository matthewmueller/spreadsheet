/**
 * Module Dependencies
 */

var Emitter = require('emitter');
var extend = require('extend');
var domify = require('domify');
var Selection = require('./selection');
var Cell = require('./cell');
var utils = require('./utils');
var lton = utils.lton;
var ntol = utils.ntol;

/**
 * Cells in table
 */

var cells = {};
var rows = {};

/**
 * Table element
 */

var table = domify('<table class="table"></table>');

/**
 * Export `Table`
 */

module.exports = Table;

/**
 * Initialize `Table`
 */

function Table() {
  if (!(this instanceof Table)) return new Table();
  this.el = table.cloneNode();
  this.table = {};
}

/**
 * Mixin the `Emitter`
 */

Emitter(Table.prototype);

/**
 * Create a selection
 *
 * @param {String} selection
 * @return {Table}
 * @api public
 */

Table.prototype.select = function(selection) {
  return new Selection(selection, this);
};

/**
 * Insert cell into the table
 *
 * @param {Object} cells
 * @return {Table}
 * @api private
 */

Table.prototype.insert = function(cells) {
  this.table = extend(this.table, cells);
  this.render();
  return this;
}

/**
 * Render the table
 *
 * TODO: do not re-render every time
 *
 * @return {Table} el
 * @api private
 */

Table.prototype.render = function() {
  var el = this.el;
  var trs = el.querySelectorAll('tr');
  var largest = this.largest();
  var table = this.table;
  var cell;
  var tds;
  var tr;
  var td;
  var l, k;

  for (var i = 1; i <= +largest[1]; i++) {
    tr = trs.item(i);

    if (!tr) {
      tr = document.createElement('tr');
      el.appendChild(tr);
    }

    tds = tr.querySelectorAll('td');
    for (var j = 0; j <= lton(largest[0]); j++) {
      l = ntol(j);
      k = l + i;
      cell = table[k] = table[k] ? table[k] : new Cell(null, k);
      // TODO: only update DOM cells when necessary
      tr.appendChild(cell.render());
      this.border(cell, l, i);
    }
  }

  return this;
};

/**
 * Add border to cell
 *
 * @api private
 */

Table.prototype.border = function(cell, l, n) {
  // console.log(cell, l, n);
  return this;
};

/**
 * Get the cell at `pos`
 *
 * @param {String} pos
 * @return {Cell|null}
 * @api private
 */

Table.prototype.at = function(pos) {
  return this.table[pos] || null;
};

/**
 * Get lowest, rightmost cell
 *
 * @return {String} pos
 * @api private
 */

Table.prototype.largest = function() {
  var table = this.table;
  var pos = 'A1';
  var largest = 0;
  var multiple = [];
  var k;

  // get the largest cell(s) in the table
  for (k in table) {
    var n = lton(k[0]) + k[1] - 1;
    if (largest < n) {
      multiple = [];
      largest = n;
      pos = k;
    } else if (largest == n) {
      multiple.push(n);
    }
  }

  // TODO: implement
  if (multiple.length) {
    throw new Error('multiple largest not implemented yet.');
  }

  return pos;
};

// /**
//  * Fill up the table with empty <tr>'s
//  *
//  * @param {Number} offset (rows)
//  * @return {Table}
//  * @api private
//  */

// Table.prototype.fillrows = function(r) {
//   console.log('rows', r);
//   while(!rows[r] && r >= 0) {
//     var tr = this.el.insertRow(r);
//     rows[r] = tr;
//     r--;
//   }
//   return this;
// };

// /**
//  * Fill up the table with empty <td>'s
//  *
//  * @param {Number} offset (columns)
//  * @return {Table}
//  * @api private
//  */

// Table.prototype.fillcols = function(offset) {
//   // console.log('cols: %s, rows: %s', c, r);

//   // while(!rows[r] && r >= 0) {
//   //   var tr = this.el.insertRow(r);
//   //   rows[r--] = tr;
//   // }

//   return this;
// };

// /**
//  * Set or get the table value
//  *
//  * @param {Mixed} val
//  * @return {Table}
//  * @api public
//  */

// Table.prototype.insert = function(val) {
//   if (val instanceof Cell) return this.insertCell(val);
// };

// /**
//  * Insert a cell
//  *
//  * @param {Cell} cell
//  * @return {Table}
//  * @api private
//  */

// Table.prototype.insertCell = function(cell) {
//   var el = this.el;
//   var col = cell.col;
//   var row = cell.row;
//   var c, r;

//   // overwrite existing cell, otherwise create a new cell
//   if (lookup(col, row)) {

//   } else {
//     c = col;
//     r = row;

//     // backtrack to make sure there's enough rows
//     while(!rows[r] && r >= 0) {
//       var tr = el.insertRow(r);
//       rows[r--] = tr;
//     }

//     c = col;
//     r = row;
//     while (!lookup(--c, r) && c >= 0) {
//       rows[r].insertCell(c);
//     }

//     var td = rows[row].insertCell(col);
//     td.innerHTML = cell.value;
//   }

//   // set and update the neighbors

//   // add the cell
//   if (!cells[col]) cells[col] = [];
//   cells[col][row] = cell;

//   return this;
// };

// /**
//  * Create a table cell
//  *
//  * @param {Mixed} value
//  * @param {String} position
//  * @return {Cell}
//  * @api public
//  */

// Table.prototype.cell = function(value, position) {

// };

// /**
//  * Lookup utility
//  *
//  * @param {Number|String} col
//  * @param {Number} row
//  * @return {Cell|Boolean}
//  * @api public
//  */

// function lookup(col, row) {
//   if (cells[col] && cells[col][row]) return cells[col][row];
//   return false;
// }
