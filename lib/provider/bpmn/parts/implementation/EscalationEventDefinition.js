'use strict';

var domQuery = require('min-dom/lib/query'),
    entryFactory = require('../../../../factory/EntryFactory'),
    cmdHelper = require('../../../../helper/CmdHelper'),
    forEach = require('lodash/collection/forEach'),
    domAttr = require('min-dom/lib/attr'),
    elementHelper = require('../../../../helper/ElementHelper'),
    domify = require('min-dom/lib/domify'),

    utils = require('../../../../Utils');


function EscalationEventDefinition(group, element, bpmnFactory, escalationEventDefinition, showEscalationCodeVariable) {
  group.entries.push({
    'id': 'escalationDefinition',
    'description': 'Configure the escalation element',
    label: 'Escalation Definition',
    'html': '<div class="pp-row">' +
              '<label for="camunda-escalation">Escalations</label>' +
              '<div class="field-wrapper">' +
                '<select id="camunda-escalation" name="escalations" data-value>' +
                '</select>' +
                '<button id="addEscalation" data-action="addEscalation"><span>+</span></button>' +
              '</div>' +
            '</div>' +

            '<div class="pp-row" data-show=isEscalationCodeSelected>' +
              '<label for="cam-escalation-name">Escalation Name</label>' +
              '<div class="pp-field-wrapper">' +
                '<input id="cam-escalation-name" type="text" name="escalationName" />' +
                '<button class="clear" data-action="clearEscalationName" data-show="canClearEscalationName">' +
                  '<span>X</span>' +
                '</button>' +
              '</div>' +
            '</div>' +

            '<div class="pp-row" data-show=isEscalationCodeSelected>' +
              '<label for="cam-escalation-code">Escalation Code</label>' +
              '<div class="pp-field-wrapper">' +
                '<input id="cam-escalation-code" type="text" name="escalationCode" />' +
                '<button class="clear" data-action="clearEscalationCode" data-show="canClearEscalationCode">' +
                  '<span>X</span>' +
                '</button>' +
              '</div>' +
            '</div>',

    addEscalation: function(element, inputNode) {
      var update = {};

      // create new empty escalation
      var newEscalation = elementHelper.createElement('bpmn:Escalation', {}, utils.getRoot(escalationEventDefinition), 
                                                       bpmnFactory);
      var optionTemplate = domify('<option value="' + newEscalation.id + '"> (id='+newEscalation.id+')' + '</option>');

      var existingEscalations = domQuery('select[name=escalations]', inputNode.parentElement);
      // add new option
      existingEscalations.insertBefore(optionTemplate, existingEscalations.firstChild);
      // select new escalation in the escalation select box
      forEach(existingEscalations, function(escalation) {
        if (escalation.value === newEscalation.id) {
          domAttr(escalation, 'selected', 'selected');
        } else {
          domAttr(escalation, 'selected', null);
        }
      });

      update.escalations = newEscalation.id;
      update.escalationName = '';

      return update;
    },


    get: function(element, entryNode) {
      var values = {};

      // fill escalation select box with options
      utils.updateOptionsDropDown('select[name=escalations]', escalationEventDefinition, 'bpmn:Escalation', entryNode);

      var boEscalation = escalationEventDefinition.get('escalationRef');
      if (boEscalation) {
        values.escalations = boEscalation.id;
        values.escalationName = boEscalation.get('name');
        values.escalationCode = boEscalation.get('escalationCode');
      } else {
        values.escalations = '';
      }

      return values;
    },
    set: function(element, values) {
      var selectedEscalation = values.escalations;
      var escalationName = values.escalationName;
      var escalationCode = values.escalationCode;
      var escalationExist = false;
      var update = {
        escalationCode: undefined
      };

      var escalations = utils.findRootElementsByType(escalationEventDefinition, 'bpmn:Escalation');
      forEach(escalations, function(escalation) {
        if (escalation.id === values.escalations) {
          escalationExist = true;
        }
      });

      if (selectedEscalation && !escalationExist) {
        // create and reference new element
        return {
          cmd: 'properties-panel.create-and-reference',
          context: {
            element: element,
            referencingObject: escalationEventDefinition,
            referenceProperty: 'escalationRef',
            newObject: { type: 'bpmn:Escalation', properties: { name: selectedEscalation } },
            newObjectContainer: utils.getRoot(escalationEventDefinition).rootElements,
            newObjectParent: utils.getRoot(escalationEventDefinition)
          }
        };
      }

      // update escalation business object
      var boEscalation = escalationEventDefinition.get('escalationRef');
      if (boEscalation && ((boEscalation.name != escalationName) || (boEscalation.escalationCode != escalationCode))) {
          update.name = escalationName;
          if (escalationCode !== '') {
            update.escalationCode = escalationCode;
          }

         return cmdHelper.updateBusinessObject(element, boEscalation, update);

      } else {

        // update or clear reference on business object
        update.escalationRef = selectedEscalation;

        return {
          cmd:'properties-panel.update-businessobject',
          context: {
            element: element,
            businessObject: escalationEventDefinition,
            referenceType: 'bpmn:Escalation',
            referenceProperty: 'escalationRef',
            properties: update
          }
        };
      }

    },
    validate: function(element, values) {
      var escalationName = values.escalationName;

      var validationResult = {};

      // can be undefined (which is fine)
      if(escalationName === '') {
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
      var escalationComboBox = domQuery('select[name=escalations]', node.parentElement);
      if (escalationComboBox.value && escalationComboBox.value.length > 0)  {
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

        if (values.escalationCodeVariable !== '') {
          update['camunda:escalationCodeVariable'] = values.escalationCodeVariable;
        }

        return cmdHelper.updateBusinessObject(element, escalationEventDefinition, update);
      }
    }));
  }
}

module.exports = EscalationEventDefinition;
