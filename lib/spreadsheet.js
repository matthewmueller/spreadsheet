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

/**
 * Spreadsheet element
 */

var spreadsheet = domify('<div class="spreadsheet"><div class="row-heading"></div><table><thead></thead><tbody></tbody></table></div>');

/**
 * Export `Spreadsheet`
 */

module.exports = Spreadsheet;

/**
 * Initialize `Spreadsheet`
 */

function Spreadsheet() {
  if (!(this instanceof Spreadsheet)) return new Spreadsheet();
  this.el = spreadsheet.cloneNode(true);
  this.classes = classes(this.el);

  // element refs
  this.table = this.el.lastChild;
  this.rowhead = this.el.firstChild;
  this.thead = this.table.firstChild;
  this.tbody = this.table.lastChild;

  this.spreadsheet = {};
  this.merged = {};

  // active cell
  this.active = false;

  // bind events
  this.events = events(this.el, this);
  this.events.bind('click', 'onclick');
  this.events.bind('click td', 'onselect');
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
  var rowhead = this.rowhead;
  var thead = this.thead;
  var tbody = this.tbody;
  var m = match(cell.at);
  var ac = lton(m[1]);
  var ar = +m[2];
  var letter;
  var rh;
  var tr;
  var th;
  var at;
  var c;

  var largest = this.largest();
  m = match(largest);
  var lc = lton(m[1]);
  var lr = +m[2];
  var rows = lr > ar ? lr : ar;
  var cols = lc > ac ? lc : ac;

  // fill in column headers
  var colhead = thead.getElementsByTagName('tr')[0];
  colhead = colhead ? colhead : domify('<tr></tr>');
  var ths = colhead.getElementsByTagName('th');

  for (var i = 0; i <= cols; i++) {
    th = ths[i];

    if (!th) {
      th = document.createElement('th');
      th.innerHTML = '<div>' + ntol(i) + '</div>';
      colhead.appendChild(th);
    }
  }

  // add colhead in if it isn't there already
  if (!colhead.parentNode) thead.appendChild(colhead);  

  // fill in the rows
  var trs = tbody.getElementsByTagName('tr');
  var rhs = rowhead.getElementsByTagName('div');

  for (var i = 1; i <= rows; i++) {
    tr = trs[i - 1];

    if (!tr) {
      tr = document.createElement('tr');
      tr.setAttribute('name', i);
      tbody.appendChild(tr);
    }

    if (!rhs[i - 1]) {
      rh = document.createElement('div');
      rh.textContent = i;
      rowhead.appendChild(rh);
    }

    // fill in rows
    for (var j = 0; j <= cols; j++) {
      letter = ntol(j);
      at = letter + i;

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
  var at = 'A1';

  var tr = this.tbody.querySelector('tr:last-child');
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
  return this.tbody.querySelector('td[name="' + at + '"]');
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
