/**
 * Module dependencies
 */

var round = Math.round;
var body = document.body;
var event = require('event');
var raf = require('per-frame');
var domify = require('domify');
var closest = require('closest');
var classes = require('classes');
var host;

/**
 * Singleton
 */

var el = domify('<div class="outline"></div>');

/**
 * Export `active`
 */

module.exports = active;

/**
 * Initialize `active`
 */

function active(elem) {
  host = elem;

  var pos = position(elem);
  var cls = classes(el);

  el.style.top = round(pos.top) - 1 + 'px';
  el.style.left = round(pos.left) - 1 + 'px';
  el.style.width = round(pos.width) - 2 + 'px';
  el.style.height = round(pos.height) - 2 + 'px';

  !el.parentNode && body.appendChild(el);

  return el;
}

/**
 * If we're resizing, update outline
 */

event.bind(window, 'resize', raf(function() {
  host && active(host);
}));

/**
 * Hide if we click outside a spreadsheet
 */

event.bind(window, 'click', function(e) {
  var target = e.target;
  var sheet = closest(target, '.spreadsheet');
  el.parentNode && !sheet && body.removeChild(el);
});

/**
 * Get the position
 */

function position(el) {
  var box = el.getBoundingClientRect();
  var scrollTop = window.pageYOffset;
  var scrollLeft = window.pageXOffset;

  return {
    top: box.top + scrollTop,
    right: box.right + scrollLeft,
    left: box.left + scrollLeft,
    bottom: box.bottom + scrollTop,
    width: box.width,
    height: box.height
  }
};
