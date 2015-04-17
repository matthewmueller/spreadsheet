(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Spreadsheet = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function _dereq_(path, parent, orig) {
  var resolved = _dereq_.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = _dereq_.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, _dereq_.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

_dereq_.modules = {};

/**
 * Registered aliases.
 */

_dereq_.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

_dereq_.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (_dereq_.modules.hasOwnProperty(path)) return path;
    if (_dereq_.aliases.hasOwnProperty(path)) return _dereq_.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

_dereq_.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

_dereq_.register = function(path, definition) {
  _dereq_.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

_dereq_.alias = function(from, to) {
  if (!_dereq_.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  _dereq_.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

_dereq_.relative = function(parent) {
  var p = _dereq_.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return _dereq_(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return _dereq_.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return _dereq_.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
_dereq_.register("component-domify/index.js", function(exports, _dereq_, module){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.text =
map.circle =
map.ellipse =
map.line =
map.path =
map.polygon =
map.polyline =
map.rect = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');
  
  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return document.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = document.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

});
_dereq_.register("component-emitter/index.js", function(exports, _dereq_, module){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
_dereq_.register("yields-isarray/index.js", function(exports, _dereq_, module){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Wether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

});
_dereq_.register("component-indexof/index.js", function(exports, _dereq_, module){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
_dereq_.register("component-classes/index.js", function(exports, _dereq_, module){
/**
 * Module dependencies.
 */

var index = _dereq_('indexof');

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  if (!el) throw new Error('A DOM element reference is required');
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`, can force state via `force`.
 *
 * For browsers that support classList, but do not support `force` yet,
 * the mistake will be detected and corrected.
 *
 * @param {String} name
 * @param {Boolean} force
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name, force){
  // classList
  if (this.list) {
    if ("undefined" !== typeof force) {
      if (force !== this.list.toggle(name, force)) {
        this.list.toggle(name); // toggle again to correct
      }
    } else {
      this.list.toggle(name);
    }
    return this;
  }

  // fallback
  if ("undefined" !== typeof force) {
    if (!force) {
      this.remove(name);
    } else {
      this.add(name);
    }
  } else {
    if (this.has(name)) {
      this.remove(name);
    } else {
      this.add(name);
    }
  }

  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var str = this.el.className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

});
_dereq_.register("component-query/index.js", function(exports, _dereq_, module){
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

});
_dereq_.register("component-matches-selector/index.js", function(exports, _dereq_, module){
/**
 * Module dependencies.
 */

var query = _dereq_('query');

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matches
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

});
_dereq_.register("discore-closest/index.js", function(exports, _dereq_, module){
var matches = _dereq_('matches-selector')

module.exports = function (element, selector, checkYoSelf, root) {
  element = checkYoSelf ? {parentNode: element} : element

  root = root || document

  // Make sure `element !== document` and `element != null`
  // otherwise we get an illegal invocation
  while ((element = element.parentNode) && element !== document) {
    if (matches(element, selector))
      return element
    // After `matches` on the edge case that
    // the selector matches the root
    // (when the root is not the document)
    if (element === root)
      return  
  }
}
});
_dereq_.register("component-delegate/index.js", function(exports, _dereq_, module){
/**
 * Module dependencies.
 */

var closest = _dereq_('closest')
  , event = _dereq_('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    var target = e.target || e.srcElement;
    e.delegateTarget = closest(target, selector, true, el);
    if (e.delegateTarget) fn.call(el, e);
  }, capture);
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

});
_dereq_.register("component-events/index.js", function(exports, _dereq_, module){

/**
 * Module dependencies.
 */

var events = _dereq_('event');
var delegate = _dereq_('delegate');

/**
 * Expose `Events`.
 */

module.exports = Events;

/**
 * Initialize an `Events` with the given
 * `el` object which events will be bound to,
 * and the `obj` which will receive method calls.
 *
 * @param {Object} el
 * @param {Object} obj
 * @api public
 */

function Events(el, obj) {
  if (!(this instanceof Events)) return new Events(el, obj);
  if (!el) throw new Error('element required');
  if (!obj) throw new Error('object required');
  this.el = el;
  this.obj = obj;
  this._events = {};
}

/**
 * Subscription helper.
 */

Events.prototype.sub = function(event, method, cb){
  this._events[event] = this._events[event] || {};
  this._events[event][method] = cb;
};

/**
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * Examples:
 *
 *  Direct event handling:
 *
 *    events.bind('click') // implies "onclick"
 *    events.bind('click', 'remove')
 *    events.bind('click', 'sort', 'asc')
 *
 *  Delegated event handling:
 *
 *    events.bind('click li > a')
 *    events.bind('click li > a', 'remove')
 *    events.bind('click a.sort-ascending', 'sort', 'asc')
 *    events.bind('click a.sort-descending', 'sort', 'desc')
 *
 * @param {String} event
 * @param {String|function} [method]
 * @return {Function} callback
 * @api public
 */

Events.prototype.bind = function(event, method){
  var e = parse(event);
  var el = this.el;
  var obj = this.obj;
  var name = e.name;
  var method = method || 'on' + name;
  var args = [].slice.call(arguments, 2);

  // callback
  function cb(){
    var a = [].slice.call(arguments).concat(args);
    obj[method].apply(obj, a);
  }

  // bind
  if (e.selector) {
    cb = delegate.bind(el, e.selector, name, cb);
  } else {
    events.bind(el, name, cb);
  }

  // subscription for unbinding
  this.sub(name, method, cb);

  return cb;
};

/**
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 * Examples:
 *
 *  Unbind direct handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * Unbind delegate handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * @param {String|Function} [event]
 * @param {String|Function} [method]
 * @api public
 */

Events.prototype.unbind = function(event, method){
  if (0 == arguments.length) return this.unbindAll();
  if (1 == arguments.length) return this.unbindAllOf(event);

  // no bindings for this event
  var bindings = this._events[event];
  if (!bindings) return;

  // no bindings for this method
  var cb = bindings[method];
  if (!cb) return;

  events.unbind(this.el, event, cb);
};

/**
 * Unbind all events.
 *
 * @api private
 */

Events.prototype.unbindAll = function(){
  for (var event in this._events) {
    this.unbindAllOf(event);
  }
};

/**
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

Events.prototype.unbindAllOf = function(event){
  var bindings = this._events[event];
  if (!bindings) return;

  for (var method in bindings) {
    this.unbind(event, method);
  }
};

/**
 * Parse `event`.
 *
 * @param {String} event
 * @return {Object}
 * @api private
 */

function parse(event) {
  var parts = event.split(/ +/);
  return {
    name: parts.shift(),
    selector: parts.join(' ')
  }
}

});
_dereq_.register("component-event/index.js", function(exports, _dereq_, module){
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
});
_dereq_.register("component-props/index.js", function(exports, _dereq_, module){
/**
 * Global Names
 */

var globals = /\b(Array|Date|Object|Math|JSON)\b/g;

/**
 * Return immediate identifiers parsed from `str`.
 *
 * @param {String} str
 * @param {String|Function} map function or prefix
 * @return {Array}
 * @api public
 */

module.exports = function(str, fn){
  var p = unique(props(str));
  if (fn && 'string' == typeof fn) fn = prefixed(fn);
  if (fn) return map(str, p, fn);
  return p;
};

/**
 * Return immediate identifiers in `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function props(str) {
  return str
    .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
    .replace(globals, '')
    .match(/[a-zA-Z_]\w*/g)
    || [];
}

/**
 * Return `str` with `props` mapped with `fn`.
 *
 * @param {String} str
 * @param {Array} props
 * @param {Function} fn
 * @return {String}
 * @api private
 */

function map(str, props, fn) {
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  return str.replace(re, function(_){
    if ('(' == _[_.length - 1]) return fn(_);
    if (!~props.indexOf(_)) return _;
    return fn(_);
  });
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

/**
 * Map with prefix `str`.
 */

function prefixed(str) {
  return function(_){
    return str + _;
  };
}

});
_dereq_.register("adamwdraper-numeral-js/numeral.js", function(exports, _dereq_, module){
/*!
 * numeral.js
 * version : 1.5.3
 * author : Adam Draper
 * license : MIT
 * http://adamwdraper.github.com/Numeral-js/
 */

(function () {

    /************************************
        Constants
    ************************************/

    var numeral,
        VERSION = '1.5.3',
        // internal storage for language config files
        languages = {},
        currentLanguage = 'en',
        zeroFormat = null,
        defaultFormat = '0,0',
        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports);


    /************************************
        Constructors
    ************************************/


    // Numeral prototype object
    function Numeral (number) {
        this._value = number;
    }

    /**
     * Implementation of toFixed() that treats floats more like decimals
     *
     * Fixes binary rounding issues (eg. (0.615).toFixed(2) === '0.61') that present
     * problems for accounting- and finance-related software.
     */
    function toFixed (value, precision, roundingFunction, optionals) {
        var power = Math.pow(10, precision),
            optionalsRegExp,
            output;
            
        //roundingFunction = (roundingFunction !== undefined ? roundingFunction : Math.round);
        // Multiply up by precision, round accurately, then divide and use native toFixed():
        output = (roundingFunction(value * power) / power).toFixed(precision);

        if (optionals) {
            optionalsRegExp = new RegExp('0{1,' + optionals + '}$');
            output = output.replace(optionalsRegExp, '');
        }

        return output;
    }

    /************************************
        Formatting
    ************************************/

    // determine what type of formatting we need to do
    function formatNumeral (n, format, roundingFunction) {
        var output;

        // figure out what kind of format we are dealing with
        if (format.indexOf('$') > -1) { // currency!!!!!
            output = formatCurrency(n, format, roundingFunction);
        } else if (format.indexOf('%') > -1) { // percentage
            output = formatPercentage(n, format, roundingFunction);
        } else if (format.indexOf(':') > -1) { // time
            output = formatTime(n, format);
        } else { // plain ol' numbers or bytes
            output = formatNumber(n._value, format, roundingFunction);
        }

        // return string
        return output;
    }

    // revert to number
    function unformatNumeral (n, string) {
        var stringOriginal = string,
            thousandRegExp,
            millionRegExp,
            billionRegExp,
            trillionRegExp,
            suffixes = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            bytesMultiplier = false,
            power;

        if (string.indexOf(':') > -1) {
            n._value = unformatTime(string);
        } else {
            if (string === zeroFormat) {
                n._value = 0;
            } else {
                if (languages[currentLanguage].delimiters.decimal !== '.') {
                    string = string.replace(/\./g,'').replace(languages[currentLanguage].delimiters.decimal, '.');
                }

                // see if abbreviations are there so that we can multiply to the correct number
                thousandRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.thousand + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                millionRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.million + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                billionRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.billion + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                trillionRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.trillion + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');

                // see if bytes are there so that we can multiply to the correct number
                for (power = 0; power <= suffixes.length; power++) {
                    bytesMultiplier = (string.indexOf(suffixes[power]) > -1) ? Math.pow(1024, power + 1) : false;

                    if (bytesMultiplier) {
                        break;
                    }
                }

                // do some math to create our number
                n._value = ((bytesMultiplier) ? bytesMultiplier : 1) * ((stringOriginal.match(thousandRegExp)) ? Math.pow(10, 3) : 1) * ((stringOriginal.match(millionRegExp)) ? Math.pow(10, 6) : 1) * ((stringOriginal.match(billionRegExp)) ? Math.pow(10, 9) : 1) * ((stringOriginal.match(trillionRegExp)) ? Math.pow(10, 12) : 1) * ((string.indexOf('%') > -1) ? 0.01 : 1) * (((string.split('-').length + Math.min(string.split('(').length-1, string.split(')').length-1)) % 2)? 1: -1) * Number(string.replace(/[^0-9\.]+/g, ''));

                // round if we are talking about bytes
                n._value = (bytesMultiplier) ? Math.ceil(n._value) : n._value;
            }
        }
        return n._value;
    }

    function formatCurrency (n, format, roundingFunction) {
        var symbolIndex = format.indexOf('$'),
            openParenIndex = format.indexOf('('),
            minusSignIndex = format.indexOf('-'),
            space = '',
            spliceIndex,
            output;

        // check for space before or after currency
        if (format.indexOf(' $') > -1) {
            space = ' ';
            format = format.replace(' $', '');
        } else if (format.indexOf('$ ') > -1) {
            space = ' ';
            format = format.replace('$ ', '');
        } else {
            format = format.replace('$', '');
        }

        // format the number
        output = formatNumber(n._value, format, roundingFunction);

        // position the symbol
        if (symbolIndex <= 1) {
            if (output.indexOf('(') > -1 || output.indexOf('-') > -1) {
                output = output.split('');
                spliceIndex = 1;
                if (symbolIndex < openParenIndex || symbolIndex < minusSignIndex){
                    // the symbol appears before the "(" or "-"
                    spliceIndex = 0;
                }
                output.splice(spliceIndex, 0, languages[currentLanguage].currency.symbol + space);
                output = output.join('');
            } else {
                output = languages[currentLanguage].currency.symbol + space + output;
            }
        } else {
            if (output.indexOf(')') > -1) {
                output = output.split('');
                output.splice(-1, 0, space + languages[currentLanguage].currency.symbol);
                output = output.join('');
            } else {
                output = output + space + languages[currentLanguage].currency.symbol;
            }
        }

        return output;
    }

    function formatPercentage (n, format, roundingFunction) {
        var space = '',
            output,
            value = n._value * 100;

        // check for space before %
        if (format.indexOf(' %') > -1) {
            space = ' ';
            format = format.replace(' %', '');
        } else {
            format = format.replace('%', '');
        }

        output = formatNumber(value, format, roundingFunction);
        
        if (output.indexOf(')') > -1 ) {
            output = output.split('');
            output.splice(-1, 0, space + '%');
            output = output.join('');
        } else {
            output = output + space + '%';
        }

        return output;
    }

    function formatTime (n) {
        var hours = Math.floor(n._value/60/60),
            minutes = Math.floor((n._value - (hours * 60 * 60))/60),
            seconds = Math.round(n._value - (hours * 60 * 60) - (minutes * 60));
        return hours + ':' + ((minutes < 10) ? '0' + minutes : minutes) + ':' + ((seconds < 10) ? '0' + seconds : seconds);
    }

    function unformatTime (string) {
        var timeArray = string.split(':'),
            seconds = 0;
        // turn hours and minutes into seconds and add them all up
        if (timeArray.length === 3) {
            // hours
            seconds = seconds + (Number(timeArray[0]) * 60 * 60);
            // minutes
            seconds = seconds + (Number(timeArray[1]) * 60);
            // seconds
            seconds = seconds + Number(timeArray[2]);
        } else if (timeArray.length === 2) {
            // minutes
            seconds = seconds + (Number(timeArray[0]) * 60);
            // seconds
            seconds = seconds + Number(timeArray[1]);
        }
        return Number(seconds);
    }

    function formatNumber (value, format, roundingFunction) {
        var negP = false,
            signed = false,
            optDec = false,
            abbr = '',
            abbrK = false, // force abbreviation to thousands
            abbrM = false, // force abbreviation to millions
            abbrB = false, // force abbreviation to billions
            abbrT = false, // force abbreviation to trillions
            abbrForce = false, // force abbreviation
            bytes = '',
            ord = '',
            abs = Math.abs(value),
            suffixes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            min,
            max,
            power,
            w,
            precision,
            thousands,
            d = '',
            neg = false;

        // check if number is zero and a custom zero format has been set
        if (value === 0 && zeroFormat !== null) {
            return zeroFormat;
        } else {
            // see if we should use parentheses for negative number or if we should prefix with a sign
            // if both are present we default to parentheses
            if (format.indexOf('(') > -1) {
                negP = true;
                format = format.slice(1, -1);
            } else if (format.indexOf('+') > -1) {
                signed = true;
                format = format.replace(/\+/g, '');
            }

            // see if abbreviation is wanted
            if (format.indexOf('a') > -1) {
                // check if abbreviation is specified
                abbrK = format.indexOf('aK') >= 0;
                abbrM = format.indexOf('aM') >= 0;
                abbrB = format.indexOf('aB') >= 0;
                abbrT = format.indexOf('aT') >= 0;
                abbrForce = abbrK || abbrM || abbrB || abbrT;

                // check for space before abbreviation
                if (format.indexOf(' a') > -1) {
                    abbr = ' ';
                    format = format.replace(' a', '');
                } else {
                    format = format.replace('a', '');
                }

                if (abs >= Math.pow(10, 12) && !abbrForce || abbrT) {
                    // trillion
                    abbr = abbr + languages[currentLanguage].abbreviations.trillion;
                    value = value / Math.pow(10, 12);
                } else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9) && !abbrForce || abbrB) {
                    // billion
                    abbr = abbr + languages[currentLanguage].abbreviations.billion;
                    value = value / Math.pow(10, 9);
                } else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6) && !abbrForce || abbrM) {
                    // million
                    abbr = abbr + languages[currentLanguage].abbreviations.million;
                    value = value / Math.pow(10, 6);
                } else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3) && !abbrForce || abbrK) {
                    // thousand
                    abbr = abbr + languages[currentLanguage].abbreviations.thousand;
                    value = value / Math.pow(10, 3);
                }
            }

            // see if we are formatting bytes
            if (format.indexOf('b') > -1) {
                // check for space before
                if (format.indexOf(' b') > -1) {
                    bytes = ' ';
                    format = format.replace(' b', '');
                } else {
                    format = format.replace('b', '');
                }

                for (power = 0; power <= suffixes.length; power++) {
                    min = Math.pow(1024, power);
                    max = Math.pow(1024, power+1);

                    if (value >= min && value < max) {
                        bytes = bytes + suffixes[power];
                        if (min > 0) {
                            value = value / min;
                        }
                        break;
                    }
                }
            }

            // see if ordinal is wanted
            if (format.indexOf('o') > -1) {
                // check for space before
                if (format.indexOf(' o') > -1) {
                    ord = ' ';
                    format = format.replace(' o', '');
                } else {
                    format = format.replace('o', '');
                }

                ord = ord + languages[currentLanguage].ordinal(value);
            }

            if (format.indexOf('[.]') > -1) {
                optDec = true;
                format = format.replace('[.]', '.');
            }

            w = value.toString().split('.')[0];
            precision = format.split('.')[1];
            thousands = format.indexOf(',');

            if (precision) {
                if (precision.indexOf('[') > -1) {
                    precision = precision.replace(']', '');
                    precision = precision.split('[');
                    d = toFixed(value, (precision[0].length + precision[1].length), roundingFunction, precision[1].length);
                } else {
                    d = toFixed(value, precision.length, roundingFunction);
                }

                w = d.split('.')[0];

                if (d.split('.')[1].length) {
                    d = languages[currentLanguage].delimiters.decimal + d.split('.')[1];
                } else {
                    d = '';
                }

                if (optDec && Number(d.slice(1)) === 0) {
                    d = '';
                }
            } else {
                w = toFixed(value, null, roundingFunction);
            }

            // format number
            if (w.indexOf('-') > -1) {
                w = w.slice(1);
                neg = true;
            }

            if (thousands > -1) {
                w = w.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + languages[currentLanguage].delimiters.thousands);
            }

            if (format.indexOf('.') === 0) {
                w = '';
            }

            return ((negP && neg) ? '(' : '') + ((!negP && neg) ? '-' : '') + ((!neg && signed) ? '+' : '') + w + d + ((ord) ? ord : '') + ((abbr) ? abbr : '') + ((bytes) ? bytes : '') + ((negP && neg) ? ')' : '');
        }
    }

    /************************************
        Top Level Functions
    ************************************/

    numeral = function (input) {
        if (numeral.isNumeral(input)) {
            input = input.value();
        } else if (input === 0 || typeof input === 'undefined') {
            input = 0;
        } else if (!Number(input)) {
            input = numeral.fn.unformat(input);
        }

        return new Numeral(Number(input));
    };

    // version number
    numeral.version = VERSION;

    // compare numeral object
    numeral.isNumeral = function (obj) {
        return obj instanceof Numeral;
    };

    // This function will load languages and then set the global language.  If
    // no arguments are passed in, it will simply return the current global
    // language key.
    numeral.language = function (key, values) {
        if (!key) {
            return currentLanguage;
        }

        if (key && !values) {
            if(!languages[key]) {
                throw new Error('Unknown language : ' + key);
            }
            currentLanguage = key;
        }

        if (values || !languages[key]) {
            loadLanguage(key, values);
        }

        return numeral;
    };
    
    // This function provides access to the loaded language data.  If
    // no arguments are passed in, it will simply return the current
    // global language object.
    numeral.languageData = function (key) {
        if (!key) {
            return languages[currentLanguage];
        }
        
        if (!languages[key]) {
            throw new Error('Unknown language : ' + key);
        }
        
        return languages[key];
    };

    numeral.language('en', {
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (~~ (number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
        },
        currency: {
            symbol: '$'
        }
    });

    numeral.zeroFormat = function (format) {
        zeroFormat = typeof(format) === 'string' ? format : null;
    };

    numeral.defaultFormat = function (format) {
        defaultFormat = typeof(format) === 'string' ? format : '0.0';
    };

    /************************************
        Helpers
    ************************************/

    function loadLanguage(key, values) {
        languages[key] = values;
    }

    /************************************
        Floating-point helpers
    ************************************/

    // The floating-point helper functions and implementation
    // borrows heavily from sinful.js: http://guipn.github.io/sinful.js/

    /**
     * Array.prototype.reduce for browsers that don't support it
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#Compatibility
     */
    if ('function' !== typeof Array.prototype.reduce) {
        Array.prototype.reduce = function (callback, opt_initialValue) {
            'use strict';
            
            if (null === this || 'undefined' === typeof this) {
                // At the moment all modern browsers, that support strict mode, have
                // native implementation of Array.prototype.reduce. For instance, IE8
                // does not support strict mode, so this check is actually useless.
                throw new TypeError('Array.prototype.reduce called on null or undefined');
            }
            
            if ('function' !== typeof callback) {
                throw new TypeError(callback + ' is not a function');
            }

            var index,
                value,
                length = this.length >>> 0,
                isValueSet = false;

            if (1 < arguments.length) {
                value = opt_initialValue;
                isValueSet = true;
            }

            for (index = 0; length > index; ++index) {
                if (this.hasOwnProperty(index)) {
                    if (isValueSet) {
                        value = callback(value, this[index], index, this);
                    } else {
                        value = this[index];
                        isValueSet = true;
                    }
                }
            }

            if (!isValueSet) {
                throw new TypeError('Reduce of empty array with no initial value');
            }

            return value;
        };
    }

    
    /**
     * Computes the multiplier necessary to make x >= 1,
     * effectively eliminating miscalculations caused by
     * finite precision.
     */
    function multiplier(x) {
        var parts = x.toString().split('.');
        if (parts.length < 2) {
            return 1;
        }
        return Math.pow(10, parts[1].length);
    }

    /**
     * Given a variable number of arguments, returns the maximum
     * multiplier that must be used to normalize an operation involving
     * all of them.
     */
    function correctionFactor() {
        var args = Array.prototype.slice.call(arguments);
        return args.reduce(function (prev, next) {
            var mp = multiplier(prev),
                mn = multiplier(next);
        return mp > mn ? mp : mn;
        }, -Infinity);
    }        


    /************************************
        Numeral Prototype
    ************************************/


    numeral.fn = Numeral.prototype = {

        clone : function () {
            return numeral(this);
        },

        format : function (inputString, roundingFunction) {
            return formatNumeral(this, 
                  inputString ? inputString : defaultFormat, 
                  (roundingFunction !== undefined) ? roundingFunction : Math.round
              );
        },

        unformat : function (inputString) {
            if (Object.prototype.toString.call(inputString) === '[object Number]') { 
                return inputString; 
            }
            return unformatNumeral(this, inputString ? inputString : defaultFormat);
        },

        value : function () {
            return this._value;
        },

        valueOf : function () {
            return this._value;
        },

        set : function (value) {
            this._value = Number(value);
            return this;
        },

        add : function (value) {
            var corrFactor = correctionFactor.call(null, this._value, value);
            function cback(accum, curr, currI, O) {
                return accum + corrFactor * curr;
            }
            this._value = [this._value, value].reduce(cback, 0) / corrFactor;
            return this;
        },

        subtract : function (value) {
            var corrFactor = correctionFactor.call(null, this._value, value);
            function cback(accum, curr, currI, O) {
                return accum - corrFactor * curr;
            }
            this._value = [value].reduce(cback, this._value * corrFactor) / corrFactor;            
            return this;
        },

        multiply : function (value) {
            function cback(accum, curr, currI, O) {
                var corrFactor = correctionFactor(accum, curr);
                return (accum * corrFactor) * (curr * corrFactor) /
                    (corrFactor * corrFactor);
            }
            this._value = [this._value, value].reduce(cback, 1);
            return this;
        },

        divide : function (value) {
            function cback(accum, curr, currI, O) {
                var corrFactor = correctionFactor(accum, curr);
                return (accum * corrFactor) / (curr * corrFactor);
            }
            this._value = [this._value, value].reduce(cback);            
            return this;
        },

        difference : function (value) {
            return Math.abs(numeral(this._value).subtract(value).value());
        }

    };

    /************************************
        Exposing Numeral
    ************************************/

    // CommonJS module is defined
    if (hasModule) {
        module.exports = numeral;
    }

    /*global ender:false */
    if (typeof ender === 'undefined') {
        // here, `this` means `window` in the browser, or `global` on the server
        // add `numeral` as a global object via a string identifier,
        // for Closure Compiler 'advanced' mode
        this['numeral'] = numeral;
    }

    /*global define:false */
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return numeral;
        });
    }
}).call(this);

});
_dereq_.register("yields-shortcuts/index.js", function(exports, _dereq_, module){

/**
 * dependencies
 */

var dispatcher = _dereq_('k');

/**
 * Export `Shortcuts`
 */

module.exports = Shortcuts;

/**
 * Initialize `Shortcuts`.
 *
 * @param {Element} el
 * @param {Object} obj
 * @api public
 */

function Shortcuts(el, obj){
  if (!(this instanceof Shortcuts)) return new Shortcuts(el, obj);
  this.k = dispatcher(el);
  this.bindings = {};
  this.obj = obj;
  this.el = el;
}

/**
 * Bind `keys`, `method`.
 *
 * @param {String} keys
 * @param {String} method
 * @return {Shortcuts}
 * @api public
 */

Shortcuts.prototype.bind = function(keys, method){
  if (2 != arguments.length) throw new Error('expected 2 arguments');
  var bindings = this.bindings;
  var m = bindings[keys] = bindings[keys] || {};
  var callback = this.callback(method);
  m[method] = callback;
  this.k(keys, callback);
  return this;
};

/**
 * Unbind `keys`, `method`.
 *
 * @param {String} keys
 * @param {String} method
 * @return {Shortcuts}
 * @api public
 */

Shortcuts.prototype.unbind = function(keys, method){
  var methods = this.bindings[keys];

  if (2 == arguments.length) {
    this.k.unbind(keys, methods[method]);
    return this;
  }

  if (1 == arguments.length) {
    this.bindings[keys] = {};
    this.k.unbind(keys);
    return this;
  }

  this.bindings = {};
  this.k.unbind();
  return this;
};

/**
 * Wrap the given `method`.
 *
 * @param {String} method
 * @return {Function}
 * @api private
 */

Shortcuts.prototype.callback = function(method){
  var obj = this.obj;

  return function callback(){
    obj[method].apply(obj, arguments);
  }
};

});
_dereq_.register("yields-k-sequence/index.js", function(exports, _dereq_, module){

/**
 * dependencies
 */

var keycode = _dereq_('keycode');

/**
 * Export `sequence`
 */

module.exports = sequence;

/**
 * Create sequence fn with `keys`.
 * optional `ms` which defaults
 * to `500ms` and `fn`.
 *
 * Example:
 *
 *      seq = sequence('a b c', fn);
 *      el.addEventListener('keydown', seq);
 *
 * @param {String} keys
 * @param {Number} ms
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

function sequence(keys, ms, fn){
  var codes = keys.split(/ +/).map(keycode)
    , clen = codes.length
    , seq = []
    , i = 0
    , prev;

  if (2 == arguments.length) {
    fn = ms;
    ms = 500;
  }

  return function(e){
    var code = codes[i++];
    if (42 != code && code != e.which) return reset();
    if (prev && new Date - prev > ms) return reset();
    var len = seq.push(e.which);
    prev = new Date;
    if (len != clen) return;
    reset();
    fn(e);
  };

  function reset(){
    prev = null;
    seq = [];
    i = 0;
  }
};

});
_dereq_.register("yields-keycode/index.js", function(exports, _dereq_, module){

/**
 * map
 */

var map = {
    backspace: 8
  , command: 91
  , tab: 9
  , clear: 12
  , enter: 13
  , shift: 16
  , ctrl: 17
  , alt: 18
  , capslock: 20
  , escape: 27
  , esc: 27
  , space: 32
  , pageup: 33
  , pagedown: 34
  , end: 35
  , home: 36
  , left: 37
  , up: 38
  , right: 39
  , down: 40
  , del: 46
  , comma: 188
  , f1: 112
  , f2: 113
  , f3: 114
  , f4: 115
  , f5: 116
  , f6: 117
  , f7: 118
  , f8: 119
  , f9: 120
  , f10: 121
  , f11: 122
  , f12: 123
  , ',': 188
  , '.': 190
  , '/': 191
  , '`': 192
  , '-': 189
  , '=': 187
  , ';': 186
  , '[': 219
  , '\\': 220
  , ']': 221
  , '\'': 222
};

/**
 * find a keycode.
 *
 * @param {String} name
 * @return {Number}
 */

module.exports = function(name){
  return map[name.toLowerCase()] || name.toUpperCase().charCodeAt(0);
};

});
_dereq_.register("component-bind/index.js", function(exports, _dereq_, module){
/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

});
_dereq_.register("component-os/index.js", function(exports, _dereq_, module){


module.exports = os();

function os() {
  var ua = navigator.userAgent;
  if (/mac/i.test(ua)) return 'mac';
  if (/win/i.test(ua)) return 'windows';
  if (/linux/i.test(ua)) return 'linux';
}

});
_dereq_.register("yields-k/lib/index.js", function(exports, _dereq_, module){

/**
 * dependencies.
 */

var event = _dereq_('event')
  , proto = _dereq_('./proto')
  , bind = _dereq_('bind');

/**
 * Create a new dispatcher with `el`.
 *
 * example:
 *
 *      var k = require('k')(window);
 *      k('shift + tab', function(){});
 *
 * @param {Element} el
 * @return {Function}
 * @api public
 */

module.exports = function(el){
  function k(e, fn){ k.handle(e, fn) };
  k._handle = bind(k, proto.handle);
  k._clear = bind(k, proto.clear);
  event.bind(el, 'keydown', k._handle, false);
  event.bind(el, 'keyup', k._handle, false);
  event.bind(el, 'keyup', k._clear, false);
  event.bind(el, 'focus', k._clear, false);
  for (var p in proto) k[p] = proto[p];
  k.listeners = [];
  k.el = el;
  return k;
};

});
_dereq_.register("yields-k/lib/proto.js", function(exports, _dereq_, module){

/**
 * dependencies
 */

var sequence = _dereq_('k-sequence')
  , keycode = _dereq_('keycode')
  , event = _dereq_('event')
  , os = _dereq_('os');

/**
 * modifiers.
 */

var modifiers = {
  224: 'command',
  91: 'command',
  93: 'command',
  16: 'shift',
  17: 'ctrl',
  18: 'alt'
};

/**
 * Super key.
 * (must use subscript vs. dot notation to avoid issues with older browsers)
 */

exports[ 'super' ] = 'mac' == os
  ? 'command'
  : 'ctrl';

/**
 * Handle the given `KeyboardEvent` or bind
 * a new `keys` handler.
 *
 * @param {String|KeyboardEvent} e
 * @param {Function} fn
 * @api private
 */

exports.handle = function(e, fn){
  var ignore = this.ignore;
  var event = e.type;
  var code = e.which;

  // bind
  if (fn) return this.bind(e, fn);

  // modifiers
  var mod = modifiers[code];
  if ('keydown' == event && mod) {
    this[ 'super' ] = exports[ 'super' ] == mod;
    this[mod] = true;
    this.modifiers = true;
    return;
  }

  // ignore
  if (ignore && ignore(e)) return;

  // listeners
  var all = this.listeners;

  // match
  for (var i = 0; i < all.length; ++i) {
    var invoke = true;
    var obj = all[i];
    var seq = obj.seq;
    var mods = obj.mods;
    var fn = seq || obj.fn;

    if (!seq && code != obj.code) continue;
    if (event != obj.event) continue;

    for (var j = 0; j < mods.length; ++j) {
      if (!this[mods[j]]) {
        invoke = null;
        break;
      }
    }

    invoke && fn(e);
  }
};

/**
 * Destroy this `k` dispatcher instance.
 *
 * @api public
 */

exports.destroy = function(){
  event.unbind(this.el, 'keydown', this._handle);
  event.unbind(this.el, 'keyup', this._handle);
  event.unbind(this.el, 'keyup', this._clear);
  event.unbind(this.el, 'focus', this._clear);
  this.listeners = [];
};

/**
 * Unbind the given `keys` with optional `fn`.
 *
 * example:
 *
 *      k.unbind('enter, tab', myListener); // unbind `myListener` from `enter, tab` keys
 *      k.unbind('enter, tab'); // unbind all `enter, tab` listeners
 *      k.unbind(); // unbind all listeners
 *
 * @param {String} keys
 * @param {Function} fn
 * @return {k}
 * @api public
 */

exports.unbind = function(keys, fn){
  var fns = this.listeners
    , len = fns.length
    , all;

  // unbind all
  if (0 == arguments.length) {
    this.listeners = [];
    return this;
  }

  // parse
  all = parseKeys(keys);

  // unbind
  for (var i = 0; i < all.length; ++i) {
    for (var j = 0, obj; j < len; ++j) {
      obj = fns[j];
      if (!obj) continue;
      if (fn && obj.fn != fn) continue;
      if (obj.key != all[i].key) continue;
      if (!matches(obj, all[i])) continue;
      fns.splice(j--, 1);
    }
  }

  return this;
};

/**
 * Bind the given `keys` to `fn` with optional `event`
 *
 * example:
 *
 *      k.bind('shift + tab, ctrl + a', function(e){});
 *
 * @param {String} event
 * @param {String} keys
 * @param {Function} fn
 * @return {k}
 * @api public
 */

exports.bind = function(event, keys, fn){
  var fns = this.listeners
    , len
    , all;

  if (2 == arguments.length) {
    fn = keys;
    keys = event;
    event = 'keydown';
  }

  all = parseKeys(keys);
  len = all.length;

  for (var i = 0; i < len; ++i) {
    var obj = all[i];
    obj.seq = obj.seq && sequence(obj.key, fn);
    obj.event = event;
    obj.fn = fn;
    fns.push(obj);
  }

  return this;
};

/**
 * Bind keyup with `keys` and `fn`.
 *
 * @param {String} keys
 * @param {Function} fn
 * @return {k}
 * @api public
 */

exports.up = function(keys, fn){
  return this.bind('keyup', keys, fn);
};

/**
 * Bind keydown with `keys` and `fn`.
 *
 * @param {String} keys
 * @param {Function} fn
 * @return {k}
 * @api public
 */

exports.down = function(keys, fn){
  return this.bind('keydown', keys, fn);
};

/**
 * Clear all modifiers on `keyup`.
 *
 * @api private
 */

exports.clear = function(e){
  var code = e.keyCode || e.which;
  if (!(code in modifiers)) return;
  this[modifiers[code]] = null;
  this.modifiers = this.command
    || this.shift
    || this.ctrl
    || this.alt;
};

/**
 * Ignore all input elements by default.
 *
 * @param {Event} e
 * @return {Boolean}
 * @api private
 */

exports.ignore = function(e){
  var el = e.target || e.srcElement;
  var name = el.tagName.toLowerCase();
  return 'textarea' == name
    || 'select' == name
    || 'input' == name;
};

/**
 * Parse the given `keys`.
 *
 * @param {String} keys
 * @return {Array}
 * @api private
 */

function parseKeys(keys){
  keys = keys.replace('super', exports[ 'super' ]);

  var all = ',' != keys
    ? keys.split(/ *, */)
    : [','];

  var ret = [];
  for (var i = 0; i < all.length; ++i) {
    if ('' == all[i]) continue;
    var mods = all[i].split(/ *\+ */);
    var key = mods.pop() || ',';

    ret.push({
      seq: !!~ key.indexOf(' '),
      code: keycode(key),
      mods: mods,
      key: key
    });
  }

  return ret;
}

/**
 * Check if the given `a` matches `b`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Boolean}
 * @api private
 */

function matches(a, b){
  return 0 == b.mods.length || eql(a, b);
}

/**
 * Shallow eql util.
 *
 * TODO: move to yields/eql
 *
 * @param {Array} a
 * @param {Array} b
 * @return {Boolean}
 * @api private
 */

function eql(a, b){
  a = a.mods.sort().toString();
  b = b.mods.sort().toString();
  return a == b;
}

});
_dereq_.register("matthewmueller-delegates/index.js", function(exports, _dereq_, module){

/**
 * Expose `Delegator`.
 */

module.exports = Delegator;

/**
 * Initialize a delegator.
 *
 * @param {Object} proto
 * @param {String} target
 * @api public
 */

function Delegator(proto, target) {
  if (!(this instanceof Delegator)) return new Delegator(proto, target);
  this.proto = proto;
  this.target = target;
  this.methods = [];
  this.getters = [];
  this.setters = [];
}

/**
 * Delegate method `name`.
 *
 * @param {String} name
 * @return {Delegator} self
 * @api public
 */

Delegator.prototype.method = function(name){
  var proto = this.proto;
  var target = this.target;
  this.methods.push(name);

  proto[name] = function(){
    if (!this[target]) return this;
    return this[target][name].apply(this[target], arguments);
  };

  return this;
};

/**
 * Delegator accessor `name`.
 *
 * @param {String} name
 * @return {Delegator} self
 * @api public
 */

Delegator.prototype.access = function(name){
  return this.getter(name).setter(name);
};

/**
 * Delegator getter `name`.
 *
 * @param {String} name
 * @return {Delegator} self
 * @api public
 */

Delegator.prototype.getter = function(name){
  var proto = this.proto;
  var target = this.target;
  this.getters.push(name);

  proto.__defineGetter__(name, function(){
    if (!this[target]) return undefined;
    return this[target][name];
  });

  return this;
};

/**
 * Delegator setter `name`.
 *
 * @param {String} name
 * @return {Delegator} self
 * @api public
 */

Delegator.prototype.setter = function(name){
  var proto = this.proto;
  var target = this.target;
  this.setters.push(name);

  proto.__defineSetter__(name, function(val){
    if (!this[target]) return this;
    return this[target][name] = val;
  });

  return this;
};

});
_dereq_.register("component-closest/index.js", function(exports, _dereq_, module){
var matches = _dereq_('matches-selector')

module.exports = function (element, selector, checkYoSelf, root) {
  element = checkYoSelf ? {parentNode: element} : element

  root = root || document

  // Make sure `element !== document` and `element != null`
  // otherwise we get an illegal invocation
  while ((element = element.parentNode) && element !== document) {
    if (matches(element, selector))
      return element
    // After `matches` on the edge case that
    // the selector matches the root
    // (when the root is not the document)
    if (element === root)
      return  
  }
}
});
_dereq_.register("bmcmahen-modifier/index.js", function(exports, _dereq_, module){
module.exports = function(e){
 return e.shiftKey
  || e.altKey
  || e.ctrlKey
  || e.metaKey;
};
});
_dereq_.register("component-raf/index.js", function(exports, _dereq_, module){
/**
 * Expose `requestAnimationFrame()`.
 */

exports = module.exports = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.oRequestAnimationFrame
  || window.msRequestAnimationFrame
  || fallback;

/**
 * Fallback implementation.
 */

var prev = new Date().getTime();
function fallback(fn) {
  var curr = new Date().getTime();
  var ms = Math.max(0, 16 - (curr - prev));
  var req = setTimeout(fn, ms);
  prev = curr;
  return req;
}

/**
 * Cancel.
 */

var cancel = window.cancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.mozCancelAnimationFrame
  || window.oCancelAnimationFrame
  || window.msCancelAnimationFrame
  || window.clearTimeout;

exports.cancel = function(id){
  cancel.call(window, id);
};

});
_dereq_.register("matthewmueller-per-frame/index.js", function(exports, _dereq_, module){
/**
 * Module Dependencies
 */

var raf = _dereq_('raf')

/**
 * Export `throttle`
 */

module.exports = throttle;

/**
 * Throttle by the request animation frame.
 *
 * @param {Function} fn
 * @return {Function}
 */

function throttle(fn) {
  var queued = false;
  return queue;

  function queue() {
    if (queued) return;
    queued = true;
    var ctx = this;
    var args = arguments;

    raf(function() {
      queued = false;
      return fn.apply(ctx, args);
    });
  }
}

});
_dereq_.register("matthewmueller-mini-tokenizer/index.js", function(exports, _dereq_, module){
/**
 * Module Dependencies
 */

var rrep = /(\$(`|&|'|\d+))/g;
var slice = [].slice;
var noop = function(m) { return m[0]; }

/**
 * Expose `tokens`
 */

module.exports = tokens;

/**
 * Create a tokenizer
 *
 * @param {Regex} regex
 * @param {String|Function} rep
 * @return {Function}
 */

function tokens(regex, rep) {
  rep = rep || noop;
  rep = 'function' == typeof rep ? rep : compile(rep);

  return function(str) {
    var toks = [];

    str.replace(regex, function() {
      var args = slice.call(arguments);
      var tok = rep(args);
      tok && toks.push(tok);
    });

    return toks;
  };
}

/**
 * Compile the replacer
 *
 * @param {String} str
 * @return {String}
 */

function compile(str) {
  var expr = str.replace(rrep, function(m) {
    var out = '\' + ($[';
    out += '&' == m[1] ? 0 : m[1];
    out += '] || \'\') + \'';
    return out;
  })

  expr = '\'' + expr + '\'';
  return new Function('$', 'return ' + expr);
}

});
_dereq_.register("visionmedia-jade/lib/runtime.js", function(exports, _dereq_, module){
'use strict';

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = merge(attrs, a[i]);
    }
    return attrs;
  }
  var ac = a['class'];
  var bc = b['class'];

  if (ac || bc) {
    ac = ac || [];
    bc = bc || [];
    if (!Array.isArray(ac)) ac = [ac];
    if (!Array.isArray(bc)) bc = [bc];
    a['class'] = ac.concat(bc).filter(nulls);
  }

  for (var key in b) {
    if (key != 'class') {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Filter null `val`s.
 *
 * @param {*} val
 * @return {Boolean}
 * @api private
 */

function nulls(val) {
  return val != null && val !== '';
}

/**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 */
exports.joinClasses = joinClasses;
function joinClasses(val) {
  return Array.isArray(val) ? val.map(joinClasses).filter(nulls).join(' ') : val;
}

/**
 * Render the given classes.
 *
 * @param {Array} classes
 * @param {Array.<Boolean>} escaped
 * @return {String}
 */
exports.cls = function cls(classes, escaped) {
  var buf = [];
  for (var i = 0; i < classes.length; i++) {
    if (escaped && escaped[i]) {
      buf.push(exports.escape(joinClasses([classes[i]])));
    } else {
      buf.push(joinClasses(classes[i]));
    }
  }
  var text = joinClasses(buf);
  if (text.length) {
    return ' class="' + text + '"';
  } else {
    return '';
  }
};

/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = function attr(key, val, escaped, terse) {
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
  } else if (escaped) {
    return ' ' + key + '="' + exports.escape(val) + '"';
  } else {
    return ' ' + key + '="' + val + '"';
  }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 */
exports.attrs = function attrs(obj, terse){
  var buf = [];

  var keys = Object.keys(obj);

  if (keys.length) {
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('class' == key) {
        if (val = joinClasses(val)) {
          buf.push(' ' + key + '="' + val + '"');
        }
      } else {
        buf.push(exports.attr(key, val, false, terse));
      }
    }
  }

  return buf.join('');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function escape(html){
  var result = String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  if (result === '' + html) return html;
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str =  str || _dereq_('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};

});
_dereq_.register("juliangruber-intersect/index.js", function(exports, _dereq_, module){
module.exports = intersect;

function intersect (a, b) {
  var res = [];
  for (var i = 0; i < a.length; i++) {
    if (indexOf(b, a[i]) > -1) res.push(a[i]);
  }
  return res;
}

intersect.big = function(a, b) {
  var ret = [];
  var temp = {};
  
  for (var i = 0; i < b.length; i++) {
    temp[b[i]] = true;
  }
  for (var i = 0; i < a.length; i++) {
    if (temp[a[i]]) ret.push(a[i]);
  }
  
  return ret;
}

function indexOf(arr, el) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === el) return i;
  }
  return -1;
}

});
_dereq_.register("jkroso-unique/index.js", function(exports, _dereq_, module){
/**
 * Returns a new array without duplicate elements
 * 
 * @param {Array} arr
 * @return {Array}
 */

module.exports = function (arr) {
  var len = arr.length
  if (!len) return []

  var result = [arr[0]]
    , rc = 1
    , i = 1

  each: while (i < len) {
    var el = arr[i++]
      , c = 0

    while (c < rc) {
      if (result[c++] === el) continue each
    }

    result[rc++] = el
  }

  return result
}

});
_dereq_.register("matthewmueller-grid/index.js", function(exports, _dereq_, module){
/**
 * Expose grid
 */

module.exports = _dereq_('./lib/grid');

});
_dereq_.register("matthewmueller-grid/lib/grid.js", function(exports, _dereq_, module){
/**
 * Module dependencies
 */

var isArray = Array.isArray;
var Selection = _dereq_('./selection');
var utils = _dereq_('./utils');
var ntol = utils.ntol;

/**
 * Export `Grid`
 */

module.exports = Grid;

/**
 * Initialize `Grid`
 */

function Grid(col, row) {
  if (!(this instanceof Grid)) return new Grid(col, row);
  col = col || 5;
  this.maxcol = ntol(col - 1);
  this.maxrow = row || 5;
  this.grid = {};
}

/**
 * Select
 *
 * @param {String} expr
 * @return {Grid}
 * @api public
 */

Grid.prototype.select = function(expr) {
  return new Selection(expr, this);
};

/**
 * all
 */

Grid.prototype.all = function() {
  var largest = this.maxcol + this.maxrow;
  return new Selection('A1:' + largest, this);
};

/**
 * at
 */

Grid.prototype.at = function(at) {
  return this.grid[at];
};

/**
 * Delegate functions to Selection
 */

['forEach', 'max', 'toString', 'cols', 'rows', 'fill', 'json', 'value', 'insert', 'map']
.forEach(function(fn) {
  Grid.prototype[fn] = function() {
    var sel = this.all();
    return sel[fn].apply(sel, arguments);
  }
});

});
_dereq_.register("matthewmueller-grid/lib/type.js", function(exports, _dereq_, module){
/**
 * Module Dependencies
 */

var tokens = _dereq_('./tokens');
var regex = _dereq_('./regexp');
var unique = _dereq_('unique');

/**
 * Export `type`
 */

module.exports = type;

/**
 * Initialize `type`
 */

function type(str) {
  return parse(str);
}

/**
 * Parse the type
 *
 * TODO: consider type('A, C') => cols instead of col
 */

function parse(str) {
  var types = [];
  var toks = tokens(str);

  for (var i = 0, tok; tok = toks[i]; i++) {
    if (regex.block.test(tok)) types.push('block');
    else if (regex.cell.test(tok)) types.push('cell');
    else if (regex.rows.test(tok)) types.push('rows');
    else if (regex.cols.test(tok)) types.push('cols');
    else if (regex.row.test(tok)) types.push('row');
    else if (regex.col.test(tok)) types.push('col');
  }

  switch(unique(types).length) {
    case 0: return null;
    case 1: return types[0];
  }

  // pluralize and test again
  for (var i = 0, type; type = types[i]; i++) {
    if ('col' == type) types[i] = 'cols';
    if ('row' == type) types[i] = 'rows';
  }

  switch(unique(types).length) {
    case 1: return types[0];
    default: return 'mixed';
  }
};

});
_dereq_.register("matthewmueller-grid/lib/utils.js", function(exports, _dereq_, module){
/**
 * Module Dependencies
 */

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

});
_dereq_.register("matthewmueller-grid/lib/match.js", function(exports, _dereq_, module){
/**
 * Module Dependencies
 */

var regexp = _dereq_('./regexp');

/**
 * Export `match`
 */

module.exports = match;

/**
 * Find a match
 *
 * @param {String} str
 * @return {Array} match
 */

function match(str) {
  return str.match(regexp.block)
  || str.match(regexp.rows)
  || str.match(regexp.cols)
  || str.match(regexp.cell)
  || str.match(regexp.row)
  || str.match(regexp.col)
}

});
_dereq_.register("matthewmueller-grid/lib/regexp.js", function(exports, _dereq_, module){
/**
 * Regexs
 */

var block = exports.block = /([A-Za-z]+[0-9]+)\:([A-Za-z]+[0-9]+)/;
var cell = exports.cell = /([A-Za-z]+)([0-9]+)/;
var cols = exports.cols = /([A-Za-z]+)\:([A-Za-z]+)/;
var rows = exports.rows = /([0-9]+)\:([0-9]+)/;
var col = exports.col = /([A-Za-z]+)/;
var row = exports.row = /([0-9]+)/;
var any = exports.any = new RegExp([block, cell, cols, rows, col, row].map(source).join('|'), 'g');

/**
 * Get the source of a regex
 *
 * @param {Regex} regex
 * @return {String} source
 * @api private
 */

function source(regex) {
  return regex.source;
}

});
_dereq_.register("matthewmueller-grid/lib/tokens.js", function(exports, _dereq_, module){
/**
 * Module Dependencies
 */

var tokens = _dereq_('mini-tokenizer');
var regex = _dereq_('./regexp');

/**
 * Export `tokens`
 */

module.exports = tokens(regex.any);

});
_dereq_.register("matthewmueller-grid/lib/expand.js", function(exports, _dereq_, module){
/**
 * Module Dependencies
 */

var unique = _dereq_('unique');
var regexp = _dereq_('./regexp');
var tokens = _dereq_('./tokens');
var type = _dereq_('./type');
var utils = _dereq_('./utils');
var lton = utils.lton;
var ntol = utils.ntol;

/**
 * Export `expand`
 */

module.exports = expand;

/**
 * Expand the selection
 *
 * @param {String|Array} selection
 * @param {Number} maxcol
 * @param {Number} maxrow
 * @return {Array}
 */

function expand(selection, maxcol, maxrow) {
  maxcol = lton(maxcol) + 1;
  var toks = tokens(selection);
  var out = [];

  for (var i = 0, tok; tok = toks[i]; i++) {
    switch (type(tok)) {
      case 'block':
        m = regexp.block.exec(tok);
        out = out.concat(range(m[1], m[2], maxcol, maxrow));
        break;
      case 'row':
        m = regexp.row.exec(tok);
        var n = +m[1];
        var start = 'A' + n;
        var end = ntol(maxcol - 1) + n;
        out = out.concat(range(start, end, maxcol, maxrow));
        break;
      case 'rows':
        m = regexp.rows.exec(tok);
        var start = 'A' + m[1];
        var end = ntol(maxcol - 1) + m[2];
        out = out.concat(range(start, end, maxcol, maxrow));
        break;
      case 'col':
        m = regexp.col.exec(tok);
        var l = m[1];
        var start = l + 1;
        var end = l + maxrow;
        out = out.concat(range(start, end, maxcol, maxrow));
        break;
      case 'cols':
        m = regexp.cols.exec(tok);
        var start = m[1] + '1';
        var end = m[2] + maxrow;
        out = out.concat(range(start, end, maxcol, maxrow));
        break;
      case 'cell':
        out = out.concat(range(tok, tok, maxcol, maxrow));
    }
  }

  return unique(out);
};

/**
 * Expand a selection into it's range
 *
 * @param {String} from
 * @param {String} to
 * @return {Array}
 */

function range(from, to, maxcol, maxrow) {
  var out = [];

  var start = regexp.cell.exec(from);
  if (!start) throw new Error('invalid expansion: ' + from);
  var sc = Math.min(lton(start[1]), maxcol);
  var sr = Math.min(+start[2], maxrow);

  var end = regexp.cell.exec(to);
  if (!end) throw new Error('invalid expansion: ' + to);
  var ec = Math.min(lton(end[1]), maxcol);
  var er = Math.min(+end[2], maxrow);

  for (var i = sr; i <= er; i++) {
    for (var j = sc; j <= ec; j++) {
      out[out.length] = ntol(j) + i;
    }
  }

  return out;
}

});
_dereq_.register("matthewmueller-grid/lib/selection.js", function(exports, _dereq_, module){
/**
 * Module dependencies
 */

var isArray = Array.isArray;
var type = _dereq_('./type');
var match = _dereq_('./match');
var expand = _dereq_('./expand');
var intersect = _dereq_('intersect');

/**
 * Export `Selection`
 */

module.exports = Selection;

/**
 * Initialize `Selection`
 */

function Selection(expr, grid) {
  if (!(this instanceof Selection)) return new Selection(expr, grid);
  this.selection = expand(expr, grid.maxcol, grid.maxrow);
  this.expr = expr;
  this.type = type(expr);
  this.grid = grid;
  this.maxrow = grid.maxrow;
  this.maxcol = grid.maxcol;
}

/**
 * each
 */

Selection.prototype.forEach = function(fn) {
  var grid = this.grid.grid;
  var sel = this.selection;

  for (var i = 0, at; at = sel[i]; i++) {
    var ret = fn(grid[at], at, i);
    if (undefined !== ret) grid[at] = ret;
    if (false === ret) break;
  }

  return this;
};

/**
 * map
 */

Selection.prototype.map = function(fn) {
  var out = [];
  this.forEach(function(v, at, i) {
    out.push(fn(v, at, i));
  })
  return out;
};


/**
 * value
 */

Selection.prototype.value = function(k, v) {
  var grid = this.grid.grid;
  var sel = this.selection;
  var number = 'number' == typeof k;
  var fn = 'function' == typeof v;
  if (number && k < 0) k = sel.length + k;

  if (!arguments.length) {
    return this.map(function(v) { return v; });
  } else if (1 == arguments.length) {
    return number
      ? grid[sel[k]]
      : grid[k]
  } else {
    var at = number ? sel[k] : k;
    var v = fn ? v(grid[at], at, 0) : v;
    grid[at] = v;
  }

  return this;
};


/**
 * Insert
 *
 * @param {Array|String} arr
 * @return {Selection}
 * @api public
 */

Selection.prototype.insert = function(arr) {
  arr = isArray(arr) ? arr : [arr];

  this.forEach(function(v, at, i) {
    return arr[i];
  });

  return this;
};

/**
 * max
 */

Selection.prototype.max = function() {
  var max = 0;
  
  this.forEach(function(v, at) {
    max = !v || max > v ? max : v;
  });

  return max;
};

/**
 * shift
 */

Selection.prototype.shift = function(s) {
  var type = this.type;

  if (/^cols?/.test(type)) {
    return this.shiftcols(s);
  } else if (/^rows?/.test(type)) {
    return this.shiftrows(s);
  }

  return this;
};

/**
 * Shift columns
 */

Selection.prototype.shiftcols = function(s) {
  var expanded = this.expandRight().selection.reverse();
  var grid = this.grid.grid;
  var maxcol = this.maxcol;

  // shift the cells
  for (var i = 0, at; at = expanded[i]; i++) {
    var m = match(at);
    var l = ntol(lton(m[1]) + s);
    if (l > maxcol) continue;
    var shifted = l + m[2];
    grid[shifted] = grid[at];
    delete grid[at];
  }

  return this;
};


/**
 * Shift rows
 */

Selection.prototype.shiftrows = function(s) {
  var expanded = this.expandDown().selection.reverse();
  var grid = this.grid.grid;
  var maxrow = this.maxrow;

  // shift the cells
  for (var i = 0, at; at = expanded[i]; i++) {
    var m = match(at);
    var n = +m[2] + s;
    if (n > maxrow) {
      delete grid[at];
      continue;
    }
    var shifted = m[1] + n;
    grid[shifted] = grid[at];
    delete grid[at];
  }

  return this;
};

/**
 * is
 */

Selection.prototype.is = function() {
  var types = slice.call(arguments);
  var re = new RegExp('^(' + types.join('|') + ')$');
  return re.test(type(this.expr));
};


/**
 * fill
 */

Selection.prototype.fill = function(v) {
  var fn = 'function' == typeof v;

  this.forEach(function(val, at, i) {
    return fn ? v(val, at, i) : v;
  });

  return this;
};

/**
 * rows
 */

Selection.prototype.rows = function() {
  var sel = this.selection;
  var buckets = {};
  var rows = [];
  var number;

  this.forEach(function(v, at) {
    number = match(at)[2];
    if (!buckets[number]) buckets[number] = [];
    buckets[number].push(at);
  });

  return buckets;
};

/**
 * cols
 */

Selection.prototype.cols = function() {
  var sel = this.selection;
  var buckets = {};
  var cols = [];
  var letter;

  this.forEach(function(v, at) {
    letter = match(at)[1];
    if (!buckets[letter]) buckets[letter] = [];
    buckets[letter].push(at);
  })

  return buckets;
};

/**
 * empty
 */

Selection.prototype.empty = function() {
  var grid = this.grid.grid;
  var sel = this.selection;

  for (var i = 0, at; at = sel[i]; i++) {
    if (grid[at]) return false;
  }

  return true;
};


/**
 * toString
 */

Selection.prototype.toString = function() {
  var grid = this.grid.grid;
  var rows = this.rows();
  var cols = this.cols();
  var maxrow = 0;
  var maxlen = 0;
  var out = [];
  var row;
  var obj;
  var r;

  // get the max length
  this.forEach(function(v) {
    if (!v) return;
    v = v.nodeName ? v.nodeName + '.' + v.className : v;
    v = 'object' == typeof v ? JSON.stringify(v) : v.toString();
    maxlen = maxlen > v.length ? maxlen : v.length;
  });

  // get the maxrow length
  for (var k in rows) maxrow = maxrow > +k ? maxrow : +k
  maxrow = (''+maxrow).length;

  // add the column headers
  row = pad('', maxrow) + ' ';
  for (var l in cols) row += pad(l, maxlen);
  row += ' ';
  out.push(row);

  // iterate over the rows
  for (var k in rows) {
    r = rows[k];
    row = pad(k, maxrow) + '|';
    for (var i = 0, at; at = r[i]; i++) {
      obj = grid[at];
      obj = obj.nodeName ? obj.nodeName + '.' + obj.className : obj;
      obj = 'object' == typeof obj ? JSON.stringify(obj) : obj;
      row += pad(obj || '·', maxlen);
    }
    row += '|';
    out.push(row);
  }

  return out.join('\n');

  // padding function
  function pad(n, max, str) {
    str = str || ' '
    var len = max - (''+n).length;
    var padding = new Array(len + 1).join(str);
    return str + padding + n + str;
  }
};

/**
 * Expand Right
 */

Selection.prototype.expandRight = function() {
  var sel = this.selection;
  var last = this.maxcol;
  var sels = [];

  this.forEach(function(v, at) {
    sels.push(at + ':' + last + match(at)[2]);
  });

  return new Selection(sels.join(','), this.grid);
};


// Selection.prototype.expandRight = function(i) {
//   i = i || lton(this.maxcol);
//   var sel = this.selection;
//   var last = this.maxcol;
//   var sels = [];

//   this.forEach(function(v, at) {
//     var m = match(at);
//     var l = ntol(i + lton(m[1]));
//     sels.push(at + ':' + l + m[2]);
//   });

//   return new Selection(sels.join(','), this.grid);
// };


/**
 * Expand Down
 */

Selection.prototype.expandDown = function() {
  var sel = this.selection;
  var last = this.maxrow;
  var sels = [];

  this.forEach(function(v, at) {
    sels.push(at + ':' + match(at)[1] + last);
  });

  return new Selection(sels.join(','), this.grid);
};

/**
 * json
 */

Selection.prototype.json = function() {
  var obj = {};
  
  this.forEach(function(v, at) {
    obj[at] = v;
  });

  return obj;
};

/**
 * find
 */

Selection.prototype.find = function(expr) {
  var filtered = Selection(expr, this).selection;
  var sel = intersect(this.selection, filtered);
  var selection = new Selection(sel.join(','), this.grid);
  selection.type = type(expr);
  selection.expr = expr;
  return selection;
};



/**
 * Delegate back to grid
 */

['select', 'all', 'at'].forEach(function(fn) {
  Selection.prototype[fn] = function() {
    return this.grid[fn].apply(this.grid, arguments);
  }
});


});
_dereq_.register("component-ie/index.js", function(exports, _dereq_, module){
/**
 * Export `ie`.
 */

module.exports = ie();

/**
 * Initialize `ie`
 *
 * @return {Number|undefined}
 * @api public
 */

function ie() {
  for( var v = 3,
           el = document.createElement('b'),
           // empty array as loop breaker (and exception-avoider) for non-IE and IE10+
           all = el.all || [];
       // i tag not well-formed since we know that IE5-IE9 won't mind
       el.innerHTML = '<!--[if gt IE ' + (++v) + ']><i><![endif]-->',
       all[0];
     );
  // return the documentMode for IE10+ compatibility
  // non-IE will get undefined
  return v > 4 ? v : document.documentMode;
}

});
_dereq_.register("component-tap/index.js", function(exports, _dereq_, module){
/**
 * Module Dependencies
 */

var event = _dereq_('event'),
    bind = _dereq_('bind');

/**
 * Expose `Tap`
 */

module.exports = Tap;

/**
 * Touch support
 */

var support = 'ontouchstart' in window;

/**
 * Tap on `el` to trigger a `fn`
 *
 * Tap will not fire if you move your finger
 * to scroll
 *
 * @param {Element} el
 * @param {Function} fn
 */

function Tap(el, fn) {
  if(!(this instanceof Tap)) return new Tap(el, fn);
  this.el = el;
  this.fn = fn || function() {};
  this.tap = true;

  if (support) {
    this.ontouchmove = bind(this, this.touchmove);
    this.ontouchend = bind(this, this.touchend);
    event.bind(el, 'touchmove', this.ontouchmove);
    event.bind(el, 'touchend', this.ontouchend);
  } else {
    event.bind(el, 'click', this.fn);
  }
}

/**
 * Touch end
 *
 * @param {Event} e
 * @return {Tap}
 * @api private
 */

Tap.prototype.touchend = function(e) {
  if (this.tap) this.fn(e);
  this.tap = true;
  event.bind(this.el, 'touchmove', this.ontouchmove);
  return this;
};

/**
 * Touch move
 *
 * @return {Tap}
 * @api private
 */

Tap.prototype.touchmove = function() {
  this.tap = false;
  event.unbind(this.el, 'touchmove', this.ontouchmove);
  return this;
};

/**
 * Unbind the tap
 *
 * @return {Tap}
 * @api public
 */

Tap.prototype.unbind = function() {
  event.unbind(this.el, 'touchend', this.ontouchend);
  event.unbind(this.el, 'click', this.fn);
  return this;
};

});
_dereq_.register("spreadsheet/index.js", function(exports, _dereq_, module){
/**
 * Module Dependencies
 */

var Workbook = _dereq_('./lib/workbook');

/**
 * Expose `spreadsheet`
 */

exports = module.exports = spreadsheet;

/**
 * Expose the `workbook`
 */

exports.workbook = Workbook;

/**
 * Default workbook
 */

var workbook = new Workbook;

/**
 * Initialize `spreadsheet`
 *
 * @param {Number} cols
 * @param {Number} rows
 * @return {Spreadsheet}
 * @api public
 */

function spreadsheet(cols, rows) {
  return workbook.spreadsheet(cols, rows);
}

});
_dereq_.register("spreadsheet/template.js", function(exports, _dereq_, module){
/**
 * Module Dependencies
 */

var jade = _dereq_('jade');

/**
 * Expose template
 */

module.exports = template;

/**
 * Create the template
 *
 * @param {Object} locals
 * @return {Function}
 * @api public
 */

function template(locals) {
    var buf = [];
    var jade_mixins = {};
    var locals_ = locals || {}, headers = locals_.headers, undefined = locals_.undefined, layers = locals_.layers, rows = locals_.rows, cols = locals_.cols;
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var heads = headers == undefined ? true : headers;
    var l = layers || 3;
    var r = rows || 10;
    var c = cols || 10;
    jade_mixins["filler"] = function(n) {
        var block = this && this.block, attributes = this && this.attributes || {};
        for (var i = 0; i < n; i++) {
            buf.push('<th class="filler"></th>');
        }
    };
    jade_mixins["rowhead"] = function(value) {
        var block = this && this.block, attributes = this && this.attributes || {};
        buf.push("<th>" + jade.escape(null == (jade.interp = value) ? "" : jade.interp) + "</th>");
    };
    jade_mixins["th"] = function(n) {
        var block = this && this.block, attributes = this && this.attributes || {};
        for (var i = 0; i < n; i++) {
            buf.push("<th" + jade.attr("name", letters[i], true, false) + "><div>" + jade.escape(null == (jade.interp = letters[i]) ? "" : jade.interp) + "</div></th>");
        }
    };
    jade_mixins["layerhead"] = function(n) {
        var block = this && this.block, attributes = this && this.attributes || {};
        for (var i = 0; i < n; i++) {
            buf.push('<th class="layerhead"></th>');
        }
    };
    jade_mixins["collayer"] = function(n) {
        var block = this && this.block, attributes = this && this.attributes || {};
        for (var i = 0; i < n; i++) {
            buf.push("<th" + jade.attr("name", letters[i], true, false) + ' class="layer"><div></div></th>');
        }
    };
    jade_mixins["rowlayer"] = function(n) {
        var block = this && this.block, attributes = this && this.attributes || {};
        for (var i = 0; i < n; i++) {
            buf.push('<th class="layer"><div></div></th>');
        }
    };
    jade_mixins["td"] = function(n) {
        var block = this && this.block, attributes = this && this.attributes || {};
        for (var i = 0; i < n; i++) {
            buf.push('<td><input type="text" disabled="disabled"/></td>');
        }
    };
    buf.push('<div class="spreadsheet"><table><thead>');
    if (heads) {
        buf.push('<tr class="colhead"><th class="rowhead"></th>');
        jade_mixins["layerhead"](l);
        jade_mixins["th"](c);
        buf.push("</tr>");
    }
    for (var i = 0; i < l; i++) {
        buf.push('<tr class="layer">');
        jade_mixins["filler"](l + (heads ? 1 : 0));
        jade_mixins["collayer"](c);
        buf.push("</tr>");
    }
    buf.push("</thead><tbody>");
    for (var i = 1; i <= r; i++) {
        buf.push("<tr" + jade.attr("name", i, true, false) + ">");
        if (heads) {
            buf.push('<th class="rowhead"><div>' + jade.escape(null == (jade.interp = i) ? "" : jade.interp) + "</div></th>");
        }
        jade_mixins["rowlayer"](l);
        jade_mixins["td"](c);
        buf.push("</tr>");
    }
    buf.push("</tbody></table></div>");
    return buf.join("");
}

});
_dereq_.register("spreadsheet/lib/workbook.js", function(exports, _dereq_, module){
/**
 * Module dependencies
 */

var Spreadsheet = _dereq_('./spreadsheet');
var shortcuts = _dereq_('shortcuts');
var delegate = _dereq_('delegates');
var events = _dereq_('events');

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
  this.shortcuts.bind('`', 'onbacktick');
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
  .method('onbacktick');

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

  this.active && this.active != active && this.active.deactivate();
  this.active = active;
  return this;
};


/**
 * add a spreadsheet to the workbook
 */

Workbook.prototype.spreadsheet = function(cols, rows) {
  var spreadsheet = new Spreadsheet(cols, rows, this);
  this.spreadsheets.push(spreadsheet);
  return spreadsheet;
};

});
_dereq_.register("spreadsheet/lib/spreadsheet.js", function(exports, _dereq_, module){
/**
 * Module Dependencies
 */

var classes = _dereq_('classes');
var event = _dereq_('event');
var events = _dereq_('events');
var closest = _dereq_('closest');
var delegate = _dereq_('delegates');
var isArray = _dereq_('isArray');
var Emitter = _dereq_('emitter');
var domify = _dereq_('domify');
var shortcuts = _dereq_('shortcuts');
var Selection = _dereq_('./selection');
var Cell = _dereq_('./cell');
var utils = _dereq_('./utils');
var match = _dereq_('./match');
var lton = utils.lton;
var ntol = utils.ntol;
var smallest = utils.smallest;
var largest = utils.largest;
var subtract = utils.subtract;
var k = _dereq_('k')(document);
var collapsible = _dereq_('./collapsible');
var Outline = _dereq_('./outline');
var tap = _dereq_('tap');

/**
 * Spreadsheet element
 */

var tpl = _dereq_('../template');

/**
 * Export `Spreadsheet`
 */

module.exports = Spreadsheet;

/**
 * Initialize `Spreadsheet`
 *
 * @param {Number} numcols
 * @param {Number} numrows (optional)
 */

function Spreadsheet(numcols, numrows, workbook) {
  if (!(this instanceof Spreadsheet)) return new Spreadsheet(numcols, numrows, workbook);

  // parse string
  if (!numrows && 'string' == typeof numcols) {
    var m = match(numcols);
    this.numcols = numcols = lton(m[1]) + 1;
    this.numrows = numrows = +m[2]
  } else {
    this.numcols = numcols = numcols || 10;
    this.numrows = numrows = numrows || 10;
  }

  this.el = domify(tpl({ cols: numcols, rows: numrows }));
  this.thead = this.el.getElementsByTagName('thead')[0];
  this.tbody = this.el.getElementsByTagName('tbody')[0];
  this.classes = classes(this.el);

  this.largest = ntol(numcols) + numrows;

  this.workbook = workbook;
  this.spreadsheet = {};
  this.merged = {};
  this.cells = [];

  // active cell
  this.active = false;

  // bind events
  this.events = events(this.el, this);

  // initialize the outline
  this.outline = Outline(this.el);

  // initialize collapsible
  this.collapsible = collapsible(this);

  this.draw();
}

/**
 * Mixin the `Emitter`
 */

Emitter(Spreadsheet.prototype);

/**
 * Delegate to the active cell
 */

delegate(Spreadsheet.prototype, 'active')
  .method('onkeydown')
  .method('onesc')
  .method('onf2');

/**
 * Create a selection
 *
 * @param {String} selection
 * @return {Spreadsheet}
 * @api public
 */

Spreadsheet.prototype.select = function(selection) {
  return new Selection(selection, this);
};

/**
 * Render the spreadsheet
 */

Spreadsheet.prototype.draw = function() {
  var spreadsheet = this.spreadsheet;
  var tds = this.el.querySelectorAll('td');
  var rows = this.numrows;
  var cols = this.numcols;
  var at = 'A1';
  var x = 0;

  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++, x++) {
      at = ntol(j) + (i+1);
      spreadsheet[at] = spreadsheet[at] || new Cell(tds[x], at, this);
    }
  }
}

/**
 * Reset
 */

Spreadsheet.prototype.deactivate = function(e) {
  this.active && this.active.deactivate();
}

/**
 * Get the cell reference
 *
 * @param {String} at
 * @return {Cell|null}
 * @api private
 */

Spreadsheet.prototype.at = function(at) {
  at = at.toUpperCase();
  return this.spreadsheet[at] || null;
};

/**
 * Merge cells
 *
 * @param {Array} cells
 * @return {Spreadsheet}
 * @api public
 */

Spreadsheet.prototype.merge = function(cells) {
  var spreadsheet = this.spreadsheet;
  var merged = this.merged;
  var captain = smallest(cells);
  var at = captain.at;
  var hidden = 0;
  var el, tr;
  merged[at] = [];

  // remove the remaining cells
  for (var i = 0, cell; cell = cells[i]; i++) {
    if (captain == cell) continue;
    el = cell.el;
    if (classes(el).has('hidden')) hidden++;
    tr = el.parentNode;
    if (tr) tr.removeChild(el);
    spreadsheet[cell.at] = captain;
    merged[at].push(cell.at);
  }

  // add the col and rowspan
  var biggest = largest(cells);
  var diff = subtract(biggest.at, captain.at);
  captain.attr('rowspan', diff.row - hidden + 1);
  captain.attr('colspan', diff.col - hidden + 1);

  return this;
}

/**
 * Move to another cell
 *
 * @param {Event} e
 * @param {String} dir
 */

Spreadsheet.prototype.move = function(dir) {
  var self = this;
  var active = this.active;

  if (!active) return this;

  this.traverse(dir, function(cell) {
    if (!cell.classes.has('hidden') && !active.classes.has('focused')) {
      cell.activate();

      // blur old active
      active.deactivate();
      self.active = cell;

      // emitters
      self.emit('move', dir, cell);
      self.emit('move ' + dir, cell);

      return false;
    }
  });
};

/**
 * Arrow key event listeners
 *
 * @param {Event} e
 * @return {Spreadsheet}
 */

['left', 'right', 'up', 'down'].forEach(function(m) {
  Spreadsheet.prototype['on' + m] = function(e) {
    var active = this.active;

    if (active && !active.classes.has('focused')) {
      e.preventDefault();

      // reset headings
      active.reset();
      this.classes.remove('headings');
    }

    e.stopPropagation();
    this.move(m);

    return this;
  }
});

/**
 * onbacktick
 */

Spreadsheet.prototype.onbacktick = function(e) {
  e.preventDefault();
  e.stopPropagation();
  this.classes.toggle('headings');
  return this;
};

/**
 * addClass
 */

Spreadsheet.prototype.addClass = function(cls) {
  this.classes.add(cls);
  return this;
};


/**
 * Traverse
 *
 * @param {String} dir
 * @param {Function} fn
 * @return {Spreadsheet}
 * @api public
 */

Spreadsheet.prototype.traverse = function(cell, dir, fn) {
  if (arguments.length < 3) {
    if (!this.active) return this;
    fn = dir;
    dir = cell;
    cell = this.active;
  }

  var m = match(cell.at);
  var col = m[1];
  var row = m[2];
  var at;

  while (cell) {
    switch (dir) {
      case 'left':
      case 'l':
        col = ntol(lton(col) - 1);
        break;
      case 'right':
      case 'r':
        col = ntol(lton(col) + 1);
        break;
      case 'up':
      case 'top':
      case 'u':
      case 't':
        row--;
        break;
      case 'down':
      case 'bottom':
      case 'd':
      case 'b':
        row++;
        break;
    }

    at = col + row;
    cell = this.at(at);

    // if we found the next cell, break
    if (cell && at == cell.at && false == fn(cell)) break;
  }

  return this;
};

});
_dereq_.register("spreadsheet/lib/selection.js", function(exports, _dereq_, module){
/**
 * Module dependencies
 */

var slice = [].slice;
var isArray = _dereq_('isArray');
var Cell = _dereq_('./cell');
var type = _dereq_('./type');
var expand = _dereq_('./expand');
var utils = _dereq_('./utils');
var match = _dereq_('./match');
var regex = _dereq_('./regex');
var shift = utils.shift;
var lton = utils.lton;
var ntol = utils.ntol;
var largest = utils.largest;
var rows = utils.rows;
var cols = utils.cols;
var rowrange = utils.rowrange;
var colrange = utils.colrange;
var classes = _dereq_('classes');
var tokenizer = _dereq_('mini-tokenizer');

/**
 * Token compiler
 */

var rtokens = /\{([A-Za-z0-9]+)\}/g
var tokens = tokenizer(rtokens, '$1');

/**
 * Export `Selection`
 */

module.exports = Selection;

/**
 * Initialize `Selection`
 *
 * @param {String} expr
 * @param {Table} spreadsheet
 * @return {Selection}
 * @api private
 */

function Selection(expr, spreadsheet) {
  if (!(this instanceof Selection)) return new Selection(selection, spreadsheet);
  this.selection = expand(expr, spreadsheet.largest);
  this.spreadsheet = spreadsheet;
  // type() is not reliable for different types (ex. "A, 1")
  this.type = type(expr);
  this.expr = expr;
}

/**
 * Get the cells of the selection
 *
 * @return {Array}
 * @api public
 */

Selection.prototype.cells = function() {
  var cells = [];
  this.each(function(cell) { cells.push(cell); });
  return cells;
};

/**
 * Add width to a column
 *
 * @param {Number|String} w
 * @return {Selection}
 * @api public
 */

Selection.prototype.width = function(w) {
  if (!/cols?/.test(this.type)) return this;
  w += 'number' == typeof w ? 'px' : '';
  var thead = this.spreadsheet.thead;
  var colhead = thead.querySelector('.colhead');
  var columns = cols(this.selection);
  var el;

  for (var col in columns) {
    el = colhead.querySelector('th[name=' + col + ']');
    if (el) el.style.width = w;
  }

  return this;
};

/**
 * Add height to a row
 *
 * @param {Number|String} h
 * @return {Selection}
 * @api public
 */

Selection.prototype.height = function(h) {
  if (!/rows?/.test(this.type)) return this;
  h += 'number' == typeof h ? 'px' : '';
  var tbody = this.spreadsheet.tbody;
  var rs = rows(this.selection);
  var el;

  for (var row in rs) {
    var el = tbody.querySelector('tr[name="' + row + '"]');
    if (el) el.style.height = h;
  }

  return this;
};

/**
 * Insert some data into the spreadsheets
 *
 * @param {Mixed} val
 * @return {Selection}
 * @api public
 */

Selection.prototype.insert = function(val) {
  val = isArray(val) ? val : [val];
  var spreadsheet = this.spreadsheet;
  var sel = this.selection;

  this.each(function(cell, i) {
    // end the loop early if we're done
    if (undefined == val[i]) return false;
    cell.update(val[i]);
  })

  return this;
};

/**
 * Make the selection editable
 *
 * @param {String} expr
 * @return {Selection}
 * @api public
 */

Selection.prototype.calc = function(expr) {
  var toks = tokens(expr);

  this.each(function(cell) {
    var e = expr;
    for (var j = 0, tok; tok = toks[j]; j++) {
      var shifted = shift(cell.at, tok);
      e = e.replace(tok, shifted);
    }

    cell.update('= ' + e);
  });

  return this;
}

/**
 * Loop through the selection, calling
 * `action` on each present cell in the
 * selection
 *
 * @param {String|Function} action
 * @return {Selection}
 */

Selection.prototype.each = function(action) {
  var spreadsheet = this.spreadsheet;
  var args = slice.call(arguments, 1);
  var isfn = 'function' == typeof action;
  var sel = this.selection;
  var cell;
  var ret;

  for (var i = 0, j = 0, at; at = sel[i]; i++) {
    cell = spreadsheet.at(at);

    // ignore merged cells
    if (!cell || cell.at != at) continue;

    // use fn or delegate to cell
    ret = isfn ? action(cell, j++) : cell[action].apply(cell, args);

    // break if false
    if (false === ret) break;
  }

  return this;
};

/**
 * merge
 */

Selection.prototype.merge = function() {
  var cells = this.cells();
  this.spreadsheet.merge(cells);
  return this;
};

/**
 * Merge the rows together
 *
 * @return {Selection}
 * @api public
 */

Selection.prototype.mergeRows = function() {
  var cells = this.cells();
  var cs = cols(cells);

  for (var col in cs) {
    this.spreadsheet.merge(cs[col]);
  }

  return this;
};

/**
 * Merge the cols together
 *
 * @return {Selection}
 * @api public
 */

Selection.prototype.mergeCols = function() {
  var cells = this.cells();
  var rs = rows(cells);

  for (var row in rs) {
    this.spreadsheet.merge(rs[row]);
  }

  return this;
};

/**
 * Chain
 *
 * @param {String} sel
 * @return {Selection} new
 */

Selection.prototype.select = function(sel) {
  return new Selection(sel, this.spreadsheet);
};

/**
 * show
 */

Selection.prototype.show = function() {
  var thead = this.spreadsheet.thead;
  var tbody = this.spreadsheet.tbody;
  var type = this.type;
  var m = match(this.expr);
  var els = [];

  if (/rows?/.test(type)) {
    var range = rowrange(m[1], m[2]);
    var els = selectrows(range);
  } else if (/cols?/.test(type)) {
    var range = colrange(m[1], m[2]);
    var els = selectcols(range);
  } else {
    return this;
  }

  for (var i = 0, el; el = els.item(i); i++) {
    classes(el).remove('hidden');
  }

  return this.each('show');

  function selectrows(range) {
    var q = range.map(function(n) {
      return 'tr[name="' + n + '"]';
    }).join(', ');

    return tbody.querySelectorAll(q);
  }

  function selectcols(range) {
    var q = range.map(function(n) {
      return 'th[name="' + n + '"]';
    }).join(', ');
    return thead.querySelectorAll(q);
  }  
};

/**
 * Hide the selection
 */

Selection.prototype.hide = function(cls) {
  cls = cls || 'hidden';

  var thead = this.spreadsheet.thead;
  var tbody = this.spreadsheet.tbody;
  var type = this.type;
  var m = match(this.expr);
  var els = [];


  if (/rows?/.test(type)) {
    var range = rowrange(m[1], m[2]);
    var els = selectrows(range);
  } else if (/cols?/.test(type)) {
    var range = colrange(m[1], m[2]);
    var els = selectcols(range);
  } else {
    return this;
  }

  for (var i = 0, el; el = els.item(i); i++) {
    classes(el).add(cls);
  }

  return this.each('hide');

  function selectrows(range) {
    var q = range.map(function(n) {
      return 'tr[name="' + n + '"]';
    }).join(', ');

    return tbody.querySelectorAll(q);
  }

  function selectcols(range) {
    var q = range.map(function(n) {
      return 'th[name="' + n + '"]';
    }).join(', ');
    return thead.querySelectorAll(q);
  }
};



/**
 * collapsible
 */

Selection.prototype.collapsible = function(collapsed) {
  collapsed = undefined == collapsed ? true : false;
  this.spreadsheet.collapsible.range(this.expr, collapsed);
  return this;
};


/**
 * Delegate each cell in the selection to Cell
 */

[
  'editable',
  'format',
  'addClass',
  'attr',
  'focus',
  'activate'
].forEach(function(m) {
  Selection.prototype[m] = function() {
    var args = slice.call(arguments);
    return this.each.apply(this, [m].concat(args));
  };
});

});
_dereq_.register("spreadsheet/lib/cell.js", function(exports, _dereq_, module){
/**
 * Module dependencies
 */

var numeral = _dereq_('numeral');
var event = _dereq_('event');
var events = _dereq_('events');
var Emitter = _dereq_('emitter');
var domify = _dereq_('domify');
var classes = _dereq_('classes');
var modifier = _dereq_('modifier');
var props = _dereq_('props');
var type = _dereq_('./type');
var formatter = _dereq_('./format');
var shortcuts = _dereq_('shortcuts');
var tokenizer = _dereq_('mini-tokenizer');
var throttle = _dereq_('per-frame');
var tap = _dereq_('tap');
var ie = _dereq_('ie');

/**
 * Regexs
 */

var rexpr = /\s*=/;

/**
 * Touch
 */

var touch = 'ontouchstart' in window;

/**
 * iFrame
 */

var iframe = parent != window;

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
  this.outline = spreadsheet.outline;
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
  //
  // insane iOS bug if we're in an iframe
  // in a webview and define a touch event
  // input stops accepting keyboard input.
  if (iframe) {
    this.tap = events(this.el, this);
    this.tap.bind('click', 'onclick');
  } else {
    this.tap = tap(this.el, this.onclick.bind(this));
  }

}

/**
 * Get or set the value of the cell
 */

Cell.prototype.val = function(val, opts) {
  if (!arguments.length) return this.compute(this.value);
  recomputing = {};
  this.update(val);
};

/**
 * update the cell
 */

Cell.prototype.update = function(val, opts) {
  if (undefined == val) return this.compute(this.value, opts);
  opts = opts || {};
  opts.compute = undefined == opts.compute ? true : opts.compute;

  var prevComputed = this.input.value;
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
    if (!opts.silent) {
      spreadsheet.emit('change ' + at, computed, prevComputed, this);
    }
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
  var formatting = this.formatting;

  if (rexpr.test(value)) {
    this.expr = (this.expr && this.value == value) ? this.expr : this.compile(value);
  } else {
    this.expr = false;
  }

  value = this.expr ? this.expr() : value;

  // apply formatting
  if (format && formatting && isNumber(value)) {
    value = formatter[formatting]
      ? formatter[formatting](value)
      : numeral(value).format(formatting)
  }

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
      val = spreadsheet.at(toks[i]).update(null, { format: false });
      _[toks[i]] = +val;
    }

    val = expr(_);

    return 'number' != typeof val || !isNaN(val)
      ? val
      : 0
  };
};

