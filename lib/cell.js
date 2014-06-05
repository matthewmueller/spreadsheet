/**
 * Module dependencies
 */

var numeral = require('numeral');
var event = require('event');
var events = require('events');
var Emitter = require('emitter');
var domify = require('domify');
var classes = require('classes');
var modifier = require('modifier');
var props = require('props');
var type = require('./type');
var shortcuts = require('shortcuts');
var outline = require('./outline');
var tokenizer = require('mini-tokenizer');
var throttle = require('per-frame');

/**
 * Regexs
 */

var rexpr = /\s*=/;

/**
 * Templates
 */

var el = domify('<td><input type="text" disabled></td>');

/**
 * Token compiler
 */

var rtokens = /\{([A-Za-z0-9]+)\}/g
var tokens = tokenizer(rtokens, '$1');

/**
 * Recomputing cache
 */

var recomputing = {};

/**
 * Export `Cell`
 */

module.exports = Cell;

/**
 * Initialize `Cell`
 *
 * @param {Element} el
 * @param {Number} at
 * @param {Table} spreadsheet
 */

function Cell(el, at, spreadsheet) {
  if (!(this instanceof Cell)) return new Cell(el, at, spreadsheet);
  this.spreadsheet = spreadsheet;
  this.el = el;
  this.at = at;

  // create the element
  this.classes = classes(this.el);
  this.attr('name', at);

  // get the input
  this.input = this.el.firstChild;
  this.value = this.input.value || '';

  this.expr = false;
  this.formatting = false;
  this.observing = [];

  // bind the events
  this.events = events(this.el, this);
  this.events.bind('click', 'onclick');
}

/**
 * Get or set the value of the cell
 */

Cell.prototype.val = function(val, opts) {
  if (undefined == val) return this.compute(this.value, opts);

  opts = opts || {};
  opts.compute = undefined == opts.compute ? true : opts.compute;

  var spreadsheet = this.spreadsheet;
  var input = this.input;
  var prev = this.value;
  var at = this.at;
  var computed;

  // update the internal value  
  this.value = val;

  // update the value
  if (opts.compute) {
    computed = input.value = this.compute(val);
    if (!opts.silent) spreadsheet.emit('change ' + at, computed)
  }

  if (!opts.silent) {
    spreadsheet.emit('changing ' + at, val, prev ? prev : prev, this);
  }

  return this;
};

/**
 * Compute the value and apply formatting
 */

Cell.prototype.compute = function(value, opts) {
  value = value || this.value;
  opts = opts || {};

  var format = undefined == opts.format ? true : opts.format;

  if (rexpr.test(value)) {
    this.expr = (this.expr && this.value == value) ? this.expr : this.compile(value);
  } else {
    this.expr = false;
  }

  value = this.expr ? this.expr() : value;
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
  var spreadsheet = this.spreadsheet;
  var toks = tokens(expr);

  if (!toks.length) return expr;
  
  expr = expr
    .replace(/^\s*=/, '')
    .replace(rtokens, '_.$1');

  expr = new Function('_', 'return ' + expr);
  this.observe(toks);

  return function() {
    var _ = {};
    var val;
    
    for (var i = 0, len = toks.length; i < len; i++) {
      val = spreadsheet.at(toks[i]).val(null, { format: false });
      _[toks[i]] = +val;
    }

    val = expr(_);

    return 'number' != typeof val || !isNaN(val)
      ? val
      : 0
  };
};

/**
 * Format
 */

Cell.prototype.format = function(format) {
  if('%' == format) this.formatting = '(0.0)%';
  else if ('$' == format) this.formatting = '($0,0)';
  else if ('#' == format) this.formatting = '(0,0)';
  else if ('##' == format) this.formatting = '(0,0.00)';
  else if ('###' == format) this.formatting = '(.00)';
  else if ('$$' == format) this.formatting = '($0,0.00)';
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
  var input = this.input;

  this.classes.add('editable');

  event.bind(input, 'input', function(e) {
    if (rexpr.test(input.value)) return;
    recomputing = {};
    self.val(input.value, { compute: false });
  });

  event.bind(input, 'focus', function(e) {
    input.value = self.value;
  });

  event.bind(input, 'blur', function(e) {
    // TODO: temporary fix for blur firing twice, i think...
    e.stopImmediatePropagation();
    if ('' == input.value) return;
    self.val(input.value);
  });

  return this;
};

