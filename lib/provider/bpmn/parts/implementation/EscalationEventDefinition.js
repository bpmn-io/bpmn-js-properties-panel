'use strict';

var domQuery = require('min-dom/lib/query'),
    domAttr = require('min-dom/lib/attr'),
    domify = require('min-dom/lib/domify');

var entryFactory = require('../../../../factory/EntryFactory');

var cmdHelper = require('../../../../helper/CmdHelper'),
    elementHelper = require('../../../../helper/ElementHelper');

var forEach = require('lodash/collection/forEach'),
    find = require('lodash/collection/find');

var utils = require('../../../../Utils');

/**
 * Get select box containing all escalation elements.
 *
 * @param {DOMElement} node
 *
 * @return {DOMElement} the select box
 */
function getSelectBox(node) {
  return domQuery('select[name=escalation]', node.parentElement);
}

/**
 * Get selected value.
 *
 * @param {DOMElement} node
 *
 * @return {string} the selected value
 */
function getSelected(node) {
  var selectBox = getSelectBox(node);
  return (selectBox || {}).value;
}

/**
 * Find escalation element by given id.
 *
 * @param {ModdleElement<bpmn:EscalationEventDefinition>} escalationEventDefinition
 * @param {string} id
 *
 * @return {ModdleElement<bpmn:Escalation>} a escalation element
 */
function findEscalationElement(escalationEventDefinition, id) {
  var escalations = utils.findRootElementsByType(escalationEventDefinition, 'bpmn:Escalation');
  return find(escalations, function(escalation) {
    return escalation.id === id;
  });
}

/**
 * Get selected escalation element.
 *
 * @param {ModdleElement<bpmn:EscalationEventDefinition>} escalationEventDefinition
 * @param {DOMElement} node
 *
 * @return {ModdleElement<bpmn:Escalation>} the selected escalation element
 */
function getSelectedEscalation(escalationEventDefinition, node) {
  var selected = getSelected(node);
  return findEscalationElement(escalationEventDefinition, selected);
}

function EscalationEventDefinition(group, element, bpmnFactory, escalationEventDefinition, showEscalationCodeVariable) {

  group.entries.push({
    id: 'escalation-definitions',
    description: 'Configure the escalation element',
    label: 'Escalation Definition',
    html: '<div class="pp-row pp-select">' +
             '<label for="camunda-escalation">Escalations</label>' +
             '<div class="pp-field-wrapper">' +
               '<select id="camunda-escalation" name="escalation" data-value>' +
               '</select>' +
               '<button class="add" id="addEscalation" data-action="addEscalation"><span>+</span></button>' +
             '</div>' +
          '</div>',

    get: function(element, entryNode) {
      // fill escalation select box with options
      utils.updateOptionsDropDown('select[name=escalation]', escalationEventDefinition, 'bpmn:Escalation', entryNode);
      var reference = escalationEventDefinition.get('escalationRef');
      return {
        escalation: (reference && reference.id) || ''
      };
    },

    set: function(element, values) {
      var escalationDefinitionId = values.escalation;

      if (!escalationDefinitionId || typeof escalationDefinitionId === 'undefined') {
        // remove reference to escalation
        return cmdHelper.updateBusinessObject(element, escalationEventDefinition, {
          escalationRef: undefined
        });
      }

      var escalation = findEscalationElement(escalationEventDefinition, escalationDefinitionId);

      if (!escalation) {
        var commands = [];

        var root = utils.getRoot(escalationEventDefinition);

        // create a new escalation element
        var props = { name: escalationDefinitionId }; // use id as name (see "addEscalation()")

        var newEscalation = elementHelper.createElement('bpmn:Escalation', props, root, bpmnFactory);

        commands.push(cmdHelper.addAndRemoveElementsFromList(element, root, 'rootElements', null, [ newEscalation ]));

        // set reference to created escalation element
        commands.push(cmdHelper.updateBusinessObject(element, escalationEventDefinition, {
          escalationRef: newEscalation
        }));

        return commands;
      }

      // update escalation element reference
      return cmdHelper.updateBusinessObject(element, escalationEventDefinition, {
        escalationRef: escalation
      });
    },

    addEscalation: function(element, inputNode) {
      // note: this generated id will be used as name
      // of the escalation element and not as id
      var id = utils.nextId('Escalation_');

      var optionTemplate = domify('<option value="' + id + '"> (id='+id+')' + '</option>');

      // add new option
      var existingEscalations = getSelectBox(inputNode);

      existingEscalations.insertBefore(optionTemplate, existingEscalations.firstChild);

      // select new escalation in the escalation select box
      forEach(existingEscalations, function(escalation) {
        if (escalation.value === id) {
          domAttr(escalation, 'selected', 'selected');
        } else {
          domAttr(escalation, 'selected', null);
        }
      });

      return true;
    }
  });

  group.entries.push(entryFactory.textField({
    id: 'escalation-definition-name',
    label: 'Escalation Name',
    modelProperty: 'escalationName',

    get: function(element, node) {
      var escalation = getSelectedEscalation(escalationEventDefinition, node);
      return {
        escalationName: escalation && escalation.name
      };
    },

    set: function(element, values, node) {
      var escalation = getSelectedEscalation(escalationEventDefinition, node);
      return cmdHelper.updateBusinessObject(element, escalation, {
        name: values.escalationName || undefined
      });
    },

    validate: function(element, values, node) {
      var selected = getSelectedEscalation(escalationEventDefinition, node);
      if (selected && !values.escalationName) {
        return {
          escalationName: 'Must provide a value'
        };
      }
      return selected && !values.escalationName;
    },

    disabled: function(element, node) {
      return !getSelectedEscalation(escalationEventDefinition, node);
    }
  }));


  group.entries.push(entryFactory.textField({
    id: 'escalation-definition-code',
    label: 'Escalation Code',
    modelProperty: 'escalationCode',

    get: function(element, node) {
      var escalation = getSelectedEscalation(escalationEventDefinition, node);
      return {
        escalationCode: escalation && escalation.escalationCode
      };
    },

    set: function(element, values, node) {
      var escalation = getSelectedEscalation(escalationEventDefinition, node);
      return cmdHelper.updateBusinessObject(element, escalation, {
        escalationCode: values.escalationCode || undefined
      });
    },

    disabled: function(element, node) {
      return !getSelectedEscalation(escalationEventDefinition, node);
    }
  }));


  if (showEscalationCodeVariable) {
    group.entries.push(entryFactory.textField({
      id : 'escalationCodeVariable',
      label : 'Escalation Code Variable',
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
}

module.exports = EscalationEventDefinition;
