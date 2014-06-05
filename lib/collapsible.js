/**
 * Module dependencies
 */

var slice = [].slice;
var domify = require('domify');
var closest = require('closest');
var type = require('./type');
var utils = require('./utils');
var events = require('events');
var match = require('./match');
var classes = require('classes');
var tokens = require('./tokens');
var utils = require('./utils');
var rowrange = utils.rowrange;
var colrange = utils.colrange;

/**
 * Regexps
 */

var rcols = /cols?/;
var rrows = /rows?/;

/**
 * Elements
 */

var dot = domify('<div class="dot"></div>');
var line = domify('<div class="line"></div>');

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
  this.el = spreadsheet.el;
  this.classes = classes(this.el);

  this.exprmap = {};

  this.thead = spreadsheet.thead;
  this.tbody = spreadsheet.tbody;
  this.colhead = this.thead.querySelectorAll('tr.layer');
  this.rowhead = this.thead.querySelectorAll('th.layerhead');

  // events
  this.events = events(spreadsheet.el, this);
  this.events.bind('click th.layer.active', 'toggle');

  // construct the virtual grid
  var numrowlayers = this.numrowlayers = this.thead.querySelectorAll('th.layerhead').length;
  var numcollayers = this.numcollayers = this.thead.querySelectorAll('tr.layer').length;

  this.rths = this.tbody.querySelectorAll('th.layer');
  this.cths = this.thead.querySelectorAll('th.layer');

  var rlen = this.rths.length / numrowlayers;
  var clen = this.cths.length / numcollayers;

  var rowgrid = this.rowgrid = Array(rlen);
  var colgrid = this.colgrid = Array(numcollayers);

  for (var i = 0; i < rlen; i++) rowgrid[i] = Array(numrowlayers);
  for (var i = 0; i < numcollayers; i++) colgrid[i] = Array(clen);
}

/**
 * toggle
 */

Collapsible.prototype.toggle = function(e) {
  var target = e.target;
  target = 'TH' == target.nodeName ? target : closest(target, 'th');
  var expr = target.dataset.label;
  this.spreadsheet.select(expr).hide();

  // var vals = 
  // console.log(this.exprmap[expr]);

  this.drawrow();
};


/**
 * Add a range
 */

Collapsible.prototype.range = function(expr) {
  var t = type(expr);
  if ('rows' == t) return this.rowrange(expr);
  if ('cols' == t) return this.colrange(expr);
  return this;
};

/**
 * rowrange
 *
 * @param {String} expr
 */

Collapsible.prototype.rowrange = function(expr) {
  var rowhead = this.rowhead;
  var grid = this.rowgrid;
  var m = match(expr);
  var range = rowrange(+m[1] - 1, +m[2] - 1);
  var layer = this.layer(range, grid);

  // fill in at that layer
  for (var i = 0, r; r = range[i]; i++) {
    grid[r][layer] = expr;
    if (!this.exprmap[expr]) this.exprmap[expr] = []
    this.exprmap[expr].push([layer, r]);
  }

  this.drawrow();
};

/**
 * get the free layer
 */

Collapsible.prototype.layer = function(range, grid) {
  var numrowlayers = this.numrowlayers;
  var level = Infinity;

  for (var i = 0, r; r = range[i]; i++) {
    for (var l = 0; l < numrowlayers; l++) {
      if (undefined == grid[r][l]) {
        if (level > l) level = l;
        break;
      }
    }
  }

  return level;
};

/**
 * draw the rows
 */

Collapsible.prototype.drawrow = function() {
  var numrowlayers = this.numrowlayers;
  var rowhead = this.rowhead;
  var grid = this.rowgrid;
  var numrows = grid.length;
  var ths = this.rths;
  var first = true;

  var showlayer = Array(numrowlayers);

  for (var i = 0; i < rowhead.length; i++) {
    classes(rowhead[i]).remove('shown');
  }

  // update grid
  for (var r = 0, x = 0; r < numrows; r++) {
    for (var l = 0; l < numrowlayers; l++, x++) {
      if (1 == grid[r][l]) {
        classes(rowhead[l]).add('shown')
      } else if ('string' != typeof grid[r][l]) {
        continue;
      }

      classes(rowhead[l]).add('shown')
      var cls = classes(ths[x]);
      cls.add('active');
      ths[x].dataset.label = grid[r][l];
      grid[r][l] = 1;
    }
  }

  // hide and show layers
  // for (var i = 0; i < numrowlayers; i++) {
  //   if (showlayer[i]) {
  //     for (var i = 0; )
  //   } else {

  //   }
  // }
};


/**
 * colrange
 *
 * @param {String} expr
 */

Collapsible.prototype.colrange = function(expr) {
  var m = match(expr);
  console.log(m);  
};