/**
 * Set the formatting
 *
 * @param {String} format
 * @return {Cell}
 * @api public
 */

Cell.prototype.format = function(format) {
  if('%' == format) this.formatting = '(0.0)%';
  else if ('$' == format) this.formatting = '($0,0)';
  else if ('$$' == format) this.formatting = '($0,0.00)';
  else if ('#' == format) this.formatting = '(0,0)';
  else if ('##' == format) this.formatting = '(0,0.00)';
  else this.formatting = format;
  this.update(this.value);
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
  var blur = ie ? 'focusout' : 'blur';

  this.classes.add('editable');

  event.bind(input, 'input', function(e) {
    if (rexpr.test(input.value)) return;
    recomputing = {};
    var val = percentage(input.value);
    self.update(val, { compute: false });
  });

  event.bind(input, 'focus', function(e) {
    input.value = self.value;
  });

  event.bind(input, blur, function(e) {
    // TODO: temporary fix for blur firing twice, i think...
    e.stopImmediatePropagation();
    if ('' == input.value) return;
    var val = percentage(input.value);
    self.update(val);
  });

  function percentage(val) {
    return '(0.0)%' == self.formatting && val >= 1
      ? val / 100
      : val;
  }

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
  } else {
    this.reveal();
  }

  return this;
};

