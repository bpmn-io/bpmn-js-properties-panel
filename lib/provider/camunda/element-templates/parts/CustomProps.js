'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    getTemplate = require('../Helper').getTemplate,
    cmdHelper = require('../../../../helper/CmdHelper');

var findExtension = require('../Helper').findExtension,
    findInputParameter = require('../Helper').findInputParameter,
    findOutputParameter = require('../Helper').findOutputParameter,
    findCamundaProperty = require('../Helper').findCamundaProperty;

var createCamundaProperty = require('../CreateHelper').createCamundaProperty,
    createInputParameter = require('../CreateHelper').createInputParameter,
    createOutputParameter = require('../CreateHelper').createOutputParameter;

var BASIC_MODDLE_TYPES = [
  'Boolean',
  'Integer',
  'String'
];

var EXTENSION_BINDING_TYPES = [
  'camunda:property',
  'camunda:inputParameter',
  'camunda:outputParameter'
];

var IO_BINDING_TYPES = [
  'camunda:inputParameter',
  'camunda:outputParameter'
];

/**
 * Injects custom properties into the given group.
 *
 * @param {GroupDescriptor} group
 * @param {djs.model.Base} element
 * @param {ElementTemplates} elementTemplates
 * @param {BpmnFactory} bpmnFactory
 */
module.exports = function(group, element, elementTemplates, bpmnFactory) {

  var template = getTemplate(element, elementTemplates);

  if (!template) {
    return;
  }

  template.properties.forEach(function(p, idx) {

    var id = 'custom-' + template.id + '-' + idx;

    var propertyType = p.type;

    var entryOptions = {
      id: id,
      description: p.description,
      label: p.label,
      modelProperty: id,
      get: propertyGetter(id, p),
      set: propertySetter(id, p, bpmnFactory),
      validate: propertyValidator(id, p)
    };

    var entry;

    if (propertyType === 'Boolean') {
      entry = entryFactory.checkbox(entryOptions);
    }

    if (propertyType === 'String') {
      entry = entryFactory.textField(entryOptions);
    }

    if (propertyType === 'Text') {
      entry = entryFactory.textArea(entryOptions);
    }

    if (propertyType === 'Dropdown') {
      entryOptions.selectOptions = p.choices;

      entry = entryFactory.selectBox(entryOptions);
    }

    if (entry) {
      group.entries.push(entry);
    }
  });

};


/////// getters, setters and validators ///////////////


/**
 * Return a getter that retrieves the given property.
 *
 * @param {String} name
 * @param {PropertyDescriptor} property
 *
 * @return {Function}
 */
function propertyGetter(name, property) {

  /* getter */
  return function get(element) {
    var value = getPropertyValue(element, property);

    return objectWithKey(name, value);
  };
}

/**
 * Return a setter that updates the given property.
 *
 * @param {String} name
 * @param {PropertyDescriptor} property
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {Function}
 */
function propertySetter(name, property, bpmnFactory) {

  /* setter */
  return function set(element, values) {

    var value = values[name];

    return setPropertyValue(element, property, value, bpmnFactory);
  };
}

/**
 * Return a validator that ensures the property is ok.
 *
 * @param {String} name
 * @param {PropertyDescriptor} property
 *
 * @return {Function}
 */
function propertyValidator(name, property) {

  /* validator */
  return function validate(element, values) {
    var value = values[name];

    var error = validateValue(value, property);

    if (error) {
      return objectWithKey(name, error);
    }
  };
}


//////// get, set and validate helpers ///////////////////

/**
 * Return the value of the specified property descriptor,
 * on the passed diagram element.
 *
 * @param {djs.model.Base} element
 * @param {PropertyDescriptor} property
 *
 * @return {Any}
 */
