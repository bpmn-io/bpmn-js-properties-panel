'use strict';

var ModelUtil = require('bpmn-js/lib/util/ModelUtil'),
  is = ModelUtil.is,
  getBusinessObject = ModelUtil.getBusinessObject;

var find = require('lodash/collection/find');

var elementHelper = require('../../../helper/ElementHelper'),
  extensionElementsHelper = require('../../../helper/ExtensionElementsHelper'),
  cmdHelper = require('../../../helper/CmdHelper'),
  utils = require('../../../Utils');

var extensionElementsEntry = require('./implementation/ExtensionElements'),
  entryFactory = require('../../../factory/EntryFactory');


function getElements(bo, type, prop) {
  var elems = extensionElementsHelper.getExtensionElements(bo, type) || [];
  return !prop ? elems : (elems[0] || {})[prop] || [];
}

function createElement(type, properties, parent, factory) {
  return elementHelper.createElement(type, properties, parent, factory);
}


module.exports = function (group, element, bpmnFactory) {

  var createProperties = function (parent, properties) {
    return createElement('camunda:Properties', properties, parent, bpmnFactory);
  };

  var createProperty = function (type, parent, properties) {
    return createElement(type, properties, parent, bpmnFactory);
  };

  var getProperties = function (bo) {
    return getElements(bo, 'camunda:Properties', 'values');
  };

  var isSelected = function (element, node) {
    return getSelection(element, node);
  };

  var getSelection = function (element, node) {
    var parentNode = node.parentNode;
    var selection = propertyEntry.getSelection(element, parentNode);

    var bo = getBusinessObject(element);

    var matcher = function (selection) {
      return function (elem) {
        return elem.name === selection.value;
      };
    };

    if (selection.value) {
      return find(getProperties(bo), matcher(selection));
    }
    else {

    }

  };

  var newElement = function (type, prop) {

    return function (element, extensionElements, value) {
      var bo = getBusinessObject(element);

      var result = {};

      var properties = (getElements(bo, 'camunda:Properties') || [])[0];

      if (!properties) {
        properties = createProperties(extensionElements, {properties: []});
        extensionElements.values.push(properties);
        result.cmd = cmdHelper.addAndRemoveElementsFromList(
          element,
          extensionElements,
          'values',
          'extensionElements',
          [properties],
          []
        );
      }

      var newElem = result.newElement = createProperty(type, properties, {name: value, value: ''});

      if (result.cmd) {
        properties.get(prop).push(newElem);
      }
      else {
        result.cmd = cmdHelper.addAndRemoveElementsFromList(element, properties, prop, null, [newElem], []);
      }

      return result;
    };
  };


  // property parameters ///////////////////////////////////////////////////////////////

  var propertyEntry = extensionElementsEntry(element, bpmnFactory, {
    id: 'properties',
    label: 'Properties',
    modelProperty: 'name',
    prefix: 'Property',
    resizable: true,

    createExtensionElement: newElement('camunda:Property', 'values'),

    getExtensionElements: function (bo) {
      return getProperties(bo);
    }
  });
  group.entries.push(propertyEntry);

  // property name ////////////////////////////////////////////////////////

  group.entries.push(entryFactory.textField({
    id: 'property-name',
    label: 'Name',
    modelProperty: 'name',
    get: function (element, node) {
      var name = this.__lastInvalidName;

      delete this.__lastInvalidName;

      return {
        name: typeof name !== 'undefined' ? name : (getSelection(element, node) || {}).name
      };
    },

    set: function (element, values, node) {
      var validationErrors = this.validate(element, values, node),
        name = values.name;

      // make sure we do not update the name
      if (validationErrors.name) {
        this.__lastInvalidName = name;
        return {};
      } else {
        var param = getSelection(element, node);
        return cmdHelper.updateBusinessObject(element, param, values);
      }

    },

    validate: function (element, values, node) {
      var bo = getSelection(element, node);

      var validation = {};
      if (bo) {
        var nameValue = values.name || this.__lastInvalidName;

        if (nameValue) {
          if (utils.containsSpace(nameValue)) {
            validation.name = 'Name must not contain spaces';
          }
        }
        else {
          validation.name = 'Property must have a name';
        }
      }

      return validation;
    },

    disabled: function (element, node) {
      return !isSelected(element, node);
    }
  }));

  // property value (type = text) ///////////////////////////////////////////////////////

  group.entries.push(entryFactory.textArea({
    id: 'property-value',
    label: 'Value',
    modelProperty: 'value',
    get: function (element, node) {
      return {
        value: (getSelection(element, node) || {}).value
      };
    },

    set: function (element, values, node) {
      var param = getSelection(element, node);
      values.value = values.value || undefined;
      return cmdHelper.updateBusinessObject(element, param, values);
    },

    show: function (element, node) {
      var bo = getSelection(element, node);
      return bo && !bo.definition;
    }
  }));

};
