'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
    cmdHelper = require('../../../../helper/CmdHelper');

var eventDefinitionReference = require('./EventDefinitionReference'),
    elementReferenceProperty = require('./ElementReferenceProperty');


module.exports = function(group, element, bpmnFactory, escalationEventDefinition, showEscalationCodeVariable, translate) {

  group.entries = group.entries.concat(eventDefinitionReference(element, escalationEventDefinition, bpmnFactory, {
    label: translate('Escalation'),
    elementName: 'escalation',
    elementType: 'bpmn:Escalation',
    referenceProperty: 'escalationRef',
    newElementIdPrefix: 'Escalation_'
  }));


  group.entries = group.entries.concat(elementReferenceProperty(element, escalationEventDefinition, bpmnFactory, {
    id: 'escalation-element-name',
    label: translate('Escalation Name'),
    referenceProperty: 'escalationRef',
    modelProperty: 'name',
    shouldValidate: true
  }));


  group.entries = group.entries.concat(elementReferenceProperty(element, escalationEventDefinition, bpmnFactory, {
    id: 'escalation-element-code',
    label: translate('Escalation Code'),
    referenceProperty: 'escalationRef',
    modelProperty: 'escalationCode'
  }));


  if (showEscalationCodeVariable) {
    group.entries.push(entryFactory.textField({
      id : 'escalationCodeVariable',
      label : translate('Escalation Code Variable'),
      modelProperty : 'escalationCodeVariable',

      get: function(element) {
        var codeVariable = escalationEventDefinition.get('camunda:escalationCodeVariable');
        return {
          escalationCodeVariable: codeVariable
        };
      },

      set: function(element, values) {
        return cmdHelper.updateBusinessObject(element, escalationEventDefinition, {
          'camunda:escalationCodeVariable': values.escalationCodeVariable || undefined
        });
      }
    }));
  }
};
