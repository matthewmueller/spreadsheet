/**
 * Module Dependencies
 */

var classes = require('classes');
var event = require('event');
var events = require('events');
var closest = require('closest');
var delegate = require('delegates');
var isArray = require('isArray');
var Emitter = require('emitter');
var extend = require('extend');
var domify = require('domify');
var shortcuts = require('shortcuts');
var Selection = require('./selection');
var Cell = require('./cell');
var utils = require('./utils');
var match = require('./match');
var lton = utils.lton;
var ntol = utils.ntol;
var smallest = utils.smallest;
var largest = utils.largest;
var subtract = utils.subtract;
var k = require('k')(document);
var collapsible = require('./collapsible');
var Outline = require('./outline');

/**
 * Spreadsheet element
 */

var tpl = require('../template');

/**
 * Export `Spreadsheet`
 */

module.exports = Spreadsheet;

/**
 * Initialize `Spreadsheet`
 *
 * @param {Number} numcols
 * @param {Number} numrows (optional)
 */

function Spreadsheet(numcols, numrows) {
  if (!(this instanceof Spreadsheet)) return new Spreadsheet(numcols, numrows);

  // parse string
  if (!numrows && 'string' == typeof numcols) {
    var m = match(numcols);
    this.numcols = numcols = lton(m[1]) + 1;
    this.numrows = numrows = +m[2]
  } else {
    this.numcols = numcols = numcols || 10;
    this.numrows = numrows = numrows || 10;
  }

  this.el = domify(tpl({ cols: numcols, rows: numrows }));
  this.thead = this.el.getElementsByTagName('thead')[0];
  this.tbody = this.el.getElementsByTagName('tbody')[0];
  this.classes = classes(this.el);

  this.largest = ntol(numcols) + numrows;

  this.spreadsheet = {};
  this.merged = {};
  this.cells = [];

  // active cell
  this.active = false;

  // bind events
  this.events = events(this.el, this);
  this.events.bind('click', 'onclick');
  this.events.bind('click td', 'onselect');

  // initialize collapsible
  this.collapsible = collapsible(this);

  // initialize the outline
  this.outline = Outline(this.el);

  this.draw();
}

/**
 * Mixin the `Emitter`
 */

Emitter(Spreadsheet.prototype);

/**
 * Delegate to the active cell
 */

delegate(Spreadsheet.prototype, 'active')
  .method('onkeydown')
  .method('onesc')
  .method('onf2');

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
 * Render the spreadsheet
 */

Spreadsheet.prototype.draw = function() {
  var spreadsheet = this.spreadsheet;
  var tds = this.el.querySelectorAll('td');
  var rows = this.numrows;
  var cols = this.numcols;
  var at = 'A1';
  var x = 0;

  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++, x++) {
      at = ntol(j) + (i+1);
      spreadsheet[at] = spreadsheet[at] || new Cell(tds[x], at, this);
    }
  }
}

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

  return this;
}

/**
 * onclick
 */

Spreadsheet.prototype.onclick = function() {
  this.active && this.active.reset();
  this.classes.remove('headings');
};


/**
 * Select a cell
 *
 * @param {Event} e
 * @return {Spreadsheet}
 * @api private
 */

Spreadsheet.prototype.onselect = function(e) {
  var target = 'TD' == e.target.nodeName ? e.target : closest(e.target, 'td');

  if (!target) {
    this.active && this.active.deactivate();
    return this;
  }

  var at = target.getAttribute('name');
  var cell = this.at(at);

  // remove any old classes, if we're not
  // clicking on the currently active cell
  this.active && this.active != cell && this.active.deactivate();
  this.active = cell;

  return this;
};

/**
 * Move to another cell
 *
 * @param {Event} e
 * @param {String} dir
 */

Spreadsheet.prototype.move = function(dir) {
  var self = this;
  var active = this.active;

  if (!active) return this;

  this.traverse(dir, function(cell) {
    if (!cell.classes.has('hidden') && !active.classes.has('focused')) {
      cell.activate();
      
      // blur old active
      active.deactivate();
      self.active = cell;
      
      return false;
    }
  });
};

/**
 * Arrow key event listeners
 *
 * @param {Event} e
 * @return {Spreadsheet}
 */

['left', 'right', 'up', 'down'].forEach(function(m) {
  Spreadsheet.prototype['on' + m] = function(e) {
    var active = this.active;

    if (active && !active.classes.has('focused')) {
      e.preventDefault();
  
      // reset headings
      active.reset();
      this.classes.remove('headings');
    }

    e.stopPropagation();
    this.move(m);

    return this;
  }
});

/**
 * onbacktick
 */

Spreadsheet.prototype.onbacktick = function(e) {
  e.preventDefault();
  e.stopPropagation();
  this.classes.toggle('headings');
  return this;
};


/**
 * Traverse
 *
 * @param {String} dir
 * @param {Function} fn
 * @return {Spreadsheet}
 * @api public
 */

Spreadsheet.prototype.traverse = function(cell, dir, fn) {
  if (arguments.length < 3) {
    if (!this.active) return this;
    fn = dir;
    dir = cell;
    cell = this.active;
  }

  var m = match(cell.at);
  var col = m[1];
  var row = m[2];
  var at;

  while (cell) {
    switch (dir) {
      case 'left':
      case 'l':
        col = ntol(lton(col) - 1);
        break;
      case 'right':
      case 'r':
        col = ntol(lton(col) + 1);
        break;
      case 'up':
      case 'top':
      case 'u':
      case 't':
        row--;
        break;
      case 'down':
      case 'bottom':
      case 'd':
      case 'b':
        row++;
        break;
    }

    at = col + row;
    cell = this.at(at);

    // if we found the next cell, break
    if (cell && at == cell.at && false == fn(cell)) break;
  }

  return this;
};