function getPropertyValue(element, property) {

  var bo = getBusinessObject(element);

  var binding = property.binding;

  var bindingType = binding.type;

  var propertyValue = property.value || '';


  // property
  if (bindingType === 'property') {

    var value = bo.get(binding.target);

    if (binding.target === 'conditionExpression') {
      if (value) {
        return value.body;
      } else {
        // return defined default
        return propertyValue;
      }
    } else {
      // return value; default to defined default
      return typeof value !== 'undefined' ? value : propertyValue;
    }
  }

  var camundaProperties,
      camundaProperty;

  if (bindingType === 'camunda:property') {
    camundaProperties = findExtension(bo, 'camunda:Properties');

    if (camundaProperties) {
      camundaProperty = findCamundaProperty(camundaProperties, binding);

      if (camundaProperty) {
        return camundaProperty.value;
      }
    }

    return propertyValue;
  }

  var inputOutput,
      ioParameter;

  if (IO_BINDING_TYPES.indexOf(bindingType) !== -1) {
    inputOutput = findExtension(bo, 'camunda:InputOutput');

    if (!inputOutput) {
      // ioParameter cannot exist yet, return property value
      return propertyValue;
    }
  }

  // camunda input parameter
  if (bindingType === 'camunda:inputParameter') {
    ioParameter = findInputParameter(inputOutput, binding);

    if (ioParameter) {
      if (binding.scriptFormat) {
        if (ioParameter.definition) {
          return ioParameter.definition.value;
        }
      } else {
        return ioParameter.value;
      }
    }

    return propertyValue;
  }

  // camunda output parameter
  if (binding.type === 'camunda:outputParameter') {
    ioParameter = findOutputParameter(inputOutput, binding);

    if (ioParameter) {
      return ioParameter.name;
    }

    return propertyValue;
  }

  throw unknownPropertyBinding(property);
}

module.exports.getPropertyValue = getPropertyValue;


/**
 * Return an update operation that changes the
 * diagram elements custom property property to the
 * given value.
 *
 * The response of this method will be processed via
 * {@link PropertiesPanel#applyChanges}.
 *
 * @param {djs.model.Base} element
 * @param {PropertyDescriptor} property
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {Object|Array<Object>} results to be processed
 */
