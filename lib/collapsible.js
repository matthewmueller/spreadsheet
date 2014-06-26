/**
 * Module dependencies
 */

var slice = [].slice;
var domify = require('domify');
var closest = require('closest');
var type = require('./type');
var utils = require('./utils');
var events = require('events');
var event = require('event');
var match = require('./match');
var classes = require('classes');
var tokens = require('./tokens');
var utils = require('./utils');
var Emitter = require('emitter');
var lton = utils.lton;
var ntol = utils.ntol;
var rowrange = utils.rowrange;
var colrange = utils.colrange;
var Grid = require('grid');

/**
 * Export `Collapsible`
 */

module.exports = Collapsible;

/**
 * Initialize `Collapsible`
 */

function Collapsible(spreadsheet) {
  if (!(this instanceof Collapsible)) return new Collapsible(spreadsheet);

  this.spreadsheet = spreadsheet;
  this.thead = spreadsheet.thead;
  this.tbody = spreadsheet.tbody;

  this.rg = this.rowgrid();
  this.cg = this.colgrid();
}

/**
 * rowgrid
 */

Collapsible.prototype.rowgrid = function() {
  var width = this.thead.querySelectorAll('th.layerhead').length;
  var height = this.tbody.querySelectorAll('th.layer').length / width;
  var ths = slice.call(this.tbody.querySelectorAll('th.layer'));
  var grid = new Grid(width, height);
  grid.insert(ths);
  return grid;

};

/**
 * colgrid
 */

Collapsible.prototype.colgrid = function() {
  var height = this.thead.querySelectorAll('tr.layer').length;
  var width = this.thead.querySelectorAll('th.layer').length / height;
  var ths = slice.call(this.thead.querySelectorAll('th.layer'));
  var grid = new Grid(width, height);
  grid.insert(ths);
  return grid;
};

/**
 * Add a range
 */

Collapsible.prototype.range = function(expr, collapsed) {
  var t = type(expr);
  if ('rows' == t) return this.rowrange(expr, collapsed);
  if ('cols' == t) return this.colrange(expr, collapsed);
  return this;
};

/**
 * rowrange
 *
 * @param {String} expr
 */

Collapsible.prototype.rowrange = function(expr, collapsed) {
  var grid = this.rg.select(expr);
  var cols = grid.cols();

  for (var l in cols) {
    var col = grid.find(l);
    if (empty(col)) {
      var m = match(expr);
      var e = l + m[1] + ':' + l + m[2];
      var connector = Connector(grid.find(e), 'row', this.spreadsheet);
      if (collapsed) connector.hide();
      break;
    }
  }

  function empty(col) {
    var empty = true;
    col.forEach(function(th) {
      if (classes(th).has('collapsible')) empty = false;
    })
    return empty;
  }
};

/**
 * colrange
 *
 * @param {String} expr
 */

Collapsible.prototype.colrange = function(expr, collapsed) {
  var grid = this.cg.select(expr);
  var rows = grid.rows();

  for (var n in rows) {
    var row = grid.find(n);
    if (empty(row)) {
      var m = match(expr);
      var e = m[1] + n  + ':' + m[2] + n;
      var connector = Connector(grid.find(e), 'col', this.spreadsheet);
      if (collapsed) connector.hide();
      break;
    }
  }

  function empty(row) {
    var empty = true;
    row.forEach(function(th) {
      if (classes(th).has('collapsible')) empty = false;
    })
    return empty;
  }
};


/**
 * Initialize `Connector`
 */

function Connector(grid, type, spreadsheet, hidden) {
  if (!(this instanceof Connector)) return new Connector(grid, type, spreadsheet, hidden);
  this.hidden = undefined == hidden ? false : true;
  this.spreadsheet = spreadsheet;
  this.thead = spreadsheet.thead;

  var first = this.first = grid.value(0);
  var last = this.last = grid.value(-1);
  var toggle = this.ontoggle = this.toggle.bind(this);

  this.grid = grid;
  this.len = grid.selection.length;

  grid.forEach(function(v) {
    event.bind(v, 'click', toggle);

    if (v == first) cls = 'dot';
    else if (v == last) cls = 'dash';
    else cls = 'line';

    classes(v).add(cls).add('collapsible');
  });

  if (type == 'col') {
    this.layer = first.parentNode;
    var expr = grid.expr.replace(/\d+/g, '');
    var m = match(expr);
    this.hideExpr = ntol(lton(m[1]) + 1) + ':' + m[2];
  } else if ('row') {
    var layerheads = this.thead.querySelectorAll('.layerhead');
    var n = lton(grid.expr.match(/[A-Z]/)[0]);
    this.layer = layerheads.item(n);
    var expr = grid.expr.replace(/[A-Z]/gi, '');
    var m = match(expr);
    this.hideExpr = (+m[1] + 1) + ':' + m[2];
  }

  if (!this.hidden) classes(this.layer).add('shown');
}

/**
 * Mixin `Emitter`
 */

Emitter(Connector.prototype);

/**
 * toggle
 */

Connector.prototype.toggle = function() {
  return this.hidden ? this.show() : this.hide();
};


/**
 * show
 */

Connector.prototype.show = function() {
  this.spreadsheet.select(this.hideExpr).show();
  classes(this.first).remove('hiding');
  this.hidden = false;
};

/**
 * hide
 */

Connector.prototype.hide = function() {
  this.spreadsheet.select(this.hideExpr).hide();
  classes(this.first).add('hiding');
  this.hidden = true;
};

