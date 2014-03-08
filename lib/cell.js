/**
 * Module dependencies
 */

var numeral = require('numeral');
var event = require('event');
var Emitter = require('emitter');
var domify = require('domify');
var classes = require('classes');
var props = require('props');
var type = require('./type');
var tokens = require('./tokens');

/**
 * Regexs
 */

var rexpr = /\s*=/;

/**
 * Templates
 */

var el = domify('<input type="text" disabled>');

/**
 * Export `Cell`
 */

module.exports = Cell;

/**
 * Initialize `Cell`
 *
 * TODO: either don't need value or call .val(value)
 * if a value is supplied
 *
 * @param {Mixed} value
 * @param {Number} at
 * @param {Table} spreadsheet
 */

function Cell(value, at, spreadsheet) {
  if (!(this instanceof Cell)) return new Cell(value, at, spreadsheet);
  this.at = at;
  this.value = value;
  this.spreadsheet = spreadsheet;

  // create the element
  this.el = el.cloneNode();
  this.el.value = value;
  this.classes = classes(this.el);

  this.expr = false;
  this.formatting = false;
  this.observing = [];
}

/**
 * Get or set the value of the cell
 */

Cell.prototype.val = function(val, opts) {
  if (undefined == val) return this.compute(this.value, opts);
  opts = opts || {};
  opts.compute = undefined == opts.compute ? true : opts.compute;

  var spreadsheet = this.spreadsheet;
  var prev = this.value;
  var at = this.at;

  if (null != val && !spreadsheet.at(at)) {
    spreadsheet.insert(at, this);
  }

  this.el.value = opts.compute ? this.compute(val) : val;
  this.value = val;

  if (!opts.silent) {
    spreadsheet.emit('change ' + at, val, prev ? prev : prev, this);
  }

  return this;
};

/**
 * Compute the value and apply formatting
 */

Cell.prototype.compute = function(value, opts) {
  opts = opts || {};
  var format = undefined == opts.format ? true : opts.format;

  if (rexpr.test(value)) {
    this.expr = (this.expr && this.value == value) ? this.expr : this.compile(value);
  } else {
    this.expr = false;
  }

  value = (this.expr) ? this.expr() : value;
  value = (format && this.formatting && isNumber(value)) ? numeral(value).format(this.formatting) : value;
  return value;
};

/**
 * Compile the expression
 *
 * @param {String} expr
 * @param {Object} opts
 * @return {Function}
 * @api private
 */

Cell.prototype.compile = function(expr, opts) {
  var toks = tokens(expr);
  var regex = new RegExp(toks.join('|'), 'g');

  expr = expr.replace(rexpr, '');
  if (!expr) return expr;
  expr = expr.replace(regex, '_.$&');
  expr = new Function('_', 'return ' + expr);
  this.observe(toks);

  return function() {
    var _ = {};
    var val;

    for (var i = 0, len = toks.length; i < len; i++) {
      val = +spreadsheet.at(toks[i]).val(null, { format: false });
      val = isNaN(val) ? 0 : val;
      _[toks[i]] = val;
    }

    return expr(_);
  }
};

/**
 * Format
 */

Cell.prototype.format = function(format) {
  if('%' == format) this.formatting = '0 %';
  else if ('$' == format) this.formatting = '($ 0,0.00)';
  else this.formatting = format;
  this.val(this.value);
  return this;
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
  var el = this.el;

  this.classes.add('editable');
  el.removeAttribute('disabled');

  event.bind(el, 'input', function(e) {
    if (rexpr.test(el.value)) return;
    self.val(el.value, { compute: false });
  });

  event.bind(el, 'focus', function(e) {
    var td = el.parentNode;
    if (td) classes(td).add('active');
    el.value = self.value;
  });

  event.bind(el, 'blur', function(e) {
    var td = el.parentNode;
    if (td) classes(td).remove('active');

    if ('' == el.value) return;
    self.val(el.value);
  });

  return this;
};

/**
 * Add a class to the <td>
 */

Cell.prototype.addClass = function(cls) {
  var td = this.el.parentNode;
  classes(td).add(cls);
};


/**
 * set an attribute of <td>
 */

Cell.prototype.attr = function(attr, value) {
  var td = this.el.parentNode;
  if (undefined == value) return td.getAttibute(attr);
  else td.setAttribute(attr, value);
  return this;
};

/**
 * Observe `cells` for changes
 */

Cell.prototype.observe = function(cells) {
  var self = this;
  var spreadsheet = this.spreadsheet;

  if (this.observing.length) {
    // remove observed
    console.log('TODO: remove observed');
  }

  for (var i = 0, cell; cell = cells[i]; i++) {
    spreadsheet.on('change ' + cell, recompute);
    this.observing.push([cell, recompute]);
  }

  function recompute(val, prev, cell) {
    self.val(self.value);
  }
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

/**
 * Is a number utility
 *
 * @param {Mixed} n
 * @return {Boolean}
 */

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