/**
 * F2 puts you into "editmode"
 *
 * @param {Event} e 
 * @return {Spreadsheet} 
 * @api private
 */

Cell.prototype.onf2 = function(e) {
  e.stopPropagation();

  // focus editable
  if (this.classes.has('editable')) {
    this.focus();
  } else if ('=' == this.value[0]) {
    if (this.spreadsheet.classes.has('headings')) {
      this.reset();
      this.spreadsheet.classes.remove('headings');
    } else {
      // remove curlys from original value
      this.input.value = this.value.replace(/[\{\}]/g, '');
      this.spreadsheet.classes.add('headings');
    }
  }

  return this;
};

/**
 * Blur when you escape
 *
 * @param {Event} e
 * @return {Spreadsheet}
 * @api private
 */

Cell.prototype.onesc = function(e) {
  e.stopPropagation();
  this.blur();
  return this;
};

/**
 * onkeydown
 */

Cell.prototype.onkeydown = function(e) {
  if (modifier(e)) return this;

  var classes = this.classes;
  var input = this.input;
  
  if (!classes.has('editing') && classes.has('editable') && !classes.has('focused')) {
    input.focus();
    input.value = '';
  }

  classes.add('editing');
};

/**
 * onclick
 */

Cell.prototype.onclick = function() {
  this.activate();
};

/**
 * 
 */

Cell.prototype.focus = function() {
  // TODO: lame. refactor.
  this.activate().activate();
  this.input.focus();
  return this;
};

/**
 * reset
 */

Cell.prototype.reset = function() {
  var editable = this.classes.has('editable');
  this.val(this.value, { silent: true, compute: !editable });
  return this;
};



/**
 * highlight
 */

Cell.prototype.activate = function() {
  var input = this.input;

  // add the outline
  var lining = outline(this.el);

  if (this.classes.has('editable')) {
    classes(lining).add('editable');
    input.removeAttribute('disabled');
  } else {
    classes(lining).remove('editable');
  }

  // if we're already highlighted, focus
  if (this.classes.has('highlighted')) {
    this.classes.add('focused');
    input.focus();
  }

  // add highlighted
  this.classes.add('highlighted');

  return this;
};

/**
 * deactivate
 */

Cell.prototype.deactivate = function() {
  this.blur();
  this.classes.remove('highlighted');
  this.input.setAttribute('disabled', true);
  return this;
};

/**
 * blur
 */

Cell.prototype.blur = function() {
  this.classes.remove('focused').remove('editing');
  this.input.blur();
  return this;
}



/**
 * Add a class to the <td>
 */

Cell.prototype.addClass = function(cls) {
  classes(this.el).add(cls);
};


/**
 * set an attribute of <td>
 */

Cell.prototype.attr = function(attr, value) {
  var el = this.el;
  if (undefined == value) return el.getAttibute(attr);
  else el.setAttribute(attr, value);
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
    spreadsheet.on('changing ' + cell, throttle(recompute));
    this.observing.push([cell, recompute]);
  }

  function recompute(val, prev, cell) {
    if (!recomputing[self.at]) {
      recomputing[self.at] = self.value;
      self.val(self.value);
    }
  }
}

/**
 * Replace with another cell or value
 *
 * @param {Cell|Mixed} cell
 * @return {Cell} new cell or self
 * @api public
 */

Cell.prototype.replace = function(cell) {
  if (!cell instanceof Cell) return this.val(cell);
  var tr = this.el.parentNode;
  if (!tr) return this;
  tr.replaceChild(cell.el, this.el);
  return cell;
}

/**
 * Edit the cell
 *
 * @param {Event} e 
 * @api private
 */

Cell.prototype.edit = function(e) {
  var active = this.spreadsheet.active;
  if (active != this) return this;
  this.input.removeAttribute('disabled');
  return this;
}

/**
 * Is a number utility
 *
 * @param {Mixed} n
 * @return {Boolean}
 */

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Hide
 *
 * @return {Cell}
 * @api public
 */

Cell.prototype.hide = function() {
  this.classes.add('hidden');
  return this;
};

/**
 * Show
 *
 * @return {Cell}
 * @api public
 */

Cell.prototype.show = function() {
  this.classes.remove('hidden');
  return this;
};
