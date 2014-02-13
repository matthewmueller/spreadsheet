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
var Selection = require('./selection');
var Cell = require('./cell');
var utils = require('./utils');
var match = require('./match');
var lton = utils.lton;
var ntol = utils.ntol;

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
  this.events = events(this.el, this);
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
 * Insert cell into the spreadsheet
 *
 * @param {String|Object|Array} at
 * @param {Cell} cell
 * @return {Spreadsheet}
 * @api private
 */

Spreadsheet.prototype.insert = function(at, cell) {
  var cells = {};
  var td;

  if ('string' == typeof at) cells[at] = cell;
  else cells = at;

  for (at in cells) {
    cell = cells[at];
    at = at.toUpperCase();
    cell = cell instanceof Cell ? cell : new Cell(cell, at, this);
    td = this.find(at);

    if (!td) {
      this.fill(at);
      td = this.find(at);
    }

    td.textContent = '';
    td.appendChild(cell.render());

    // add ref
    this.spreadsheet[at] = cell;
  }

  return this;
};

/**
 * Fill in the spreadsheet
 */

Spreadsheet.prototype.fill = function(at) {
  var spreadsheet = this.spreadsheet;
  var el = this.el;
  var m = match(at);
  var ac = lton(m[1]);
  var ar = +m[2];
  var tr = el.getElementsByTagName('tr')[ar - 1];
  var cell;
  var at;

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
      td = tds[j];
      if (!td) {
        at = ntol(j) + i;

        cell = new Cell(null, at, this);
        spreadsheet[at] = cell;

        td = document.createElement('td');
        td.setAttribute('name', at);
        td.appendChild(cell.render());

        tr.appendChild(td);
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
 * Get lowest, rightmost cell
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
  if (!td) return at;

  return td.getAttribute('name');
};

/**
 * Find a spreadsheet cell
 *
 * @param {String} at
 * @return {Element|null}
 */

Spreadsheet.prototype.find = function(at) {
  return this.el.querySelector('td[name="' + at + '"]');
}