/**
 * Reveal formula
 */

Cell.prototype.reveal = function() {
  if ('=' != this.value[0]) return this;
  var classes = this.spreadsheet.classes;
  var input = this.input;
  var value = this.value;

  if (classes.has('headings')) {
    this.reset();
    classes.remove('headings');
  } else {
    setTimeout(swap, 0)
    classes.add('headings');
  }

  function swap() {
    input.value = value.replace(/[\{\}]/g, '');
  }

  return this;
}

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
  var spreadsheet = this.spreadsheet;
  var active = spreadsheet.active;

  // remove any old classes, if we're not
  // clicking on the currently active cell
  active && active != this && active.deactivate();
  spreadsheet.active = this;

  this.activate();

  return this;
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
  this.update(this.value, { silent: true, compute: !editable });
  return this;
};

/**
 * highlight
 */

Cell.prototype.activate = function() {
  var spreadsheet = this.spreadsheet;
  var workbook = spreadsheet.workbook;

  // hack to ensure spreadsheet is active
  workbook.active = workbook.active || spreadsheet;
  spreadsheet.active = spreadsheet.active || this;

  var highlighted = this.classes.has('highlighted');
  var editable = this.classes.has('editable');
  var outline = this.outline;
  var input = this.input;

  // add the outline
  var lining = outline.show(this.el);

  if (editable) {
    classes(lining).add('editable');
    !touch && input.removeAttribute('disabled');
  } else {
    classes(lining).remove('editable');
    this.classes.remove('headings');
  }

  // if we're already highlighted, focus
  if (highlighted || touch) {
    if (editable) {
      this.classes.add('focused');
      touch && input.removeAttribute('disabled');
      input.focus();
    } else {
      this.reveal();
    }
  }

  // add highlighted
  this.classes.add('highlighted');

  return this;
};

