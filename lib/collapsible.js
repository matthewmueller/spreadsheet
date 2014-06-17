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
var lton = utils.lton;
var ntol = utils.ntol;
var rowrange = utils.rowrange;
var colrange = utils.colrange;
var Grid = require('grid');

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

  this.el = spreadsheet.el;
  this.spreadsheet = spreadsheet;
  this.outline = spreadsheet.outline;
  this.thead = spreadsheet.thead;
  this.tbody = spreadsheet.tbody;
  this.classes = classes(this.el);

  this.rg = this.rowgrid();
  this.cg = this.colgrid();
  // console.log(this.cg.toString());
  // console.log(this.rg.toString());


  this.exprmap = {};

  this.colhead = this.thead.querySelectorAll('tr.layer');
  this.rowhead = this.thead.querySelectorAll('th.layerhead');

  // events
  this.events = events(spreadsheet.el, this);
  this.events.bind('click th.layer.collapsible', 'toggle');

  // collapsibles
  this.rths = this.tbody.querySelectorAll('th.layer');
  this.cths = this.thead.querySelectorAll('th.layer');

  // // construct the virtual grid
  // var numrowlayers = this.numrowlayers = this.thead.querySelectorAll('th.layerhead').length;
  // var numcollayers = this.numcollayers = this.thead.querySelectorAll('tr.layer').length;


  // var rlen = this.rths.length / numrowlayers;
  // var clen = this.cths.length / numcollayers;

  // var rowgrid = this.rowgrid = Array(rlen);
  // var colgrid = this.colgrid = Array(numcollayers);

  // for (var i = 0; i < rlen; i++) rowgrid[i] = Array(numrowlayers);
  // for (var i = 0; i < numcollayers; i++) colgrid[i] = Array(clen);
}

/**
 * rowgrid
 */

Collapsible.prototype.rowgrid = function() {
  var width = this.thead.querySelectorAll('th.layerhead').length;
  var height = this.tbody.querySelectorAll('th.layer').length / width;
  return new Grid(width, height);
};

/**
 * colgrid
 */

Collapsible.prototype.colgrid = function() {
  var height = this.thead.querySelectorAll('tr.layer').length;
  var width = this.thead.querySelectorAll('th.layer').length / height;
  return new Grid(width, height);
};

/**
 * toggle
 */

Collapsible.prototype.toggle = function(e) {
  var target = e.target;
  var th = 'TH' == target.nodeName ? target : closest(target, 'th');
  var at = th.dataset.at;
  var rg = this.rg;
  var val = rg.at(at);
  var symbol = val.symbol
  var expr = val.expr;
  var sel = rg.select(expr).expandRight();
  var len = sel.selection.length;

  sel.forEach(function(v, at, i) {
    if (!v || !i) return;

    switch (v.symbol) {
      case '|': v.symbol = 'x'; break;
      case '-x': v.symbol = '-'; break;
      case '-': v.symbol = '-x'; break;
      case 'x': v.symbol = '|'; break;
    }
  });

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
  var grid = this.rg.select(expr);
  var exprmap = this.exprmap;
  var cols = grid.cols();

  for (var l in cols) {
    var col = grid.find(l);
    if (col.empty()) {
      var m = match(expr);
      var e = l + m[1] + ':' + l + m[2];
      col.fill(symbol('|', e));
      col.value(0, symbol('*', e));
      col.value(-1, symbol('-', e));
      break;
    }
  }

  function symbol(sym, e) {
    return function() {
      return {
        symbol: sym,
        visible: true,
        expr: e
      }
    };
  }

  function empty(col) {
    var empty = true;
    
    // TODO filter
    col.forEach(function(v) {
      if (v && v.visible) {
        empty = false;
        return false;
      }
    });

    return empty;
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
  var rowhead = this.rowhead;
  var ths = this.rths;
  var rg = this.rg;
  var cols = rg.cols();
  var hide = [];
  var i = 0;
  var cls;

  classes(rowhead[0]).add('shown');
  
  // show the rowheads
  for (var l in cols) {
    col = rg.select(l);
    empty(col)
      ? rowhead[++i] && classes(rowhead[i]).remove('shown')
      : rowhead[++i] && classes(rowhead[i]).add('shown')
  }

  // update the grid
  rg.forEach(function(v, at, i) {
    if (!v) return;

    var th = ths[i];
    th.dataset.at = at;
    var cls = classes(th);
    var tr = classes(th.parentNode);
    tr.remove('hidden');

    switch(v.symbol) {
      case '*': cls.add('collapsible').add('dot').remove('line').remove('dash'); break;
      case '|': cls.add('collapsible').add('line').remove('dot').remove('dash'); break;
      case '-': cls.add('collapsible').add('dash').remove('dot').remove('line'); break;
      case 'x':
      case '-x':
        hide.push(tr); break;
      default: cls.remove('collapsible').remove('dot').remove('line').remove('dash');
    }
  });

  for (var i = 0, len = hide.length; i < len; i++) {
    hide[i].add('hidden');
  }

  function empty(col) {
    var empty = true;

    // TODO filter
    col.forEach(function(v) {
      if (v && 'x' != v.symbol && '*' != v.symbol && '-x' != v.symbol) {
        empty = false;
      }
    });

    return empty;
  }

  this.outline.hide();
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
