'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
    cmdHelper = require('../../../../helper/CmdHelper');

var eventDefinitionReference = require('./EventDefinitionReference'),
    elementReferenceProperty = require('./ElementReferenceProperty');


module.exports = function(group, element, bpmnFactory, errorEventDefinition, showErrorCodeVariable) {

  group.entries = group.entries.concat(eventDefinitionReference(element, errorEventDefinition, bpmnFactory, {
    label: 'Error',
    description: 'Configure the error element',
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

      get: function(element) {
        var codeVariable = errorEventDefinition.get('camunda:errorCodeVariable');
        return {
          errorCodeVariable: codeVariable
        };
      },

      set: function(element, values) {
        return cmdHelper.updateBusinessObject(element, errorEventDefinition, {
          'camunda:errorCodeVariable': values.errorCodeVariable || undefined
        });
      }
    }));
  }
};
