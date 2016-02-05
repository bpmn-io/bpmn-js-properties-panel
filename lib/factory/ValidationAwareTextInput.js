'use strict';

var textField = require('./TextInputEntryFactory');

/**
 * This function is a wrapper around TextInputEntryFactory.
 * It adds functionality to cache an invalid value entered in the
 * text input, instead of setting it on the business object.
 */
var validationAwareTextField = function(options, defaultParameters) {
  defaultParameters.get = function(element, node) {
    var property = options.modelProperty,
        value = this.__lastInvalidValue;

    delete this.__lastInvalidValue;

    var properties = {};

    properties[property] = value !== undefined ? value : options.getProperty(element, node);

    return properties;
  };
  defaultParameters.set = function(element, values, node) {
    var validationErrors = options.validate(element, values, node),
        propertyName = options.modelProperty,
        propertyValue = values[propertyName];

    // make sure we do not update the id
    if (validationErrors.id) {
      this.__lastInvalidValue = propertyValue;

      return options.setProperty(element, {}, node);
    } else {
      var properties = {};

      properties[propertyName] = propertyValue;

      return options.setProperty(element, properties, node);
    }
  };
  return textField(options, defaultParameters);
};

module.exports = validationAwareTextField;