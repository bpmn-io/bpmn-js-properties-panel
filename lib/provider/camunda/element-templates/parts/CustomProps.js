'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
    is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    getTemplate = require('../Helper').getTemplate,
    findExtension = require('../Helper').findExtension,
    cmdHelper = require('../../../../helper/CmdHelper');

var find = require('lodash/collection/find');


module.exports = function(group, element, elementTemplates) {

  var template = getTemplate(element, elementTemplates);

  if (!template) {
    return;
  }

  if (false) {
    console.log(template, entryFactory, is, getBusinessObject, cmdHelper);
  }

  template.properties.forEach(function(p, idx) {

    var id = 'custom-' + template.id + '-' + idx;

    var entryOptions = {
      id: id,
      description: p.description,
      label: p.label,
      modelProperty: id,
      get: propertyGetter(id, p),
      set: propertySetter(id, p),
      validate: propertyValidator(id, p)
    };

    var entry;

    if (p.type === 'Boolean') {
      entry = entryFactory.checkbox(entryOptions);
    }

    if (p.type === 'String') {
      entry = entryFactory.textField(entryOptions);
    }

    if (p.type === 'Text') {
      entry = entryFactory.textArea(entryOptions);
    }

    if (entry) {
      group.entries.push(entry);
    }
  });

};


/////// helpers ////////////////////////


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
  return function(element) {

    var bo = getBusinessObject(element);

    var value = getPropertyValue(bo, property);

    return objectWithKey(name, value);
  };
}

/**
 * Return a setter that updates the given property.
 *
 * @param {String} name
 * @param {PropertyDescriptor} property
 *
 * @return {Function}
 */
function propertySetter(name, property) {

  /* setter */
  return function(element, values) {
    var value = values[name];
    console.log('set', name, value);
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
  return function(element, values) {
    console.log('validate', name, values);
  };
}


/**
 * Return the value of the specified property descriptor,
 * on the passed business object.
 *
 * @param {ModdleElement} bo
 * @param {PropertyDescriptor} property
 *
 * @return {Any}
 */
function getPropertyValue(bo, property) {

  var binding = property.binding;

  // property
  if (binding.type === 'property') {

    var value = bo.get(binding.target);

    if (binding.target === 'conditionExpression') {
      if (value) {
        return value.body;
      } else {
        // return defined default
        return property.value;
      }
    } else {
      // return value; default to defined default
      return typeof value !== 'undefined' ? value : property.value;
    }
  }

  var camundaProperties,
      camundaProperty;

  if (binding.type === 'camunda:property') {
    camundaProperties = findExtension(bo, 'camunda:Properties');

    if (camundaProperties) {
      camundaProperty = find(camundaProperties.values, function(p) {
        return p.name === binding.name;
      });

      if (camundaProperty) {
        return camundaProperty.value;
      }
    }

    return property.value || '';
  }

  var inputOutput,
      parameter;

  // camunda input parameter
  if (binding.type === 'camunda:inputParameter') {
    inputOutput = findExtension(bo, 'camunda:InputOutput');

    if (inputOutput) {

      parameter = find(inputOutput.inputParameters, function(p) {
        return p.name === binding.target;
      });

      if (parameter) {
        if (binding.scriptFormat) {
          if (parameter.definition) {
            return parameter.definition.value;
          }
        } else {
          return parameter.value;
        }
      }
    }

    // default to property value
    return property.value;
  }

  // camunda output parameter
  if (binding.type === 'camunda:outputParameter') {
    inputOutput = findExtension(bo, 'camunda:InputOutput');

    if (inputOutput) {

      parameter = find(inputOutput.outputParameters, function(p) {
        var script;

        if (binding.scriptFormat) {
          script = p.definition;

          return (
            script.scriptFormat === binding.scriptFormat &&
            // scriptValue ?
            script.value === binding.source
          );
        } else {
          return p.value === binding.source;
        }
      });

      if (parameter) {
        return parameter.name;
      }
    }

    return property.value;
  }

  throw new Error('unknown descriptor binding: <' + binding.type + '>');
}

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