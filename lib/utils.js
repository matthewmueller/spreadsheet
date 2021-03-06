/**
 * Module Dependencies
 */

var type = require('./type');
var match = require('./match');
var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Letter to number
 *
 * @param {String} l
 * @return {Number}
 */

exports.lton = lton = function(l) {
  return letters.indexOf(l);
}

/**
 * Number to letter
 *
 * TODO: support Y, Z, AA, AB, AC, ...
 *
 * @param {String} l
 * @return {Number}
 */

exports.ntol = ntol = function(n) {
  return letters[n];
}

/**
 * Shift the cell
 *
 * @param {String} cell
 * @param {String} row/col/cell
 */

exports.shift = shift = function(cell, shifter) {
  var t = type(shifter);
  shifter = shifter.replace(/^\:/, '');

  switch(t) {
    case 'col':
      return cell.replace(/[A-Za-z]+/g, shifter);
    case 'row':
      return cell.replace(/[0-9]+/g, shifter);
    case 'cell':
      return shifter;
  }
}

/**
 * Get the largest value of the selection
 * aka, the bottom-right value
 *
 * @param {Array} cells
 * @return {String} largest
 * @api public
 */

exports.largest = largest = function(cells) {
  var out = null;
  var sum = 1;

  for (var i = 0, cell; cell = cells[i]; i++) {
    var m = match(cell.at || cell);
    var l = lton(m[1]);
    var n = +m[2];

    if (l + n >= sum) {
      out = cell;
      sum = l + n;
    }
  }

  return out;
};

/**
 * Get the smallest value of an array of
 * cells. aka, the top-right value.
 *
 * @param {Array} cells
 * @param {String}
 */

exports.smallest = smallest = function(cells) {
  var out = null;
  var sum = Infinity;

  for (var i = 0, cell; cell = cells[i]; i++) {
    var m = match(cell.at);
    var l = lton(m[1]);
    var n = +m[2];

    if (l + n <= sum) {
      out = cell;
      sum = l + n;
    }
  }

  return out;
};

/**
 * Subtract two positions
 *
 * @param {String} a
 * @param {String} b
 * @return {String}
 */

exports.subtract = subtract = function(a, b) {
  // a
  var m = match(a);
  var al = lton(m[1]);
  var an = +m[2];

  // b
  var m = match(b);
  var bl = lton(m[1]);
  var bn = +m[2];

  // a - b
  return {
    col: al - bl,
    row: an - bn
  };
};

/**
 * Get an array of the rows in a selection
 *
 * @param {Array} cells
 * @return {Array}
 */

exports.rows = rows = function(cells) {
  var buckets = {};
  var rows = [];
  var number;

  for (var i = 0, cell; cell = cells[i]; i++) {
    number = match(cell.at || cell)[2];
    if (!buckets[number]) buckets[number] = [];
    buckets[number].push(cell);
  }

  return buckets;
};

/**
 * Get an array of the cols in a selection
 *
 * @param {Array} cells
 * @return {Array}
 */

exports.cols = cols = function(cells) {
  var buckets = {};
  var cols = [];
  var letter;

  for (var i = 0, cell; cell = cells[i]; i++) {
    letter = match(cell.at || cell)[1];
    if (!buckets[letter]) buckets[letter] = [];
    buckets[letter].push(cell);
  }

  return buckets;
};

/**
 * Column range
 */

exports.colrange = colrange = function(from, to) {
  if (!to) return [from];

  var out = [];
  from = lton(from);
  to = lton(to);

  for (var i = from; i <= to; i++) {
    out.push(letters[i]);
  }

  return out;
}

/**
 * Row range
 */

exports.rowrange = rowrange = function(from, to) {
  var out = [];
  from = +from;
  to = +to;

  if (!to) return [from];

  for (var i = from; i <= to; i++) {
    out.push(i);
  }

  return out;
}

/**
 * element range
 */

exports.range = range = function(expr) {
  var t = type(expr);
  if (/rows?/.test(t)) {

  } else {

  }

}