function setPropertyValue(element, property, value, bpmnFactory) {
  var bo = getBusinessObject(element);

  var binding = property.binding;

  var bindingType = binding.type;

  var propertyValue;

  var updates = [];


  // property
  if (bindingType === 'property') {

    if (binding.target === 'conditionExpression') {

      propertyValue = bpmnFactory.create('bpmn:FormalExpression', {
        body: value,
        language: binding.scriptFormat
      });
    } else {

      var moddlePropertyDescriptor = bo.$descriptor.propertiesByName[binding.target];

      var moddleType = moddlePropertyDescriptor.type;

      // make sure we only update String, Integer, Real and
      // Boolean properties (do not accidently override complex objects...)
      if (BASIC_MODDLE_TYPES.indexOf(moddleType) === -1) {
        throw new Error('cannot set moddle type <' + moddleType + '>');
      }

      if (moddleType === 'Boolean') {
        propertyValue = !!value;
      } else
      if (moddleType === 'Integer') {
        propertyValue = parseInt(value, 10);

        if (isNaN(propertyValue)) {
          // do not write NaN value
          propertyValue = undefined;
        }
      } else {
        propertyValue = value;
      }
    }

    if (propertyValue !== undefined) {
      updates.push(cmdHelper.updateBusinessObject(
        element, bo, objectWithKey(binding.target, propertyValue)
      ));
    }
  }

  var extensionElements;

  if (EXTENSION_BINDING_TYPES.indexOf(bindingType) !== -1) {
    extensionElements = bo.get('extensionElements');

    // create extension elements, if they do not exist (yet)
    if (!extensionElements) {
      extensionElements = bpmnFactory.create('bpmn:ExtensionElements');

      updates.push(cmdHelper.updateBusinessObject(
        element, bo, objectWithKey('extensionElements', extensionElements)
      ));
    }
  }

  // camunda:property
  var camundaProperties,
      existingCamundaProperty,
      newCamundaProperty;

  if (bindingType === 'camunda:property') {

    camundaProperties = findExtension(extensionElements, 'camunda:Properties');

    if (!camundaProperties) {
      camundaProperties = bpmnFactory.create('camunda:Properties');

      updates.push(cmdHelper.addElementsTolist(
        element, extensionElements, 'values', [ camundaProperties ]
      ));
    }

    existingCamundaProperty = findCamundaProperty(camundaProperties, binding);

    newCamundaProperty = createCamundaProperty(binding, value, bpmnFactory);

    updates.push(cmdHelper.addAndRemoveElementsFromList(
      element,
      camundaProperties,
      'values',
      null,
      [ newCamundaProperty ],
      existingCamundaProperty ? [ existingCamundaProperty ] : []
    ));
  }

  // camunda:inputParameter
  // camunda:outputParameter
  var inputOutput,
      existingIoParameter,
      newIoParameter;

  if (IO_BINDING_TYPES.indexOf(bindingType) !== -1) {

    inputOutput = findExtension(extensionElements, 'camunda:InputOutput');

    // create inputOutput element, if it do not exist (yet)
    if (!inputOutput) {
      inputOutput = bpmnFactory.create('camunda:InputOutput');

      updates.push(cmdHelper.addElementsTolist(
        element, extensionElements, 'values', inputOutput
      ));
    }
  }

  if (bindingType === 'camunda:inputParameter') {

    existingIoParameter = findInputParameter(inputOutput, binding);

    newIoParameter = createInputParameter(binding, value, bpmnFactory);

    updates.push(cmdHelper.addAndRemoveElementsFromList(
      element,
      inputOutput,
      'inputParameters',
      null,
      [ newIoParameter ],
      existingIoParameter ? [ existingIoParameter ] : []
    ));
  }

  if (bindingType === 'camunda:outputParameter') {

    existingIoParameter = findOutputParameter(inputOutput, binding);

    newIoParameter = createOutputParameter(binding, value, bpmnFactory);

    updates.push(cmdHelper.addAndRemoveElementsFromList(
      element,
      inputOutput,
      'outputParameters',
      null,
      [ newIoParameter ],
      existingIoParameter ? [ existingIoParameter ] : []
    ));
  }

  if (updates.length) {
    return updates;
  }

  // quick warning for better debugging
  console.warn('no update', element, property, value);
}

/**
 * Validate value of a given property.
 *
 * @param {String} value
 * @param {PropertyDescriptor} property
 *
 * @return {Object} with validation errors
 */
function validateValue(value, property) {

  var constraints = property.constraints || {};

  if (constraints.notEmpty && isEmpty(value)) {
    return 'Must not be empty';
  }

  if (constraints.maxLength && value.length > constraints.maxLength) {
    return 'Must have max length ' + constraints.maxLength;
  }

  if (constraints.minLength && value.length < constraints.minLength) {
    return 'Must have min length ' + constraints.minLength;
  }

  var pattern = constraints.pattern,
      message;

  if (pattern) {

    if (typeof pattern !== 'string') {
      message = pattern.message;
      pattern = pattern.value;
    }

    if (!matchesPattern(value, pattern)) {
      return message || 'Must match pattern ' + pattern;
    }
  }
}


//////// misc helpers ///////////////////////////////

/**
 * Return an object with a single key -> value association.
 *
 * @param {String} key
 * @param {Any} value
 *
 * @return {Object}
 */
function objectWithKey(key, value) {
  var obj = {};

  obj[key] = value;

  return obj;
}

/**
 * Does the given string match the specified pattern?
 *
 * @param {String} str
 * @param {String} pattern
 *
 * @return {Boolean}
 */
function matchesPattern(str, pattern) {
  var regexp = new RegExp(pattern);

  return regexp.test(str);
}

function isEmpty(str) {
  return !str || /^\s*$/.test(str);
}

/**
 * Create a new {@link Error} indicating an unknown
 * property binding.
 *
 * @param {PropertyDescriptor} property
 *
 * @return {Error}
 */
function unknownPropertyBinding(property) {
  var binding = property.binding;

  return new Error('unknown binding: <' + binding.type + '>');
}