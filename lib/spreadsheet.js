/**
 * Module Dependencies
 */

var classes = require('classes');
var event = require('event');
var events = require('events');
var isArray = require('isArray');
var Emitter = require('emitter');
var extend = require('extend');
var domify = require('domify');
var keyboard = require('shortcuts');
var Selection = require('./selection');
var Cell = require('./cell');
var utils = require('./utils');
var match = require('./match');
var lton = utils.lton;
var ntol = utils.ntol;
var smallest = utils.smallest;
var largest = utils.largest;
var subtract = utils.subtract;

/**
 * Spreadsheet element
 */

var spreadsheet = domify('<table class="spreadsheet"></table>');

/**
 * Export `Spreadsheet`
 */

module.exports = Spreadsheet;

/**
 * Initialize `Spreadsheet`
 */

function Spreadsheet() {
  if (!(this instanceof Spreadsheet)) return new Spreadsheet();
  this.el = spreadsheet.cloneNode();
  this.spreadsheet = {};
  this.merged = {};
  this.events = events(this.el, this);

  // delegate from cell input
  this.keyboard = keyboard(this.el, this);
  this.keyboard.k.ignore = false;
  this.keyboard.bind('left', 'left');
  this.keyboard.bind('right', 'right');
  this.keyboard.bind('up', 'up');
  this.keyboard.bind('down', 'down');
}

/**
 * Mixin the `Emitter`
 */

Emitter(Spreadsheet.prototype);

/**
 * Create a selection
 *
 * @param {String} selection
 * @return {Spreadsheet}
 * @api public
 */

Spreadsheet.prototype.select = function(selection) {
  return new Selection(selection, this);
};

/**
 * Add debugging support
 */

Spreadsheet.prototype.debug = function() {
  console.log('todo: support debugging, like showing cells');
};

/**
 * Insert cell into the spreadsheet
 *
 * @param {Array} cells
 * @return {Spreadsheet}
 * @api private
 */

Spreadsheet.prototype.insert = function(cells) {
  cells = isArray(cells) ? cells : [cells];

  if (!cells.length) return this;

  var spreadsheet = this.spreadsheet;
  var at;
  var td;

  // fill in from the biggest cell
  var biggest = largest(cells);
  this.fill(biggest);

  for (var i = 0, cell; cell = cells[i]; i++) {
    at = cell.at;
    td = this.at(at);

    // replace the cell
    td.replace(cell);

    // add a reference to the cell
    spreadsheet[at] = cell;
  }

  return this;
};

/**
 * Fill in the spreadsheet
 */

Spreadsheet.prototype.fill = function(cell) {
  var spreadsheet = this.spreadsheet;
  var el = this.el;
  var m = match(cell.at);
  var ac = lton(m[1]);
  var ar = +m[2];
  var tr = el.getElementsByTagName('tr')[ar - 1];
  var at;
  var c;

  var largest = this.largest();
  m = match(largest);
  var lc = lton(m[1]);
  var lr = +m[2];

  var rows = lr > ar ? lr : ar;
  var cols = lc > ac ? lc : ac;

  // fill in columns
  var trs = el.getElementsByTagName('tr');
  for (var i = 1; i <= rows; i++) {
    tr = trs[i - 1];

    if (!tr) {
      tr = document.createElement('tr');
      tr.setAttribute('name', i);
      el.appendChild(tr);
    }

    tds = tr.getElementsByTagName('td');
    for (var j = 0; j <= cols; j++) {
      at = ntol(j) + i;

      if (!spreadsheet[at]) {
        c = new Cell(null, at, this);
        spreadsheet[at] = c;
        tr.appendChild(c.render());
      }
    }
  }
}

/**
 * Add border to cell
 *
 * @api private
 */

Spreadsheet.prototype.border = function(cell, l, n) {
  // console.log(cell, l, n);
  return this;
};

/**
 * Blur
 */

Spreadsheet.prototype.onblur = function(e) {
  var target = e.target;
  var td = target.parentNode;
  classes(td).remove('active');
}

/**
 * Get the cell reference
 *
 * @param {String} at
 * @return {Cell|null}
 * @api private
 */

Spreadsheet.prototype.at = function(at) {
  at = at.toUpperCase();
  return this.spreadsheet[at] || null;
};

/**
 * Get the largest cell also known
 * as the lowest, rightmost cell.
 *
 * @return {String} at
 * @api private
 */

Spreadsheet.prototype.largest = function() {
  var el = this.el;
  var at = 'A1';

  var tr = el.querySelector('tr:last-child');
  if (!tr) return at;
  var td = tr.querySelector('td:last-child');
  // FIXME: i don't think this is right
  if (!td) return at;

  return td.getAttribute('name');
};

/**
 * Merge cells
 *
 * @param {Array} cells
 * @return {Spreadsheet}
 * @api public
 */

Spreadsheet.prototype.merge = function(cells) {
  var spreadsheet = this.spreadsheet;
  var merged = this.merged;
  var captain = smallest(cells);
  var at = captain.at;
  var el, tr;

  merged[at] = [];

  // remove the remaining cells
  for (var i = 0, cell; cell = cells[i]; i++) {
    if (captain == cell) continue;
    el = cell.el;
    tr = el.parentNode;
    if (tr) tr.removeChild(el);
    spreadsheet[cell.at] = captain;
    merged[at].push(cell.at);
  }

  // add the col and rowspan
  var biggest = largest(cells);
  var diff = subtract(biggest.at, captain.at);
  captain.attr('rowspan', diff.row + 1);
  captain.attr('colspan', diff.col + 1);

  // insert and fill, even if null
  this.insert(captain);

  // TODO: this needs to smarter. it's breaking for merge rows
  this.fill(biggest);

  return this;
}

/**
 * Find a spreadsheet cell
 *
 * @param {String} at
 * @return {Element|null}
 */

Spreadsheet.prototype.find = function(at) {
  return this.el.querySelector('td[name="' + at + '"]');
}

/**
 * Move to another cell
 *
 * @param {Event} e
 * @param {String} dir
 */

Spreadsheet.prototype.move = function(e, dir) {
  var target = e.target;
  var val = target.value;
  var td = target.parentNode;
  var cell = td.getAttribute('name');

  // TODO, finish me.
  console.log('cell: %s, move: %s', cell, dir);
};

/**
 * Arrow key event listeners
 *
 * @param {Event} e
 * @return {Spreadsheet}
 */

['left', 'right', 'up', 'down'].forEach(function(m) {
  Spreadsheet.prototype[m] = function(e) {
    this.move(e, m);
    return this;
  }
});
