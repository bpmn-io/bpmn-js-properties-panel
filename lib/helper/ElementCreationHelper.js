'use strict';

var ElementCreationHelper = {};
module.exports = ElementCreationHelper;

/**
 * Creates a new element and set the parent to it
 * @param elementType
 * @param properties
 * @param elementParent
 * @param factory
 * @returns {elementType}
 */
ElementCreationHelper.createElement = function(elementType, properties, elementParent, factory) {
  var element = factory.create(elementType, properties);
  element.$parent = elementParent;

  return element
};