'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
    cmdHelper = require('../../../../helper/CmdHelper'),
    elementReferenceProperty = require('../../../bpmn/parts/implementation/ElementReferenceProperty');

module.exports = function(
    group, element, bpmnFactory, errorEventDefinition,
    showErrorCodeVariable, showErrorMessageVariable, translate
) {


  var getValue = function(modelProperty) {
    return function(element) {
      var modelPropertyValue = errorEventDefinition.get('camunda:' + modelProperty);
      var value = {};

      value[modelProperty] = modelPropertyValue;
      return value;
    };
  };

  var setValue = function(modelProperty) {
    return function(element, values) {
      var props = {};

      props['camunda:' + modelProperty] = values[modelProperty] || undefined;

      return cmdHelper.updateBusinessObject(element, errorEventDefinition, props);
    };
  };


  group.entries = group.entries.concat(
    elementReferenceProperty(element, errorEventDefinition, bpmnFactory, {
      id: 'error-element-message',
      label: translate('Error Message'),
      referenceProperty: 'errorRef',
      modelProperty: 'errorMessage'
    })
  );

  if (showErrorCodeVariable) {
    group.entries.push(entryFactory.textField({
      id: 'errorCodeVariable',
      label: translate('Error Code Variable'),
      modelProperty : 'errorCodeVariable',

      get: getValue('errorCodeVariable'),
      set: setValue('errorCodeVariable')
    }));
  }

  if (showErrorMessageVariable) {
    group.entries.push(entryFactory.textField({
      id: 'errorMessageVariable',
      label: translate('Error Message Variable'),
      modelProperty: 'errorMessageVariable',

      get: getValue('errorMessageVariable'),
      set: setValue('errorMessageVariable')
    }));
  }

};
