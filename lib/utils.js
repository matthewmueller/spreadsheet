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
    var m = match(cell.at);
    var l = lton(m[1]);
    var n = +m[2];
    if (l + n > sum) {
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

    if (l + n < sum) {
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
