/**
 * Module dependencies
 */

var Spreadsheet = require('./spreadsheet');
var shortcuts = require('shortcuts');
var delegate = require('delegates');
var events = require('events');

/**
 * Export `Workbook`
 */

module.exports = Workbook;

/**
 * Initialize `Workbook`
 */

function Workbook() {
  if (!(this instanceof Workbook)) return new Workbook();
  this.spreadsheets = [];
  this.active = null;
  
  this.events = events(window, this);
  this.events.bind('click', 'onclick');
  this.events.bind('keydown', 'onkeydown');

  
  // set up keyboard shortcuts
  this.shortcuts = shortcuts(document, this);
  this.shortcuts.k.ignore = false;
  this.shortcuts.bind('right', 'onright');
  this.shortcuts.bind('enter', 'ondown');
  this.shortcuts.bind('down', 'ondown');
  this.shortcuts.bind('left', 'onleft');
  this.shortcuts.bind('up', 'onup');
  this.shortcuts.bind('esc', 'onesc');
  this.shortcuts.bind('f2', 'onf2');
}

/**
 * Delegate keyboard shortcuts
 */

delegate(Workbook.prototype, 'active')
  .method('onkeydown')
  .method('onright')
  .method('onleft')
  .method('ondown')
  .method('onup')
  .method('onesc')
  .method('onf2')

/**
 * Activate a spreadsheet on click
 */

Workbook.prototype.onclick = function(e) {
  var target = e.target;
  var active = null;

  for (var i = 0, s; s = this.spreadsheets[i]; i++) {
    if (s.el.contains(target)) {
      active = s;
      break;
    }
  }

  this.active = active;
  return this;
};


/**
 * add a spreadsheet to the workbook
 */

Workbook.prototype.spreadsheet = function() {
  var spreadsheet = new Spreadsheet();
  this.spreadsheets.push(spreadsheet);
  return spreadsheet;
};