/**
 * deactivate
 */

Cell.prototype.deactivate = function() {
  this.reset();
  this.blur();
  this.classes.remove('highlighted');
  this.input.setAttribute('disabled', true);
  return this;
};

/**
 * blur
 */

Cell.prototype.blur = function() {
  this.classes.remove('focused').remove('editing')
  this.spreadsheet.classes.remove('headings');
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
      self.update(self.value);
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
  if (!cell instanceof Cell) return this.update(cell);
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

});
_dereq_.register("spreadsheet/lib/utils.js", function(exports, _dereq_, module){
/**
 * Module Dependencies
 */

var type = _dereq_('./type');
var match = _dereq_('./match');
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

});
_dereq_.register("spreadsheet/lib/type.js", function(exports, _dereq_, module){
/**
 * Module Dependencies
 */

var regex = _dereq_('./regex');

/**
 * Export `type`
 */

module.exports = type;

/**
 * Initialize `type`
 */

function type(str) {
  return parse(str);
}

/**
 * Parse the type
 */

function parse(str) {
  if (regex.block.test(str)) return 'block';
  if (regex.cell.test(str)) return 'cell';
  if (regex.rows.test(str)) return 'rows';
  if (regex.cols.test(str)) return 'cols';
  if (regex.row.test(str)) return 'row';
  if (regex.col.test(str)) return 'col';
};

});
_dereq_.register("spreadsheet/lib/tokens.js", function(exports, _dereq_, module){
/**
 * Module Dependencies
 */

var regex = _dereq_('./regex');

/**
 * Export `tokens`
 */

module.exports = tokens;

/**
 * Initialize `tokens`
 */

function tokens(expr) {
  var toks = [];
  expr.replace(regex.any, function(m) {
    toks.push(m);
  });
  return toks;
}

});
_dereq_.register("spreadsheet/lib/regex.js", function(exports, _dereq_, module){
/**
 * Regexs
 */

var block = exports.block = /([A-Za-z]+[0-9]+)\:([A-Za-z]+[0-9]+)/;
var cell = exports.cell = /([A-Za-z]+)([0-9]+)/;
var cols = exports.cols = /([A-Za-z]+)\:([A-Za-z]+)/;
var rows = exports.rows = /([0-9]+)\:([0-9]+)/;
var col = exports.col = /([A-Za-z]+)/;
var row = exports.row = /([0-9]+)/;
var any = exports.any = new RegExp([block, cell, cols, rows, col, row].map(source).join('|'), 'g');

/**
 * Get the source of a regex
 *
 * @param {Regex} regex
 * @return {String} source
 * @api private
 */

function source(regex) {
  return regex.source;
}

});
_dereq_.register("spreadsheet/lib/expand.js", function(exports, _dereq_, module){
/**
 * Module Dependencies
 */

var tokens = _dereq_('./tokens');
var type = _dereq_('./type');
var utils = _dereq_('./utils');
var lton = utils.lton;
var ntol = utils.ntol;

/**
 * Regexs
 */

var regex = _dereq_('./regex');
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
  var lc = m[1];
  var lr = m[2];
  var maxcol = lton(m[1]);
  var maxrow = +m[2]
  var out = [];

  for (var i = 0, tok; tok = toks[i]; i++) {
    switch (type(tok)) {
      case 'block':
        m = rblock.exec(tok);
        out = out.concat(range(m[1], m[2], maxcol, maxrow));
        break;
      case 'row':
        m = rrow.exec(tok);
        var n = +m[1];
        var start = 'A' + n;
        var end = lc + n;
        out = out.concat(range(start, end, maxcol, maxrow));
        break;
      case 'rows':
        m = rrows.exec(tok);
        var start = 'A' + m[1];
        var end = lc + m[2];
        out = out.concat(range(start, end, maxcol, maxrow));
        break;
      case 'col':
        m = rcol.exec(tok);
        var l = m[1];
        var start = l + 1;
        var end = l + lr;
        out = out.concat(range(start, end, maxcol, maxrow));
        break;
      case 'cols':
        m = rcols.exec(tok);
        var start = m[1] + '1';
        var end = m[2] + lr;
        out = out.concat(range(start, end, maxcol, maxrow));
        break;
      case 'cell':
        out = out.concat(range(tok, tok, maxcol, maxrow));
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

function range(from, to, maxcol, maxrow) {
  var out = [];

  var start = rcell.exec(from);
  if (!start) return this.error('invalid expansion: ' + from);
  var sc = Math.min(lton(start[1]), maxcol);
  var sr = Math.min(+start[2], maxrow);

  var end = rcell.exec(to);
  if (!end) return this.error('invalid expansion: ' + to);
  var ec = Math.min(lton(end[1]), maxcol);
  var er = Math.min(+end[2], maxrow);

  for (var i = sr; i <= er; i++) {
    for (var j = sc; j <= ec; j++) {
      out[out.length] = ntol(j) + i;
    }
  }

  return out;
}

});
_dereq_.register("spreadsheet/lib/match.js", function(exports, _dereq_, module){
/**
 * Module Dependencies
 */

var regex = _dereq_('./regex');

/**
 * Export `match`
 */

module.exports = match;

/**
 * Find a match
 *
 * @param {String} str
 * @return {Array} match
 */

function match(str) {
  return str.match(regex.block)
  || str.match(regex.rows)
  || str.match(regex.cols)
  || str.match(regex.cell)
  || str.match(regex.row)
  || str.match(regex.col)
}

});
_dereq_.register("spreadsheet/lib/outline.js", function(exports, _dereq_, module){
/**
 * Module dependencies
 */

var round = Math.round;
var body = document.body;
var event = _dereq_('event');
var events = _dereq_('events');
var raf = _dereq_('per-frame');
var domify = _dereq_('domify');
var closest = _dereq_('closest');
var classes = _dereq_('classes');
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

});
_dereq_.register("spreadsheet/lib/collapsible.js", function(exports, _dereq_, module){
/**
 * Module dependencies
 */

var slice = [].slice;
var domify = _dereq_('domify');
var closest = _dereq_('closest');
var type = _dereq_('./type');
var utils = _dereq_('./utils');
var events = _dereq_('events');
var event = _dereq_('event');
var match = _dereq_('./match');
var classes = _dereq_('classes');
var tokens = _dereq_('./tokens');
var utils = _dereq_('./utils');
var Emitter = _dereq_('emitter');
var lton = utils.lton;
var ntol = utils.ntol;
var rowrange = utils.rowrange;
var colrange = utils.colrange;
var Grid = _dereq_('grid');

/**
 * Export `Collapsible`
 */

module.exports = Collapsible;

/**
 * Initialize `Collapsible`
 */

function Collapsible(spreadsheet) {
  if (!(this instanceof Collapsible)) return new Collapsible(spreadsheet);

  this.spreadsheet = spreadsheet;
  this.thead = spreadsheet.thead;
  this.tbody = spreadsheet.tbody;

  this.rg = this.rowgrid();
  this.cg = this.colgrid();
}

/**
 * rowgrid
 */

Collapsible.prototype.rowgrid = function() {
  var width = this.thead.querySelectorAll('th.layerhead').length;
  var height = this.tbody.querySelectorAll('th.layer').length / width;
  var ths = slice.call(this.tbody.querySelectorAll('th.layer'));
  var grid = new Grid(width, height);
  grid.insert(ths);
  return grid;

};

/**
 * colgrid
 */

Collapsible.prototype.colgrid = function() {
  var height = this.thead.querySelectorAll('tr.layer').length;
  var width = this.thead.querySelectorAll('th.layer').length / height;
  var ths = slice.call(this.thead.querySelectorAll('th.layer'));
  var grid = new Grid(width, height);
  grid.insert(ths);
  return grid;
};

/**
 * Add a range
 */

Collapsible.prototype.range = function(expr, collapsed) {
  var t = type(expr);
  if ('rows' == t) return this.rowrange(expr, collapsed);
  if ('cols' == t) return this.colrange(expr, collapsed);
  return this;
};

/**
 * rowrange
 *
 * @param {String} expr
 */

Collapsible.prototype.rowrange = function(expr, collapsed) {
  var grid = this.rg.select(expr);
  var cols = grid.cols();

  for (var l in cols) {
    var col = grid.find(l);
    if (empty(col)) {
      var m = match(expr);
      var e = l + m[1] + ':' + l + m[2];
      var connector = Connector(grid.find(e), 'row', this.spreadsheet);
      if (collapsed) connector.hide();
      break;
    }
  }

  function empty(col) {
    var empty = true;
    col.forEach(function(th) {
      if (classes(th).has('collapsible')) empty = false;
    })
    return empty;
  }
};

/**
 * colrange
 *
 * @param {String} expr
 */

Collapsible.prototype.colrange = function(expr, collapsed) {
  var grid = this.cg.select(expr);
  var rows = grid.rows();

  for (var n in rows) {
    var row = grid.find(n);
    if (empty(row)) {
      var m = match(expr);
      var e = m[1] + n  + ':' + m[2] + n;
      var connector = Connector(grid.find(e), 'col', this.spreadsheet);
      if (collapsed) connector.hide();
      break;
    }
  }

  function empty(row) {
    var empty = true;
    row.forEach(function(th) {
      if (classes(th).has('collapsible')) empty = false;
    })
    return empty;
  }
};


/**
 * Initialize `Connector`
 */

function Connector(grid, type, spreadsheet, hidden) {
  if (!(this instanceof Connector)) return new Connector(grid, type, spreadsheet, hidden);
  this.hidden = undefined == hidden ? false : true;
  this.spreadsheet = spreadsheet;
  this.thead = spreadsheet.thead;

  var first = this.first = grid.value(0);
  var last = this.last = grid.value(-1);
  var toggle = this.ontoggle = this.toggle.bind(this);

  this.grid = grid;
  this.len = grid.selection.length;

  grid.forEach(function(v) {
    event.bind(v, 'click', toggle);

    if (v == first) cls = 'dot';
    else if (v == last) cls = 'dash';
    else cls = 'line';

    classes(v).add(cls).add('collapsible');
  });

  if (type == 'col') {
    this.layer = first.parentNode;
    var expr = grid.expr.replace(/\d+/g, '');
    var m = match(expr);
    this.hideExpr = ntol(lton(m[1]) + 1) + ':' + m[2];
  } else if ('row') {
    var layerheads = this.thead.querySelectorAll('.layerhead');
    var n = lton(grid.expr.match(/[A-Z]/)[0]);
    this.layer = layerheads.item(n);
    var expr = grid.expr.replace(/[A-Z]/gi, '');
    var m = match(expr);
    this.hideExpr = (+m[1] + 1) + ':' + m[2];
  }

  if (!this.hidden) classes(this.layer).add('shown');
}

/**
 * Mixin `Emitter`
 */

Emitter(Connector.prototype);

/**
 * toggle
 */

Connector.prototype.toggle = function() {
  return this.hidden ? this.show() : this.hide();
};


/**
 * show
 */

Connector.prototype.show = function() {
  this.spreadsheet.select(this.hideExpr).show();
  classes(this.first).remove('hiding');
  this.hidden = false;
};

/**
 * hide
 */

Connector.prototype.hide = function() {
  this.spreadsheet.select(this.hideExpr).hide();
  classes(this.first).add('hiding');
  this.hidden = true;
};


});
_dereq_.register("spreadsheet/lib/format.js", function(exports, _dereq_, module){
/**
 * Custom formats
 */

exports['x'] = function(val) {
  return round(val, 1) + 'x';
}

/**
 * Round
 *
 * @param {Number} n
 * @return {Number} decimals
 * @return {Number}
 */

function round(n, decimals) {
  decimals *= 10;
  return Math.round(n * decimals) / decimals;
}

});














































_dereq_.alias("component-domify/index.js", "spreadsheet/deps/domify/index.js");
_dereq_.alias("component-domify/index.js", "domify/index.js");

_dereq_.alias("component-emitter/index.js", "spreadsheet/deps/emitter/index.js");
_dereq_.alias("component-emitter/index.js", "emitter/index.js");

_dereq_.alias("yields-isarray/index.js", "spreadsheet/deps/isArray/index.js");
_dereq_.alias("yields-isarray/index.js", "isArray/index.js");

_dereq_.alias("component-classes/index.js", "spreadsheet/deps/classes/index.js");
_dereq_.alias("component-classes/index.js", "classes/index.js");
_dereq_.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

_dereq_.alias("component-events/index.js", "spreadsheet/deps/events/index.js");
_dereq_.alias("component-events/index.js", "events/index.js");
_dereq_.alias("component-event/index.js", "component-events/deps/event/index.js");

_dereq_.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
_dereq_.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
_dereq_.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
_dereq_.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
_dereq_.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

_dereq_.alias("discore-closest/index.js", "discore-closest/index.js");
_dereq_.alias("component-event/index.js", "component-delegate/deps/event/index.js");

_dereq_.alias("component-event/index.js", "spreadsheet/deps/event/index.js");
_dereq_.alias("component-event/index.js", "event/index.js");

_dereq_.alias("component-props/index.js", "spreadsheet/deps/props/index.js");
_dereq_.alias("component-props/index.js", "props/index.js");

_dereq_.alias("adamwdraper-numeral-js/numeral.js", "spreadsheet/deps/numeral/numeral.js");
_dereq_.alias("adamwdraper-numeral-js/numeral.js", "spreadsheet/deps/numeral/index.js");
_dereq_.alias("adamwdraper-numeral-js/numeral.js", "numeral/index.js");
_dereq_.alias("adamwdraper-numeral-js/numeral.js", "adamwdraper-numeral-js/index.js");
_dereq_.alias("yields-shortcuts/index.js", "spreadsheet/deps/shortcuts/index.js");
_dereq_.alias("yields-shortcuts/index.js", "spreadsheet/deps/shortcuts/index.js");
_dereq_.alias("yields-shortcuts/index.js", "shortcuts/index.js");
_dereq_.alias("yields-k/lib/index.js", "yields-shortcuts/deps/k/lib/index.js");
_dereq_.alias("yields-k/lib/proto.js", "yields-shortcuts/deps/k/lib/proto.js");
_dereq_.alias("yields-k/lib/index.js", "yields-shortcuts/deps/k/index.js");
_dereq_.alias("yields-k-sequence/index.js", "yields-k/deps/k-sequence/index.js");
_dereq_.alias("yields-k-sequence/index.js", "yields-k/deps/k-sequence/index.js");
_dereq_.alias("yields-keycode/index.js", "yields-k-sequence/deps/keycode/index.js");

_dereq_.alias("yields-k-sequence/index.js", "yields-k-sequence/index.js");
_dereq_.alias("yields-keycode/index.js", "yields-k/deps/keycode/index.js");

_dereq_.alias("component-event/index.js", "yields-k/deps/event/index.js");

_dereq_.alias("component-bind/index.js", "yields-k/deps/bind/index.js");

_dereq_.alias("component-os/index.js", "yields-k/deps/os/index.js");

_dereq_.alias("yields-k/lib/index.js", "yields-k/index.js");
_dereq_.alias("yields-shortcuts/index.js", "yields-shortcuts/index.js");
_dereq_.alias("yields-k/lib/index.js", "spreadsheet/deps/k/lib/index.js");
_dereq_.alias("yields-k/lib/proto.js", "spreadsheet/deps/k/lib/proto.js");
_dereq_.alias("yields-k/lib/index.js", "spreadsheet/deps/k/index.js");
_dereq_.alias("yields-k/lib/index.js", "k/index.js");
_dereq_.alias("yields-k-sequence/index.js", "yields-k/deps/k-sequence/index.js");
_dereq_.alias("yields-k-sequence/index.js", "yields-k/deps/k-sequence/index.js");
_dereq_.alias("yields-keycode/index.js", "yields-k-sequence/deps/keycode/index.js");

_dereq_.alias("yields-k-sequence/index.js", "yields-k-sequence/index.js");
_dereq_.alias("yields-keycode/index.js", "yields-k/deps/keycode/index.js");

_dereq_.alias("component-event/index.js", "yields-k/deps/event/index.js");

_dereq_.alias("component-bind/index.js", "yields-k/deps/bind/index.js");

_dereq_.alias("component-os/index.js", "yields-k/deps/os/index.js");

_dereq_.alias("yields-k/lib/index.js", "yields-k/index.js");
_dereq_.alias("matthewmueller-delegates/index.js", "spreadsheet/deps/delegates/index.js");
_dereq_.alias("matthewmueller-delegates/index.js", "delegates/index.js");

_dereq_.alias("component-closest/index.js", "spreadsheet/deps/closest/index.js");
_dereq_.alias("component-closest/index.js", "spreadsheet/deps/closest/index.js");
_dereq_.alias("component-closest/index.js", "closest/index.js");
_dereq_.alias("component-matches-selector/index.js", "component-closest/deps/matches-selector/index.js");
_dereq_.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

_dereq_.alias("component-closest/index.js", "component-closest/index.js");
_dereq_.alias("bmcmahen-modifier/index.js", "spreadsheet/deps/modifier/index.js");
_dereq_.alias("bmcmahen-modifier/index.js", "spreadsheet/deps/modifier/index.js");
_dereq_.alias("bmcmahen-modifier/index.js", "modifier/index.js");
_dereq_.alias("bmcmahen-modifier/index.js", "bmcmahen-modifier/index.js");
_dereq_.alias("matthewmueller-per-frame/index.js", "spreadsheet/deps/per-frame/index.js");
_dereq_.alias("matthewmueller-per-frame/index.js", "per-frame/index.js");
_dereq_.alias("component-raf/index.js", "matthewmueller-per-frame/deps/raf/index.js");

_dereq_.alias("matthewmueller-mini-tokenizer/index.js", "spreadsheet/deps/mini-tokenizer/index.js");
_dereq_.alias("matthewmueller-mini-tokenizer/index.js", "spreadsheet/deps/mini-tokenizer/index.js");
_dereq_.alias("matthewmueller-mini-tokenizer/index.js", "mini-tokenizer/index.js");
_dereq_.alias("matthewmueller-mini-tokenizer/index.js", "matthewmueller-mini-tokenizer/index.js");
_dereq_.alias("visionmedia-jade/lib/runtime.js", "spreadsheet/deps/jade/lib/runtime.js");
_dereq_.alias("visionmedia-jade/lib/runtime.js", "spreadsheet/deps/jade/index.js");
_dereq_.alias("visionmedia-jade/lib/runtime.js", "jade/index.js");
_dereq_.alias("visionmedia-jade/lib/runtime.js", "visionmedia-jade/index.js");
_dereq_.alias("matthewmueller-grid/index.js", "spreadsheet/deps/grid/index.js");
_dereq_.alias("matthewmueller-grid/lib/grid.js", "spreadsheet/deps/grid/lib/grid.js");
_dereq_.alias("matthewmueller-grid/lib/type.js", "spreadsheet/deps/grid/lib/type.js");
_dereq_.alias("matthewmueller-grid/lib/utils.js", "spreadsheet/deps/grid/lib/utils.js");
_dereq_.alias("matthewmueller-grid/lib/match.js", "spreadsheet/deps/grid/lib/match.js");
_dereq_.alias("matthewmueller-grid/lib/regexp.js", "spreadsheet/deps/grid/lib/regexp.js");
_dereq_.alias("matthewmueller-grid/lib/tokens.js", "spreadsheet/deps/grid/lib/tokens.js");
_dereq_.alias("matthewmueller-grid/lib/expand.js", "spreadsheet/deps/grid/lib/expand.js");
_dereq_.alias("matthewmueller-grid/lib/selection.js", "spreadsheet/deps/grid/lib/selection.js");
_dereq_.alias("matthewmueller-grid/index.js", "spreadsheet/deps/grid/index.js");
_dereq_.alias("matthewmueller-grid/index.js", "grid/index.js");
_dereq_.alias("matthewmueller-mini-tokenizer/index.js", "matthewmueller-grid/deps/mini-tokenizer/index.js");
_dereq_.alias("matthewmueller-mini-tokenizer/index.js", "matthewmueller-grid/deps/mini-tokenizer/index.js");
_dereq_.alias("matthewmueller-mini-tokenizer/index.js", "matthewmueller-mini-tokenizer/index.js");
_dereq_.alias("juliangruber-intersect/index.js", "matthewmueller-grid/deps/intersect/index.js");

_dereq_.alias("jkroso-unique/index.js", "matthewmueller-grid/deps/unique/index.js");

_dereq_.alias("matthewmueller-grid/index.js", "matthewmueller-grid/index.js");
_dereq_.alias("component-ie/index.js", "spreadsheet/deps/ie/index.js");
_dereq_.alias("component-ie/index.js", "spreadsheet/deps/ie/index.js");
_dereq_.alias("component-ie/index.js", "ie/index.js");
_dereq_.alias("component-ie/index.js", "component-ie/index.js");
_dereq_.alias("component-tap/index.js", "spreadsheet/deps/tap/index.js");
_dereq_.alias("component-tap/index.js", "tap/index.js");
_dereq_.alias("component-event/index.js", "component-tap/deps/event/index.js");

_dereq_.alias("component-bind/index.js", "component-tap/deps/bind/index.js");

_dereq_.alias("spreadsheet/index.js", "spreadsheet/index.js");if (typeof exports == "object") {
  module.exports = _dereq_("spreadsheet");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return _dereq_("spreadsheet"); });
} else {
  this["Spreadsheet"] = _dereq_("spreadsheet");
}})();

},{}]},{},[1])(1)
});