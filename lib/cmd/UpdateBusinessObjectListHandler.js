'use strict';

var reduce = require('lodash/object/transform'),
    keys = require('lodash/object/keys'),
    forEach = require('lodash/collection/forEach'),
    findIndex = require('lodash/array/findIndex');

var is = require('bpmn-js/lib/util/ModelUtil').is;
/**
 * A handler that implements a BPMN 2.0 property update
 * for business object lists which are not represented in the
 * diagram.
 *
 * This is useful in the context of the properties panel in
 * order to update child elements of elements visible in
 * the diagram.
 *
 * Example: perform an update of a specific event definition
 * of an intermediate event.
 *
 */
function CreateBusinessObjectListHandler(elementRegistry, bpmnFactory) {
  this._elementRegistry = elementRegistry;
  this._bpmnFactory = bpmnFactory;
}

CreateBusinessObjectListHandler.$inject = [ 'elementRegistry', 'bpmnFactory' ];

module.exports = CreateBusinessObjectListHandler;

function ensureNotNull(prop, name) {
  if(!prop) {
    throw new Error(name + 'required');
  }
  return prop;
}

function ensureList(prop, name) {
  if(!prop || Object.prototype.toString.call(prop) !== '[object Array]' ) {
    throw new Error(name + ' needs to be a list');
  }
  return prop;
}

////// api /////////////////////////////////////////////

/**
 * Updates a element under a provided parent.
 *
 * @param {Object} context
 * @param {djs.model.Base} context.element which is the context for the reference
 * @param {Array} context.updatedObjectList which contains a list of objects
 * @param {moddle.referencingObject} context.referencingObject the object which creates the reference
 * @param {String} context.referenceProperty the property of the referencingObject which makes the reference
 * @param {moddle.newObject} context.newObject the new object to add
 * @param {moddle.newObjectContainer} context.newObjectContainer the container for the new object
 *
 * @return {Array<djs.mode.Base>} the updated element
 */
CreateBusinessObjectListHandler.prototype.execute = function(context) {

  var currentObject = ensureNotNull(context.currentObject, 'currentObject'),
      propertyName = ensureNotNull(context.propertyName, 'propertyName'),
      updatedObjectList = context.updatedObjectList,
      objectsToRemove = context.objectsToRemove || [],
      objectsToAdd = context.objectsToAdd || [],
      changed = [ context.element ]; // this will not change any diagram-js elements

  var objectList = currentObject[propertyName];
  // adjust array reference in the parent business object
  context.previousList = currentObject[propertyName];

  if(updatedObjectList) {
    currentObject[propertyName] = updatedObjectList;
  }
  else {
    var listCopy = [];
    // remove all objects which should be removed
    forEach(objectList, function(object) {
      if(objectsToRemove.indexOf(object) == -1) {
        listCopy.push(object);
      }
    });
    // add all objects which should be added
    listCopy = listCopy.concat(objectsToAdd);
    // set property to new list
    currentObject[propertyName] = listCopy;
  }

  context.changed = changed;

  // indicate changed on objects affected by the update
  return changed;
};

/**
 * Reverts the update
 *
 * @param  {Object} context
 *
 * @return {djs.mode.Base} the updated element
 */
CreateBusinessObjectListHandler.prototype.revert = function(context) {

  var currentObject = context.currentObject,
      propertyName = context.propertyName,
      previousList = context.previousList;

  // remove new element
  currentObject.set(propertyName, previousList);

  return context.changed;
};
