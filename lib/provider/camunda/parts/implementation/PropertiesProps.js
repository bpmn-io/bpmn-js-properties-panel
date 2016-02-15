'use strict';

var factory = require('../../../../factory/EntryFactory');

var elementHelper = require('../../../../helper/ElementHelper'),
    cmdHelper = require('../../../../helper/CmdHelper'),
    utils = require('../../../../Utils');

var assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach');

function generatePropertyId() {
  return utils.nextId('Property_');
}

/**
 * Get all camunda:property objects for a specific business object
 *
 * @param  {ModdleElement} parent
 *
 * @return {Array<ModdleElement>} a list of camunda:property objects
 */
function getProperties(parent) {
  if(parent && parent.properties && parent.properties.values) {
    return parent.properties.values;
  }
  return [];
}

/**
 * Create a camunda:property entry using tableEntryFactory
 *
 * @param  {djs.model.Base} element
 * @param  {BpmnFactory} bpmnFactory
 * @param  {Object} options
 *
 * @return {string} options.id
 * @return {Array<string>} options.modelProperties
 * @return {Array<string>} options.labels
 * @return {function} options.getParent Gets the parent business object
 * @return {function} options.show Indicate when the entry will be shown, should return boolean
 */
module.exports = function(element, bpmnFactory, options) {

  var getParent = options.getParent;

  var modelProperties = options.modelProperties;

  assign(options, {
    addLabel: 'Add Property',
    getElements: function(element, node) {
      var parent = getParent(element, node);
      return getProperties(parent);
    },
    addElement: function(element, node) {
      var commands = [],
          parent = getParent(element, node),
          properties = parent.properties,
          propertyProps = {};

      forEach(modelProperties, function(prop) {
        propertyProps[prop] = undefined;
      });

      // create id if necessary
      if (modelProperties.indexOf('id') >= 0) {
        propertyProps.id = generatePropertyId();
      }

      if (!properties) {
        properties = elementHelper.createElement('camunda:Properties', {}, parent, bpmnFactory);
        commands.push(cmdHelper.updateBusinessObject(element, parent, { 'properties': properties }));
      }

      var property = elementHelper.createElement('camunda:Property', propertyProps, properties, bpmnFactory);
      commands.push(cmdHelper.addElementsTolist(element, properties, 'values', [ property ]));

      return commands;
    },
    updateElement: function(element, value, node, idx) {
      var parent = getParent(element, node),
          property = getProperties(parent)[idx];

      forEach(modelProperties, function(prop) {
        value[prop] = value[prop] || undefined;
      });

      return cmdHelper.updateBusinessObject(element, property, value);
    },
    validate: function(element, value, node, idx) {
      // validate id if necessary
      if (modelProperties.indexOf('id') >= 0) {

        var parent = getParent(element, node),
            properties = getProperties(parent),
            property = properties[idx];

        if (property) {
          // check if id is valid
          var validationError = utils.isIdValid(property, value.id);

          if (validationError) {
            return { id: validationError };
          }
        }
      }
    },
    removeElement: function(element, node, idx) {
      var commands = [],
          parent = getParent(element, node),
          propertyValues = getProperties(parent),
          currentProperty = propertyValues[idx];

      commands.push(cmdHelper.removeElementsFromList(element, parent.properties, 'values', null, [ currentProperty ]));

      if (propertyValues.length === 1) {
        // remove camunda:properties if the last existing property has been removed
        commands.push(cmdHelper.updateBusinessObject(element, parent, { properties: undefined }));
      }

      return commands;
    }
  });

  return factory.table(options);
};
