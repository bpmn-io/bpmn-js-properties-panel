'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
    cmdHelper = require('../../../../helper/CmdHelper'),
    elementReferenceProperty = require('../../../bpmn/parts/implementation/ElementReferenceProperty'),
    utils = require('../../../../Utils');

module.exports = function(
    group, element, bpmnFactory, errorEventDefinition,
    showErrorCodeVariable, showErrorMessageVariable, translate
) {


  var getValue = function(modelProperty) {
    return function(element) {
      var modelPropertyValue = errorEventDefinition.get('camunda:' + modelProperty);

      return modelPropertyValue;
    };
  };

  var setValue = function(modelProperty) {
    return function(element, values) {
      if (values[modelProperty] === '')
        values[modelProperty] = undefined;

      return cmdHelper.updateBusinessObject(element, errorEventDefinition, values);
    };
  };


  group.entries = group.entries.concat(
    elementReferenceProperty(element, errorEventDefinition, bpmnFactory, translate, {
      id: 'error-element-message',
      label: translate('Message'),
      referenceProperty: 'errorRef',
      modelProperty: 'errorMessage'
    })
  );

  if (showErrorCodeVariable) {
    group.entries.push(entryFactory.validationAwareTextField(translate, {
      id: 'errorCodeVariable',
      label: translate('Code Variable'),
      modelProperty : 'errorCodeVariable',
      description: translate('Define the name of the variable that will contain the error code'),

      getProperty: getValue('errorCodeVariable'),
      setProperty: setValue('errorCodeVariable'),

      validate: function(element, values) {
        var validation = {},
            targetValue = values.errorCodeVariable;

        if (utils.containsSpace(targetValue)) {
          validation.errorCodeVariable = translate('Error code variable must not contain spaces.');
        }

        return validation;
      }
    }));
  }

  if (showErrorMessageVariable) {
    group.entries.push(entryFactory.validationAwareTextField(translate, {
      id: 'errorMessageVariable',
      label: translate('Message Variable'),
      modelProperty: 'errorMessageVariable',

      getProperty: getValue('errorMessageVariable'),
      setProperty: setValue('errorMessageVariable'),
      description: translate('Define the name of the variable that will contain the error message'),

      validate: function(element, values) {
        var validation = {},
            targetValue = values.errorMessageVariable;

        if (utils.containsSpace(targetValue)) {
          validation.errorMessageVariable = translate('Error message variable must not contain spaces.');
        }

        return validation;
      }
    }));
  }

};
