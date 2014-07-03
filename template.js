/**
 * Module Dependencies
 */

var jade = require('jade');

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
            buf.push('<td><input type="tel" disabled="disabled"/></td>');
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
