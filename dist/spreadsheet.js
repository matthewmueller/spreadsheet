;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

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

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

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

require.resolve = function(path) {
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
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
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

require.normalize = function(curr, path) {
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

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

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
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

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
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-domify/index.js", function(exports, require, module){

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
require.register("component-emitter/index.js", function(exports, require, module){

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
require.register("yields-isarray/index.js", function(exports, require, module){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
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
require.register("matthewmueller-extend/index.js", function(exports, require, module){
/**
 * Extend an object with another.
 *
 * @param {Object, ...} src, ...
 * @return {Object} merged
 * @api private
 */

module.exports = function(src) {
  var objs = [].slice.call(arguments, 1), obj;

  for (var i = 0, len = objs.length; i < len; i++) {
    obj = objs[i];
    for (var prop in obj) {
      src[prop] = obj[prop];
    }
  }

  return src;
}

});
require.register("component-indexof/index.js", function(exports, require, module){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-classes/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var index = require('indexof');

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
require.register("component-delegate/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var closest = require('closest')
  , event = require('event');

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
require.register("component-events/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var events = require('event');
var delegate = require('delegate');

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
require.register("component-event/index.js", function(exports, require, module){
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
require.register("component-props/index.js", function(exports, require, module){
/**
 * Global Names
 */

var globals = /\b(this|Array|Date|Object|Math|JSON)\b/g;

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
    .match(/[$a-zA-Z_]\w*/g)
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
require.register("yields-uniq/index.js", function(exports, require, module){

/**
 * dependencies
 */

try {
  var indexOf = require('indexof');
} catch(e){
  var indexOf = require('indexof-component');
}

/**
 * Create duplicate free array
 * from the provided `arr`.
 *
 * @param {Array} arr
 * @param {Array} select
 * @return {Array}
 */

module.exports = function (arr, select) {
  var len = arr.length, ret = [], v;
  select = select ? (select instanceof Array ? select : [select]) : false;

  for (var i = 0; i < len; i++) {
    v = arr[i];
    if (select && !~indexOf(select, v)) {
      ret.push(v);
    } else if (!~indexOf(ret, v)) {
      ret.push(v);
    }
  }
  return ret;
};

});
require.register("adamwdraper-numeral-js/numeral.js", function(exports, require, module){
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
require.register("yields-shortcuts/index.js", function(exports, require, module){

/**
 * dependencies
 */

var dispatcher = require('k');

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
require.register("yields-k-sequence/index.js", function(exports, require, module){

/**
 * dependencies
 */

var keycode = require('keycode');

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
require.register("yields-keycode/index.js", function(exports, require, module){

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
require.register("component-bind/index.js", function(exports, require, module){
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
require.register("component-os/index.js", function(exports, require, module){


module.exports = os();

function os() {
  var ua = navigator.userAgent;
  if (/mac/i.test(ua)) return 'mac';
  if (/win/i.test(ua)) return 'windows';
  if (/linux/i.test(ua)) return 'linux';
}

});
require.register("yields-k/lib/index.js", function(exports, require, module){

/**
 * dependencies.
 */

var event = require('event')
  , proto = require('./proto')
  , bind = require('bind');

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
require.register("yields-k/lib/proto.js", function(exports, require, module){

/**
 * dependencies
 */

var sequence = require('k-sequence')
  , keycode = require('keycode')
  , event = require('event')
  , os = require('os');

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
require.register("matthewmueller-delegates/index.js", function(exports, require, module){

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
require.register("component-query/index.js", function(exports, require, module){
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
require.register("component-matches-selector/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var query = require('query');

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
require.register("discore-closest/index.js", function(exports, require, module){
var matches = require('matches-selector')

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
require.register("bmcmahen-modifier/index.js", function(exports, require, module){
module.exports = function(e){
 return e.shiftKey
  || e.altKey
  || e.ctrlKey
  || e.metaKey;
};
});
require.register("component-raf/index.js", function(exports, require, module){
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
require.register("matthewmueller-per-frame/index.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var raf = require('raf')

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
require.register("spreadsheet/index.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var Workbook = require('./lib/workbook');

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
 */

function spreadsheet() {
  return workbook.spreadsheet();
}

});
require.register("spreadsheet/lib/workbook.js", function(exports, require, module){
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

});
require.register("spreadsheet/lib/spreadsheet.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var classes = require('classes');
var event = require('event');
var events = require('events');
var closest = require('closest');
var delegate = require('delegates');
var isArray = require('isArray');
var Emitter = require('emitter');
var extend = require('extend');
var domify = require('domify');
var shortcuts = require('shortcuts');
var Selection = require('./selection');
var Cell = require('./cell');
var utils = require('./utils');
var match = require('./match');
var lton = utils.lton;
var ntol = utils.ntol;
var smallest = utils.smallest;
var largest = utils.largest;
var subtract = utils.subtract;
var k = require('k')(document);

/**
 * Spreadsheet element
 */

var spreadsheet = domify('<div class="spreadsheet"><div class="row-heading"></div><table><thead></thead><tbody></tbody></table></div>');

/**
 * Export `Spreadsheet`
 */

module.exports = Spreadsheet;

/**
 * Initialize `Spreadsheet`
 */

function Spreadsheet() {
  if (!(this instanceof Spreadsheet)) return new Spreadsheet();
  this.el = spreadsheet.cloneNode(true);
  this.classes = classes(this.el);

  // element refs
  this.table = this.el.lastChild;
  this.rowhead = this.el.firstChild;
  this.thead = this.table.firstChild;
  this.tbody = this.table.lastChild;

  this.spreadsheet = {};
  this.merged = {};

  // active cell
  this.active = false;

  // bind events
  this.events = events(this.el, this);
  this.events.bind('click', 'onclick');
  this.events.bind('click td', 'onselect');
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
 * Add debugging support
 */

Spreadsheet.prototype.debug = function() {
  console.log('todo: support debugging, like showing cells');
};

/**
 * Insert cell into the spreadsheet
 *
 * @param {Array} cells
 * @return {Spreadsheet}
 * @api private
 */

Spreadsheet.prototype.insert = function(cells) {
  cells = isArray(cells) ? cells : [cells];

  if (!cells.length) return this;

  var spreadsheet = this.spreadsheet;
  var at;
  var td;

  // fill in from the biggest cell
  var biggest = largest(cells);
  this.fill(biggest);

  for (var i = 0, cell; cell = cells[i]; i++) {
    at = cell.at;
    td = this.at(at);

    // replace the cell
    td.replace(cell);

    // add a reference to the cell
    spreadsheet[at] = cell;
  }

  return this;
};

/**
 * Fill in the spreadsheet
 */

Spreadsheet.prototype.fill = function(cell) {
  var spreadsheet = this.spreadsheet;
  var rowhead = this.rowhead;
  var thead = this.thead;
  var tbody = this.tbody;
  var m = match(cell.at);
  var ac = lton(m[1]);
  var ar = +m[2];
  var letter;
  var rh;
  var tr;
  var th;
  var at;
  var c;

  var largest = this.largest();
  m = match(largest);
  var lc = lton(m[1]);
  var lr = +m[2];
  var rows = lr > ar ? lr : ar;
  var cols = lc > ac ? lc : ac;

  // fill in column headers
  var colhead = thead.getElementsByTagName('tr')[0];
  colhead = colhead ? colhead : domify('<tr></tr>');
  var ths = colhead.getElementsByTagName('th');

  for (var i = 0; i <= cols; i++) {
    th = ths[i];

    if (!th) {
      th = document.createElement('th');
      th.innerHTML = '<div>' + ntol(i) + '</div>';
      colhead.appendChild(th);
    }
  }

  // add colhead in if it isn't there already
  if (!colhead.parentNode) thead.appendChild(colhead);  

  // fill in the rows
  var trs = tbody.getElementsByTagName('tr');
  var rhs = rowhead.getElementsByTagName('div');

  for (var i = 1; i <= rows; i++) {
    tr = trs[i - 1];

    if (!tr) {
      tr = document.createElement('tr');
      tr.setAttribute('name', i);
      tbody.appendChild(tr);
    }

    if (!rhs[i - 1]) {
      rh = document.createElement('div');
      rh.textContent = i;
      rowhead.appendChild(rh);
    }

    // fill in rows
    for (var j = 0; j <= cols; j++) {
      letter = ntol(j);
      at = letter + i;

      if (!spreadsheet[at]) {
        c = new Cell(null, at, this);
        spreadsheet[at] = c;
        tr.appendChild(c.render());
      }
    }
  }
}

/**
 * Add border to cell
 *
 * @api private
 */

Spreadsheet.prototype.border = function(cell, l, n) {
  // console.log(cell, l, n);
  return this;
};

/**
 * Blur
 */

Spreadsheet.prototype.onblur = function(e) {
  var target = e.target;
  var td = target.parentNode;
  classes(td).remove('active');
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
 * Get the largest cell also known
 * as the lowest, rightmost cell.
 *
 * @return {String} at
 * @api private
 */

Spreadsheet.prototype.largest = function() {
  var at = 'A1';

  var tr = this.tbody.querySelector('tr:last-child');
  if (!tr) return at;
  var td = tr.querySelector('td:last-child');

  // FIXME: i don't think this is right
  if (!td) return at;

  return td.getAttribute('name');
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
  var el, tr;

  merged[at] = [];

  // remove the remaining cells
  for (var i = 0, cell; cell = cells[i]; i++) {
    if (captain == cell) continue;
    el = cell.el;
    tr = el.parentNode;
    if (tr) tr.removeChild(el);
    spreadsheet[cell.at] = captain;
    merged[at].push(cell.at);
  }

  // add the col and rowspan
  var biggest = largest(cells);
  var diff = subtract(biggest.at, captain.at);
  captain.attr('rowspan', diff.row + 1);
  captain.attr('colspan', diff.col + 1);

  // insert and fill, even if null
  this.insert(captain);

  // TODO: this needs to smarter. it's breaking for merge rows
  this.fill(biggest);

  return this;
}

/**
 * Find a spreadsheet cell
 *
 * @param {String} at
 * @return {Element|null}
 */

Spreadsheet.prototype.find = function(at) {
  return this.tbody.querySelector('td[name="' + at + '"]');
}

/**
 * onclick
 */

Spreadsheet.prototype.onclick = function() {
  this.active && this.active.reset();
  this.classes.remove('headings');
};


/**
 * Select a cell
 *
 * @param {Event} e
 * @return {Spreadsheet}
 * @api private
 */

Spreadsheet.prototype.onselect = function(e) {
  var target = 'TD' == e.target.nodeName ? e.target : closest(e.target, 'td');

  if (!target) {
    this.active && this.active.deactivate();
    return this;
  }

  var at = target.getAttribute('name');
  var cell = this.at(at);

  // remove any old classes, if we're not
  // clicking on the currently active cell
  this.active && this.active != cell && this.active.deactivate();
  this.active = cell;

  return this;
};

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
require.register("spreadsheet/lib/selection.js", function(exports, require, module){
/**
 * Module dependencies
 */

var slice = [].slice;
var isArray = require('isArray');
var Cell = require('./cell');
var type = require('./type');
var tokens = require('./tokens');
var expand = require('./expand');
var utils = require('./utils');
var match = require('./match');
var shift = utils.shift;
var lton = utils.lton;
var ntol = utils.ntol;
var largest = utils.largest;
var rows = utils.rows;
var cols = utils.cols;

/**
 * Export `Selection`
 */

module.exports = Selection;

/**
 * Initialize `Selection`
 *
 * @param {String} selection
 * @param {Table} spreadsheet
 * @return {Selection}
 * @api private
 */

function Selection(selection, spreadsheet) {
  if (!(this instanceof Selection)) return new Selection(selection, spreadsheet);
  this.spreadsheet = spreadsheet;
  this.expr = selection;
  this.selection = expand(selection, spreadsheet.largest());
  this.cache = {};
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
 * Insert some data into the spreadsheets
 *
 * @param {Mixed} val
 * @return {Selection}
 * @api public
 */

Selection.prototype.insert = function(val) {
  val = isArray(val) ? val : [val];
  var cells = [];

  this.each(function(cell, i) {
    // end the loop early if we're done
    if (undefined == val[i]) return false;
    cell.val(val[i]);
    cells.push(cell);
  })

  // insert into the spreadsheet
  this.spreadsheet.insert(cells);

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

    cell.val('= ' + e);
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
    cell = spreadsheet.at(at) || this.cache[at] || (this.cache[at] = new Cell(null, at, spreadsheet));

    // ignore merged cells
    if (cell.at != at) {
      continue;
    }

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
 * TODO: Add support after we resolve
 * merge bug. *update* which bug? haha...
 *
 * @return {Selection}
 * @api public
 */

// Selection.prototype.mergeRows = function() {
//   var cells = this.cells();
//   var cs = cols(cells);
//   for (var i = 0, col; col = cs[i]; i++) {
//     this.spreadsheet.merge(col);
//   }
//   return this;
// };

/**
 * Merge the cols together
 *
 * @return {Selection}
 * @api public
 */

Selection.prototype.mergeCols = function() {
  var cells = this.cells();
  var rs = rows(cells);
  for (var i = 0, row; row = rs[i]; i++) {
    this.spreadsheet.merge(row);
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
 * Delegate each cell in the selection to Cell
 */

[
  'editable',
  'format',
  'addClass',
  'attr',
  'show',
  'hide'
].forEach(function(m) {
  Selection.prototype[m] = function() {
    var args = slice.call(arguments);
    return this.each.apply(this, [m].concat(args));
  };
});

});
require.register("spreadsheet/lib/cell.js", function(exports, require, module){
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
var tokens = require('./tokens');
var shortcuts = require('shortcuts');
var outline = require('./outline');

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
  this.value = value || '';
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
    this.input.value = this.compute(val);
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
      this.input.value = this.value;
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

});
require.register("spreadsheet/lib/utils.js", function(exports, require, module){
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
    number = match(cell.at)[2];
    if (!buckets[number]) buckets[number] = [];
    buckets[number].push(cell);
  }

  for (i in buckets) {
    rows.push(buckets[i]);
  }

  return rows;
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
    letter = match(cell.at)[1];
    if (!buckets[letter]) buckets[letter] = [];
    buckets[letter].push(cell);
  }

  for (i in buckets) {
    cols.push(buckets[i]);
  }

  return cols;
};

});
require.register("spreadsheet/lib/type.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var regex = require('./regex');

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
  if (regex.row.test(str)) return 'row';
  if (regex.col.test(str)) return 'col';
};

});
require.register("spreadsheet/lib/tokens.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var regex = require('./regex');

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
require.register("spreadsheet/lib/regex.js", function(exports, require, module){
/**
 * Regexs
 */

var block = exports.block = /([A-Za-z]+[0-9]+)\:([A-Za-z]+[0-9]+)/;
var cell = exports.cell = /([A-Za-z]+)([0-9]+)/;
var col = exports.col = /\:([A-Za-z]+)/;
var row = exports.row = /\:([0-9]+)/;
var any = exports.any = new RegExp([block, cell, col, row].map(source).join('|'), 'g');

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
require.register("spreadsheet/lib/expand.js", function(exports, require, module){
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
      case 'col':
        m = rcol.exec(tok);
        var l = m[1];
        var start = l + 1;
        var end = l + maxrow;
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

});
require.register("spreadsheet/lib/match.js", function(exports, require, module){
/**
 * Module Dependencies
 */

var regex = require('./regex');

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
  || str.match(regex.row)
  || str.match(regex.col)
  || str.match(regex.cell)
}

});
require.register("spreadsheet/lib/outline.js", function(exports, require, module){
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

});






































require.alias("component-domify/index.js", "spreadsheet/deps/domify/index.js");
require.alias("component-domify/index.js", "domify/index.js");

require.alias("component-emitter/index.js", "spreadsheet/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");

require.alias("yields-isarray/index.js", "spreadsheet/deps/isArray/index.js");
require.alias("yields-isarray/index.js", "isArray/index.js");

require.alias("matthewmueller-extend/index.js", "spreadsheet/deps/extend/index.js");
require.alias("matthewmueller-extend/index.js", "spreadsheet/deps/extend/index.js");
require.alias("matthewmueller-extend/index.js", "extend/index.js");
require.alias("matthewmueller-extend/index.js", "matthewmueller-extend/index.js");
require.alias("component-classes/index.js", "spreadsheet/deps/classes/index.js");
require.alias("component-classes/index.js", "classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-events/index.js", "spreadsheet/deps/events/index.js");
require.alias("component-events/index.js", "events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("discore-closest/index.js", "discore-closest/index.js");
require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-event/index.js", "spreadsheet/deps/event/index.js");
require.alias("component-event/index.js", "event/index.js");

require.alias("component-props/index.js", "spreadsheet/deps/props/index.js");
require.alias("component-props/index.js", "props/index.js");

require.alias("yields-uniq/index.js", "spreadsheet/deps/uniq/index.js");
require.alias("yields-uniq/index.js", "uniq/index.js");
require.alias("component-indexof/index.js", "yields-uniq/deps/indexof/index.js");

require.alias("adamwdraper-numeral-js/numeral.js", "spreadsheet/deps/numeral/numeral.js");
require.alias("adamwdraper-numeral-js/numeral.js", "spreadsheet/deps/numeral/index.js");
require.alias("adamwdraper-numeral-js/numeral.js", "numeral/index.js");
require.alias("adamwdraper-numeral-js/numeral.js", "adamwdraper-numeral-js/index.js");
require.alias("yields-shortcuts/index.js", "spreadsheet/deps/shortcuts/index.js");
require.alias("yields-shortcuts/index.js", "spreadsheet/deps/shortcuts/index.js");
require.alias("yields-shortcuts/index.js", "shortcuts/index.js");
require.alias("yields-k/lib/index.js", "yields-shortcuts/deps/k/lib/index.js");
require.alias("yields-k/lib/proto.js", "yields-shortcuts/deps/k/lib/proto.js");
require.alias("yields-k/lib/index.js", "yields-shortcuts/deps/k/index.js");
require.alias("yields-k-sequence/index.js", "yields-k/deps/k-sequence/index.js");
require.alias("yields-k-sequence/index.js", "yields-k/deps/k-sequence/index.js");
require.alias("yields-keycode/index.js", "yields-k-sequence/deps/keycode/index.js");

require.alias("yields-k-sequence/index.js", "yields-k-sequence/index.js");
require.alias("yields-keycode/index.js", "yields-k/deps/keycode/index.js");

require.alias("component-event/index.js", "yields-k/deps/event/index.js");

require.alias("component-bind/index.js", "yields-k/deps/bind/index.js");

require.alias("component-os/index.js", "yields-k/deps/os/index.js");

require.alias("yields-k/lib/index.js", "yields-k/index.js");
require.alias("yields-shortcuts/index.js", "yields-shortcuts/index.js");
require.alias("yields-k/lib/index.js", "spreadsheet/deps/k/lib/index.js");
require.alias("yields-k/lib/proto.js", "spreadsheet/deps/k/lib/proto.js");
require.alias("yields-k/lib/index.js", "spreadsheet/deps/k/index.js");
require.alias("yields-k/lib/index.js", "k/index.js");
require.alias("yields-k-sequence/index.js", "yields-k/deps/k-sequence/index.js");
require.alias("yields-k-sequence/index.js", "yields-k/deps/k-sequence/index.js");
require.alias("yields-keycode/index.js", "yields-k-sequence/deps/keycode/index.js");

require.alias("yields-k-sequence/index.js", "yields-k-sequence/index.js");
require.alias("yields-keycode/index.js", "yields-k/deps/keycode/index.js");

require.alias("component-event/index.js", "yields-k/deps/event/index.js");

require.alias("component-bind/index.js", "yields-k/deps/bind/index.js");

require.alias("component-os/index.js", "yields-k/deps/os/index.js");

require.alias("yields-k/lib/index.js", "yields-k/index.js");
require.alias("matthewmueller-delegates/index.js", "spreadsheet/deps/delegates/index.js");
require.alias("matthewmueller-delegates/index.js", "delegates/index.js");

require.alias("discore-closest/index.js", "spreadsheet/deps/closest/index.js");
require.alias("discore-closest/index.js", "spreadsheet/deps/closest/index.js");
require.alias("discore-closest/index.js", "closest/index.js");
require.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("discore-closest/index.js", "discore-closest/index.js");
require.alias("bmcmahen-modifier/index.js", "spreadsheet/deps/modifier/index.js");
require.alias("bmcmahen-modifier/index.js", "spreadsheet/deps/modifier/index.js");
require.alias("bmcmahen-modifier/index.js", "modifier/index.js");
require.alias("bmcmahen-modifier/index.js", "bmcmahen-modifier/index.js");
require.alias("matthewmueller-per-frame/index.js", "spreadsheet/deps/per-frame/index.js");
require.alias("matthewmueller-per-frame/index.js", "per-frame/index.js");
require.alias("component-raf/index.js", "matthewmueller-per-frame/deps/raf/index.js");

require.alias("spreadsheet/index.js", "spreadsheet/index.js");if (typeof exports == "object") {
  module.exports = require("spreadsheet");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return require("spreadsheet"); });
} else {
  this["spreadsheet"] = require("spreadsheet");
}})();