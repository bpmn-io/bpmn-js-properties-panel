'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
    cmdHelper = require('../../../../helper/CmdHelper');

var eventDefinitionReference = require('./EventDefinitionReference'),
    elementReferenceProperty = require('./ElementReferenceProperty');


module.exports = function(group, element, bpmnFactory, errorEventDefinition, showErrorCodeVariable,
  showErrorMessageVariable) {


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


  group.entries = group.entries.concat(eventDefinitionReference(element, errorEventDefinition, bpmnFactory, {
    label: 'Error',
    elementName: 'error',
    elementType: 'bpmn:Error',
    referenceProperty: 'errorRef',
    newElementIdPrefix: 'Error_'
  }));


  group.entries = group.entries.concat(elementReferenceProperty(element, errorEventDefinition, bpmnFactory, {
    id: 'error-element-name',
    label: 'Error Name',
    referenceProperty: 'errorRef',
    modelProperty: 'name',
    shouldValidate: true
  }));


  group.entries = group.entries.concat(elementReferenceProperty(element, errorEventDefinition, bpmnFactory, {
    id: 'error-element-code',
    label: 'Error Code',
    referenceProperty: 'errorRef',
    modelProperty: 'errorCode'
  }));


  if (showErrorCodeVariable) {
    group.entries.push(entryFactory.textField({
      id : 'errorCodeVariable',
      label : 'Error Code Variable',
      modelProperty : 'errorCodeVariable',

      get: getValue('errorCodeVariable'),
      set: setValue('errorCodeVariable')
    }));
  }

  if (showErrorMessageVariable) {
    group.entries.push(entryFactory.textField({
      id : 'errorMessageVariable',
      label : 'Error Message Variable',
      modelProperty : 'errorMessageVariable',

      get: getValue('errorMessageVariable'),
      set: setValue('errorMessageVariable')
    }));
  }

};
