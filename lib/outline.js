/**
 * Module dependencies
 */

var round = Math.round;
var body = document.body;
var event = require('event');
var events = require('events');
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
 * Export `Outline`
 */

module.exports = Outline;

/**
 * Initialize `Outline`
 */

function Outline(parent) {
  if (!(this instanceof Outline)) return new Outline(parent);
  this.parent = parent;
  this.el = el.cloneNode(true);
  this.host = null;
  
  this.document = events(document, this);
  this.document.bind('click', 'maybehide');

  this.window = events(window, this);
  this.window.bind('resize', 'resize');
}

/**
 * show
 */

Outline.prototype.show = function(host) {
  var el = this.el;
  var parent = this.parent;
  
  this.host = host;
  this.resize();

  !el.parentNode && parent.appendChild(el);

  return el;
};

/**
 * maybeHide
 */

Outline.prototype.maybehide = function(e) {
  var parent = this.parent;
  var target = e.target;

  // don't hide clicks within the spreadsheet
  if (parent == target || parent.contains(target)) return this;

  this.hide();
};


/**
 * hide
 */

Outline.prototype.hide = function() {
  var parent = this.parent;
  var el = this.el;

  // remove the outline
  el.parentNode && parent.removeChild(el);

  // unset the host
  this.host = null;
};

/**
 * destroy
 */

Outline.prototype.destroy = function() {
  el.parentNode && parent.removeChild(el);
  this.document.unbind();
  this.window.unbind();
  return this;
};

/**
 * resize
 */

Outline.prototype.resize = function() {
  if (!this.host) return this;
  
  var el = this.el;  
  var parent = this.parent;
  var pos = position(this.host);
  var off = position(parent);

  el.style.top = round(pos.top - off.top - 1) + 'px';
  el.style.left = round(pos.left - off.left - 1) + 'px';
  el.style.width = round(pos.width + 1) + 'px';
  el.style.height = round(pos.height + 1) + 'px';

  return this;
};



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
