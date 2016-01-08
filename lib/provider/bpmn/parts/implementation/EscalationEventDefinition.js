'use strict';

var domQuery = require('min-dom/lib/query'),
    entryFactory = require('../../../../factory/EntryFactory'),
    cmdHelper = require('../../../../helper/CmdHelper');


function EscalationEventDefinition(group, element, bpmnFactory, escalationEventDefinition, showEscalationCodeVariable) {
  group.entries.push(entryFactory.referenceCombobox({
    id: 'selectEscalation',
    description: '',
    label: 'Escalation Definition',
    businessObject: escalationEventDefinition,
    referencedType: 'bpmn:Escalation',
    referenceProperty: 'escalationRef',
    referencedObjectToString: function(obj) {
      return obj.name + ' (id=' + obj.id + ')';
    }
  }));

  group.entries.push({
    'id': 'escalationDefinition',
    'description': 'Configure the escalation element',
    label: 'Escalation Definition',
    'html': '<div class="pp-row" data-show=isEscalationCodeSelected>' +
              '<label for="cam-escalation-name">Escalation Name</label>' +
              '<div class="pp-field-wrapper">' +
                '<input id="cam-escalation-name" type="text" name="escalationName" />' +
                '<button data-action="clearEscalationName" data-show="canClearEscalationName">' +
                  '<span>X</span>' +
                '</button>' +
              '</div>' +
            '</div>' +

            '<div class="pp-row" data-show=isEscalationCodeSelected>' +
              '<label for="cam-escalation-code">Escalation Code</label>' +
              '<div class="pp-field-wrapper">' +
                '<input id="cam-escalation-code" type="text" name="escalationCode" />' +
                '<button data-action="clearEscalationCode" data-show="canClearEscalationCode">' +
                  '<span>X</span>' +
                '</button>' +
              '</div>' +
            '</div>',

    get: function(element) {
      var values = {};

      var boEscalation = escalationEventDefinition.get('escalationRef');
      if (boEscalation) {
        values.escalationCode = boEscalation.get('escalationCode');
        values.escalationName = boEscalation.get('name');
      }

      return values;
    },
    set: function(element, values) {
      var update = {
        'escalationCode' : undefined
      };

      var boEscalation = escalationEventDefinition.get('escalationRef');
      update.escalationCode = values.escalationCode;
      update.name = values.escalationName;

      return cmdHelper.updateBusinessObject(element, boEscalation, update);
    },
    validate: function(element, values) {
      var escalationName = values.escalationName;

      var validationResult = {};

      if(!escalationName) {
        validationResult.escalationName = 'Must provide a value.';
      }

      return validationResult;

    },
    clearEscalationName: function(element, inputNode) {
      // clear text input
      domQuery('input[name=escalationName]', inputNode).value='';

      return true;
    },
    canClearEscalationName: function(element, inputNode) {
      var input = domQuery('input[name=escalationName]', inputNode);

      return input.value !== '';
    },
    clearEscalationCode: function(element, inputNode) {
      // clear text input
      domQuery('input[name=escalationCode]', inputNode).value='';

      return true;
    },
    canClearEscalationCode: function(element, inputNode) {
      var input = domQuery('input[name=escalationCode]', inputNode);

      return input.value !== '';
    },
    isEscalationCodeSelected: function(element, node) {
      var escalationComboBox = domQuery('input[name=escalationRef]', node.parentElement);
      if (escalationComboBox.value) {
        return true;
      } else {
        return false;
      }
    },

    cssClasses: ['pp-textfield']
  });

  if (showEscalationCodeVariable) {
    group.entries.push(entryFactory.textField({
      id : 'escalationCodeVariable',
      description : '',
      label : 'Escalation Code Variable',
      modelProperty : 'escalationCodeVariable',
      get: function(element) {
        var values = {};

        var boEscalationCodeVariable = escalationEventDefinition.get('camunda:escalationCodeVariable');
        if (boEscalationCodeVariable) {
          values.escalationCodeVariable = boEscalationCodeVariable;
        }

        return values;
      },
      set: function(element, values) {
        var update = {
          'camunda:escalationCodeVariable' : undefined
        };

        update['camunda:escalationCodeVariable'] = values.escalationCodeVariable;

        return cmdHelper.updateBusinessObject(element, escalationEventDefinition, update);
      }
    }));
  }
}

module.exports = EscalationEventDefinition;
