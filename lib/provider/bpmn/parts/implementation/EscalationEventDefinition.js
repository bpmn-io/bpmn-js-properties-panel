'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
    cmdHelper = require('../../../../helper/CmdHelper'),
    utils = require('../../../../Utils');

var eventDefinitionReference = require('./EventDefinitionReference'),
    elementReferenceProperty = require('./ElementReferenceProperty');


module.exports = function(group, element, bpmnFactory, escalationEventDefinition, showEscalationCodeVariable, translate) {

  group.entries = group.entries.concat(eventDefinitionReference(element, escalationEventDefinition, bpmnFactory, {
    label: translate('Global Escalation referenced'),
    elementName: 'escalation',
    elementType: 'bpmn:Escalation',
    referenceProperty: 'escalationRef',
    newElementIdPrefix: 'Escalation_'
  }));


  group.entries = group.entries.concat(
    elementReferenceProperty(element, escalationEventDefinition, bpmnFactory, translate, {
      id: 'escalation-element-name',
      label: translate('Global Escalation Name'),
      referenceProperty: 'escalationRef',
      modelProperty: 'name',
      shouldValidate: true
    })
  );


  group.entries = group.entries.concat(
    elementReferenceProperty(element, escalationEventDefinition, bpmnFactory, translate, {
      id: 'escalation-element-code',
      label: translate('Global Escalation Code'),
      referenceProperty: 'escalationRef',
      modelProperty: 'escalationCode'
    })
  );


  if (showEscalationCodeVariable) {
    group.entries.push(entryFactory.validationAwareTextField(translate, {
      id : 'escalationCodeVariable',
      label : translate('Escalation Code Variable'),
      modelProperty : 'escalationCodeVariable',
      description: translate('Define the name of the variable that will contain the escalation code'),

      getProperty: function(element) {
        var codeVariable = escalationEventDefinition.get('camunda:escalationCodeVariable');

        return codeVariable;
      },

      setProperty: function(element, values) {
        if (values.escalationCodeVariable === '')
          values.escalationCodeVariable = undefined;

        return cmdHelper.updateBusinessObject(element, escalationEventDefinition, values);
      },

      validate: function(element, values) {
        var validation = {},
            targetValue = values.escalationCodeVariable;

        if (utils.containsSpace(targetValue)) {
          validation.escalationCodeVariable = translate('Escalation code variable must not contain spaces.');
        }

        return validation;
      }
    }));
  }
};
