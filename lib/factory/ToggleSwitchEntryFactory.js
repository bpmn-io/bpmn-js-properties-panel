'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    cmdHelper = require('../helper/CmdHelper'),
    escapeHTML = require('../Utils').escapeHTML;

var entryFieldDescription = require('./EntryFieldDescription');

var domify = require('min-dom').domify;

var toggleSwitch = function(translate, options, defaultParameters) {
  var resource = defaultParameters,
      id = resource.id,
      label = options.label || id,
      canBeHidden = !!options.hidden && typeof options.hidden === 'function',
      isOn = options.isOn,
      descriptionOn = options.descriptionOn,
      descriptionOff = options.descriptionOff,
      labelOn = options.labelOn,
      labelOff = options.labelOff;

  resource.html = document.createDocumentFragment();

  resource.html.appendChild(domify('<label for="' + escapeHTML(id) + '" ' +
      (canBeHidden ? 'data-show="shouldShow"' : '') +
      '>' + escapeHTML(label) + '</label>' +
    '<div class="bpp-field-wrapper"' +
    (canBeHidden ? 'data-show="shouldShow"' : '') +
    '>' +
      '<label class="bpp-toggle-switch__switcher">' +
        '<input id="' + escapeHTML(id) + '" ' +
            'type="checkbox" ' +
            'name="' + escapeHTML(options.modelProperty) + '" />' +
        '<span class="bpp-toggle-switch__slider"></span>' +
      '</label>' +
      '<p class="bpp-toggle-switch__label" data-show="isOn">' +
        escapeHTML(labelOn) +
      '</p>' +
      '<p class="bpp-toggle-switch__label" data-show="isOff">' +
        escapeHTML(labelOff) +
      '</p>' +
    '</div>'));

  if (descriptionOn) {
    resource.html.appendChild(entryFieldDescription(translate, descriptionOn, { show: 'isOn' }));
  }

  if (descriptionOff) {
    resource.html.appendChild(entryFieldDescription(translate, descriptionOff, { show: 'isOff' }));
  }

  resource.get = function(element) {
    var bo = getBusinessObject(element),
        res = {};

    res[options.modelProperty] = bo.get(options.modelProperty);

    return res;
  };

  resource.set = function(element, values) {
    var res = {};

    res[options.modelProperty] = !!values[options.modelProperty];

    return cmdHelper.updateProperties(element, res);
  };

  if (typeof options.set === 'function') {
    resource.set = options.set;
  }

  if (typeof options.get === 'function') {
    resource.get = options.get;
  }

  if (canBeHidden) {
    resource.shouldShow = function() {
      return !options.hidden.apply(resource, arguments);
    };
  }

  resource.isOn = function() {
    if (canBeHidden && !resource.shouldShow()) {
      return false;
    }

    return isOn.apply(resource, arguments);
  };

  resource.isOff = function() {
    if (canBeHidden && !resource.shouldShow()) {
      return false;
    }

    return !resource.isOn();
  };

  resource.cssClasses = ['bpp-toggle-switch'];

  return resource;
};

module.exports = toggleSwitch;
