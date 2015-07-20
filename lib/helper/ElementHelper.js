'use strict';

var forEach = require('lodash/collection/forEach'),
    remove = require('lodash/array/remove');

var is = require('bpmn-js/lib/util/ModelUtil').is;

var ElementHelper = {};
module.exports = ElementHelper;

/**
 * Creates a new element and set the parent to it
 *
 * @param {String} elementType of the new element
 * @param {Object} properties of the new element in key-value pairs
 * @param {moddle.object} parent of the new element
 * @param {BpmnFactory} factory which creates the new element
 * @returns {djs.model.Base} element which is created
 */
ElementHelper.createElement = function(elementType, properties, parent, factory) {
  var element = factory.create(elementType, properties);
  element.$parent = parent;

  return element
};

/**
 *
 * Removes an element
 *
 * @param {Object} options
 * @param options.businessObject
 * @param {String} options.propertyName
 * @param {String} options.elementType
 * @param {Object} options.value
 * @param {String} options.value.name
 * @param {String|Boolean} options.value.value
 */
ElementHelper.removeElement = function(options) {
  var businessObject = options.businessObject,
      propertyName = options.propertyName,
      elementType = options.elementType,
      value      = options.value,
      hasValue  = typeof value === 'object';

  if(!businessObject) throw new Error('businessObject is required');
  if(!propertyName) throw new Error('propertyName is required');
  if(!elementType) throw new Error('elementType is required');

  if(value) {
    if(!value.name) throw new Error('value.name is required');
    if(!value.value) throw new Error('value.value is required');
  }

  var removingObject = businessObject.get(propertyName);


  if(Object.prototype.toString.call(removingObject) === '[object Array]') {
    remove(removingObject, function(obj) {
      // TODO: Waiting for https://github.com/bpmn-io/moddle-xml/issues/8 to remove the typeof check
      var isElement = (typeof obj.$instanceOf === 'function' && is(obj, elementType));
      if(isElement) {
          return (hasValue) ? obj[value.name] === value.value : true;
      } else {
        return false;
      }
    });

    businessObject.set(propertyName, removingObject);
  }

  if(typeof removingObject === 'string' || typeof removingObject === 'boolean') {
    businessObject.set(propertyName, undefined);
  }

  return businessObject;

};

/**
 *
 * @param element
 * @param businessObject
 * @param propertyName
 * @param listOfNewObjects
 */
ElementHelper.createListCreateContext = function(element, businessObject, propertyName, listOfNewObjects) {
  return {
    cmd: 'properties-panel.create-businessobject-list',
    context: {
      element: element,
      currentObject: businessObject,
      propertyName: propertyName,
      newObjects: listOfNewObjects
    }
  }
};

/**
 *
 * @param {djs.model.Base} element which should be updated
 * @param {moddle.object} businessObject which should be updated
 * @param {String} propertyName of the property which should be updated
 * @param {Array} listOfUpdatedElements containing all elements which should be updated
 * @param {moddle.Object} listOfUpdatedElements.old element which should be replaced
 * @param {moddle.Object} listOfUpdatedElements.new element which should replace the old one
 * @returns {{cmd: string, context: {element: *, currentObject: *, propertyName: *, updatedObjectList: *}}}
 */
ElementHelper.createListUpdateContext = function(element, businessObject, propertyName, listOfUpdatedElements) {
  return {
    cmd: 'properties-panel.update-businessobject-list',
    context: {
      element: element,
      currentObject: businessObject,
      propertyName: propertyName,
      updatedObjectList: listOfUpdatedElements
    }
  };
};

/**
 * Create the context for an update of a businessObject
 * @param {djs.model.Base} element which should be updated
 * @param {moddle.Object} businessObject which should be updated
 * @param {String} propertyName of the property which should be updated
 * @param {Array} listOfNewElements which should be inserted
 * @returns {{cmd: string, context: {element: *, businessObject: *, properties: {values: *}}}}
 */
ElementHelper.createElementUpdateContext = function(element, businessObject, propertyName, listOfNewElements) {
  var properties = {};




  if(typeof listOfNewElements === 'string' || typeof listOfNewElements === 'boolean') {
    properties[propertyName] = listOfNewElements;
  }

  if(Object.prototype.toString.call(listOfNewElements) === '[object Array]') {
    var property = businessObject.get(propertyName);
    forEach(listOfNewElements, function(newElement) {
      property.push(newElement);
    });

    properties[propertyName] = property;
  }

  if(typeof listOfNewElements === 'undefined') {
    if(typeof propertyName === 'object') {
      properties = propertyName;
    } else if(typeof propertyName === 'string') {
      properties[propertyName] = listOfNewElements;
    } else {
      throw new Error('When listOfNewElements is undefined you need to provide an [Object] for propertyName');
    }
  }

  return {
    cmd: 'properties-panel.update-businessobject',
    context: {
      element: element,
      businessObject: businessObject,
      properties: properties
    }
  }
};

