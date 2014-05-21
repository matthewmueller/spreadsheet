/**
 * Module dependencies
 */

var numeral = require('numeral');
var event = require('event');
var events = require('events');
var Emitter = require('emitter');
var domify = require('domify');
var classes = require('classes');
var props = require('props');
var type = require('./type');
var tokens = require('./tokens');
var shortcuts = require('shortcuts');

/**
 * Regexs
 */

var rexpr = /\s*=/;

/**
 * Templates
 */

var el = domify('<td><input type="text" disabled></td>');

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
  this.el = el.cloneNode(true);
  this.classes = classes(this.el);
  this.attr('name', at);

  // get the input
  this.input = this.el.firstChild;
  this.input.value = value;

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
  var prev = this.value;
  var at = this.at;

  // update the value
  if (opts.compute) {
    val = this.compute(val)
    this.input.value = val;
  }
  
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
  var input = this.input;

  this.classes.add('editable');

  event.bind(input, 'input', function(e) {
    if (rexpr.test(input.value)) return;
    self.val(input.value, { compute: false });
  });

  event.bind(input, 'focus', function(e) {
    // self.classes.add('active');
    input.value = self.value;
  });

  event.bind(input, 'blur', function(e) {
    // TODO: temporary fix for blur firing twice, i think...
    e.stopImmediatePropagation();

    // self.classes.remove('active');
    if ('' == input.value) return;
    self.val(input.value);
  });

  return this;
};

/**
 * onkeydown
 */

Cell.prototype.onkeydown = function(e) {
  var classes = this.classes;
  var input = this.input;
  
  if (!classes.has('editing') && classes.has('editable') && !classes.has('focused')) {
    input.focus();
    input.value = '';
  }

  classes.add('editing');
};


/**
 * Arrow key event listeners
 *
 * @param {Event} e
 * @return {Cell}
 */

['left', 'right', 'up', 'down'].forEach(function(m) {
  Cell.prototype['on' + m] = function(e) {

    // if we're focused, use arrows for cursor navigation
    if (this.classes.has('focused')) {
      e.stopPropagation();
    } else {
      e.preventDefault();
    }

    return this;
  }
});

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
 * highlight
 */

Cell.prototype.activate = function() {
  var classes = this.classes;
  var input = this.input;

  if (classes.has('editable')) {
    input.removeAttribute('disabled');
  }

  // if we're already highlighted, focus
  if (classes.has('highlighted')) {
    classes.add('focused');
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
    spreadsheet.on('change ' + cell, recompute);
    this.observing.push([cell, recompute]);
  }

  function recompute(val, prev, cell) {
    self.val(self.value);
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
