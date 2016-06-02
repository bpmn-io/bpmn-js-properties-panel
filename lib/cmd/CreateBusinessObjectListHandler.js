'use strict';

var forEach = require('lodash/collection/forEach');

var elementHelper = require('../helper/ElementHelper');

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
function CreateBusinessObjectListHandler(elementRegistry, bpmnFactory) {
  this._elementRegistry = elementRegistry;
  this._bpmnFactory = bpmnFactory;
}

CreateBusinessObjectListHandler.$inject = [ 'elementRegistry', 'bpmnFactory' ];

module.exports = CreateBusinessObjectListHandler;

function ensureNotNull(prop, name) {
  if (!prop) {
    throw new Error(name + ' required');
  }
  return prop;

}
function ensureList(prop, name) {
  if (!prop || Object.prototype.toString.call(prop) !== '[object Array]' ) {
    throw new Error(name + ' needs to be a list');
  }
  return prop;
}

////// api /////////////////////////////////////////////

/**
 * Creates a new element under a provided parent and updates / creates a reference to it in
 * one atomic action.
 *
 * @method  CreateBusinessObjectListHandler#execute
 *
 * @param {Object} context
 * @param {djs.model.Base} context.element which is the context for the reference
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
      newObjects = ensureList(context.newObjects, 'newObjects'),
      changed = [ context.element ]; // this will not change any diagram-js elements


  var childObjects = [];
  var self = this;

  // create new array of business objects
  forEach(newObjects, function(obj) {
    var element = elementHelper.createElement(obj.type, obj.properties, currentObject, self._bpmnFactory);

    childObjects.push(element);
  });
  context.childObject = childObjects;

  // adjust array reference in the parent business object
  context.previousChilds = currentObject[propertyName];
  currentObject[propertyName] = childObjects;

  context.changed = changed;

  // indicate changed on objects affected by the update
  return changed;
};

/**
 * Reverts the update
 *
 * @method  CreateBusinessObjectListHandler#revert
 *
 * @param {Object} context
 *
 * @return {djs.mode.Base} the updated element
 */
CreateBusinessObjectListHandler.prototype.revert = function(context) {

  var currentObject = context.currentObject,
      propertyName = context.propertyName,
      previousChilds = context.previousChilds;

  // remove new element
  currentObject.set(propertyName, previousChilds);

  return context.changed;
};
