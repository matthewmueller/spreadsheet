/**
 * Module Dependencies
 */

var tokens = require('./tokens');
var type = require('./type');
var utils = require('./utils');
var lton = utils.lton;
var ntol = utils.ntol;

/**
 * Regexs
 */

var regex = require('./regex');
var rblock = regex.block;
var rcell = regex.cell;
var rrows = regex.rows;
var rcols = regex.cols;
var rrow = regex.row;
var rcol = regex.col;

/**
 * Export `expand`
 */

module.exports = expand;

/**
 * Expand the selection
 *
 * @param {String|Array} selections
 * @return {Array}
 */

function expand(selection, largest) {
  var toks = tokens(selection);
  var m = rcell.exec(largest);
  var maxcol = m[1];
  var maxrow = m[2];
  var out = [];

  for (var i = 0, tok; tok = toks[i]; i++) {
    switch (type(tok)) {
      case 'block':
        m = rblock.exec(tok);
        out = out.concat(range(m[1], m[2]));
        break;
      case 'row':
        m = rrow.exec(tok);
        var n = +m[1];
        var start = 'A' + n;
        var end = maxcol + n;
        out = out.concat(range(start, end));
        break;
      case 'rows':
        m = rrows.exec(tok);
        var start = 'A' + m[1];
        var end = maxcol + m[2];
        out = out.concat(range(start, end));
        break;
      case 'col':
        m = rcol.exec(tok);
        var l = m[1];
        var start = l + 1;
        var end = l + maxrow;
        out = out.concat(range(start, end));
        break;
      case 'cols':
        m = rcols.exec(tok);
        var start = m[1] + '1';
        var end = m[2] + maxrow;
        out = out.concat(range(start, end));
        break;
      case 'cell':
        out = out.concat(tok);
    }
  }

  return out
};

/**
 * Expand a selection into it's range
 *
 * @param {String} from
 * @param {String} to
 * @return {Array}
 */

function range(from, to) {

  var start = rcell.exec(from);
  if (!start) return this.error('invalid expansion: ' + from);
  var sx = lton(start[1]);
  var sy = +start[2];

  var end = rcell.exec(to);
  if (!end) return this.error('invalid expansion: ' + to);
  var ex = lton(end[1]);
  var ey = +end[2];

  var out = [];

  for (var i = sy; i <= ey; i++) {
    for (var j = sx; j <= ex; j++) {
      out[out.length] = ntol(j) + i;
    }
  }

  return out;
}
