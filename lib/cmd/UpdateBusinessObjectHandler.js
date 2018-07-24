'use strict';

var reduce = require('lodash/transform'),
    is = require('bpmn-js/lib/util/ModelUtil').is,
    keys = require('lodash/keys'),
    forEach = require('lodash/forEach');

/**
 * A handler that implements a BPMN 2.0 property update
 * for business objects which are not represented in the
 * diagram.
 *
 * This is useful in the context of the properties panel in
 * order to update child elements of elements visible in
 * the diagram.
 *
 * Example: perform an update of a specific event definition
 * of an intermediate event.
 *
 * @class
 * @constructor
 */
function UpdateBusinessObjectHandler(elementRegistry) {
  this._elementRegistry = elementRegistry;
}

UpdateBusinessObjectHandler.$inject = [ 'elementRegistry' ];

module.exports = UpdateBusinessObjectHandler;

/**
 * returns the root element
 */
function getRoot(businessObject) {
  var parent = businessObject;
  while (parent.$parent) {
    parent = parent.$parent;
  }
  return parent;
}

function getProperties(businessObject, propertyNames) {
  return reduce(propertyNames, function(result, key) {
    result[key] = businessObject.get(key);
    return result;
  }, {});
}


function setProperties(businessObject, properties) {
  forEach(properties, function(value, key) {
    businessObject.set(key, value);
  });
}


// api /////////////////////////////////////////////

/**
 * Updates a business object with a list of new properties
 *
 * @method  UpdateBusinessObjectHandler#execute
 *
 * @param {Object} context
 * @param {djs.model.Base} context.element the element which has a child business object updated
 * @param {moddle.businessObject} context.businessObject the businessObject to update
 * @param {Object} context.properties a list of properties to set on the businessObject
 *
 * @return {Array<djs.mode.Base>} the updated element
 */
UpdateBusinessObjectHandler.prototype.execute = function(context) {

  var element = context.element,
      businessObject = context.businessObject,
      rootElements = getRoot(businessObject).rootElements,
      referenceType = context.referenceType,
      referenceProperty = context.referenceProperty,
      changed = [ element ]; // this will not change any diagram-js elements

  if (!element) {
    throw new Error('element required');
  }

  if (!businessObject) {
    throw new Error('businessObject required');
  }

  var properties = context.properties,
      oldProperties = context.oldProperties || getProperties(businessObject, keys(properties));

  // check if there the update needs an external element for reference
  if (typeof referenceType !== 'undefined' && typeof referenceProperty !== 'undefined') {
    forEach(rootElements, function(rootElement) {
      if (is(rootElement, referenceType)) {
        if (rootElement.id === properties[referenceProperty]) {
          properties[referenceProperty] = rootElement;
        }
      }
    });
  }

  // update properties
  setProperties(businessObject, properties);

  // store old values
  context.oldProperties = oldProperties;
  context.changed = changed;

  // indicate changed on objects affected by the update
  return changed;
};

/**
 * Reverts the update
 *
 * @method  UpdateBusinessObjectHandler#revert
 *
 * @param {Object} context
 *
 * @return {djs.mode.Base} the updated element
 */
UpdateBusinessObjectHandler.prototype.revert = function(context) {

  var oldProperties = context.oldProperties,
      businessObject = context.businessObject;

  // update properties
  setProperties(businessObject, oldProperties);

  return context.changed;
};
