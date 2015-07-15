'use strict';

var reduce = require('lodash/object/transform'),
    keys = require('lodash/object/keys'),
    forEach = require('lodash/collection/forEach');

var creationHelper = require('../helper/ElementCreationHelper');

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
 */
function CreateAndReferenceElementHandler(elementRegistry, bpmnFactory) {
  this._elementRegistry = elementRegistry;
  this._bpmnFactory = bpmnFactory;
}

CreateAndReferenceElementHandler.$inject = [ 'elementRegistry', 'bpmnFactory' ];

module.exports = CreateAndReferenceElementHandler;

function ensureNotNull(prop, name) {
  if(!prop) {
    throw new Error(name + 'required');
  }
  return prop;
}

////// api /////////////////////////////////////////////

/**
 * Creates a new element under a provided parent and updates / creates a reference to it in
 * one atomic action.
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
CreateAndReferenceElementHandler.prototype.execute = function(context) {

  var referencingObject = ensureNotNull(context.referencingObject, 'referencingObject'),
      referenceProperty = ensureNotNull(context.referenceProperty, 'referenceProperty'),
      newObject = ensureNotNull(context.newObject, 'newObject'),
      newObjectContainer = ensureNotNull(context.newObjectContainer, 'newObjectContainer'),
      newObjectParent = ensureNotNull(context.newObjectParent, 'newObjectParent'),
      changed = [ context.element ]; // this will not change any diagram-js elements

  // create new object
  var referencedObject = creationHelper.createElement(newObject.type, newObject.properties, newObjectParent, this._bpmnFactory);
  context.referencedObject = referencedObject;

  // add to containing list
  newObjectContainer.push(referencedObject);

  // adjust reference attribute
  context.previousReference = referencingObject[referenceProperty];
  referencingObject[referenceProperty] = referencedObject;

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
CreateAndReferenceElementHandler.prototype.revert = function(context) {

  var referencingObject = context.referencingObject,
      referenceProperty = context.referenceProperty,
      previousReference = context.previousReference,
      referencedObject = context.referencedObject,
      newObjectContainer = context.newObjectContainer;

  // reset reference
  referencingObject.set(referenceProperty, previousReference);

  // remove new element
  newObjectContainer.splice(newObjectContainer.indexOf(referencedObject), 1);

  return context.changed;
};
