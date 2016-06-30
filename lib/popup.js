'use strict';

var domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes'),
    domify = require('min-dom/lib/domify'),
    bind = require('lodash/function/bind');

/**
 * @class
 * @constructor
 */
function Popup(options) {
  options = options || {};
  this.template = options.template || this.template;
  var el = this.el = domify(this.template);

  this.header = domQuery('.popup-header', el);
  this.body =   domQuery('.popup-body', el);
  this.footer = domQuery('.popup-footer', el);

  document.body.appendChild(el);

  this._attachEvents();
}

Popup.prototype.template =  '<div class="bpp-properties-panel-popup">' +
                              '<div class="underlay"></div>' +
                              '<div class="popup">' +
                                '<button class="popup-close"><span>Close</span></button>' +
                                '<div class="popup-header"></div>' +
                                '<div class="popup-body"></div>' +
                                '<div class="popup-footer"></div>' +
                              '</div>' +
                            '</div>';



Popup.prototype._attachEvents = function() {
  var self = this;
  var events = this.events;
  var el = this.el;

  Object.keys(events).forEach(function(instruction) {
    var cb = bind(self[events[instruction]], self);
    var parts = instruction.split(' ');
    var evtName = parts.shift();
    var target = parts.length ? parts.shift() : false;
    target = target ? domQuery(target, el) : el;
    if (!target) { return; }
    target.addEventListener(evtName, cb);
  });
};

Popup.prototype._detachEvents = function() {
  var self = this;
  var events = this.events;
  var el = this.el;

  Object.keys(events).forEach(function(instruction) {
    var cb = bind(self[events[instruction]], self);
    var parts = instruction.split(' ');
    var evtName = parts.shift();
    var target = parts.length ? parts.shift() : false;
    target = target ? domQuery(target, el) : el;
    if (!target) { return; }
    target.removeEventListener(evtName, cb);
  });
};

Popup.prototype.events = {
  // 'keydown:esc':        '_handleClose',
  'click .underlay': '_handleClose',
  'click .popup-close': '_handleClose'
};


Popup.prototype._handleClose = function(evt) {
  this.close();
};


Popup.prototype.open = function(content) {
  domClasses(this.el).add('open');
};

Popup.prototype.close = function() {
  domClasses(this.el).remove('open');
};

Popup.prototype.remove = function() {
  this._detachEvents();
  if (document.body.contains(this.el)) {
    document.body.removeChild(this.el);
  }
};

var popup;
module.exports = function() {
  if (!popup) {
    popup = new Popup();
  }
  return popup;
};
