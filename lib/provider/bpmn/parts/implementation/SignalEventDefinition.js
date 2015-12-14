'use strict';

var domQuery = require('min-dom/lib/query'),
    cmdHelper = require('../../../../helper/CmdHelper'),
    forEach = require('lodash/collection/forEach'),
    domAttr = require('min-dom/lib/attr'),
    elementHelper = require('../../../../helper/ElementHelper'),
    domify = require('min-dom/lib/domify'),

    utils = require('../../../../Utils');


function SignalEventDefinition(group, element, bpmnFactory, signalEventDefinition) {
  group.entries.push({
    'id': 'signalDefinition',
    'description': 'Configure the signal element',
    label: 'Signals',
    'html': '<div class="pp-row">' +
              '<label for="camunda-signals">Signals</label>' +
              '<div class="field-wrapper">' +
                '<select id="camunda-signals" name="signals" data-value>' +
                '</select>' +
                '<button id="addSignal" data-action="addSignal"><span>+</span></button>' +
              '</div>' +
            '</div>' +

            '<div class="pp-row" data-show="isSignalSelected">' +
              '<label for="camunda-signal-name">Signal Name</label>' +
              '<div class="field-wrapper">' +
                '<input id="camunda-signal-name" type="text" name="signalName" />' +
                '<button data-action="clear" data-show="canClear">' +
                  '<span>X</span>' +
                '</button>' +
              '</div>' +
            '</div>',

    addSignal: function(element, inputNode) {
      var update = {};

      // create new empty signal
      var newSignal = elementHelper.createElement('bpmn:Signal', {}, utils.getRoot(signalEventDefinition), bpmnFactory);
      var optionTemplate = domify('<option value="' + newSignal.id + '"> (id='+newSignal.id+')' + '</option>');

      var existingSignals = domQuery('select[name=signals]', inputNode.parentElement);
      // add new option
      existingSignals.insertBefore(optionTemplate, existingSignals.firstChild);
      // select new signal in the signal select box
      forEach(existingSignals, function(signal) {
        if (signal.value === newSignal.id) {
          domAttr(signal, 'selected', 'selected');
        } else {
          domAttr(signal, 'selected', null);
        }
      });

      update.signals = newSignal.id;
      update.signalName = '';

      return update;
    },

    get: function(element, entryNode) {
      var values = {};

      // fill signal select box with options
      utils.updateOptionsDropDown('select[name=signals]', signalEventDefinition, 'bpmn:Signal', entryNode);

      var boSignal = signalEventDefinition.get('signalRef');
      if (boSignal) {
        values.signals = boSignal.id;
        values.signalName = boSignal.get('name');
      } else {
        values.signals = '';
      }

      return values;
    },
    set: function(element, values) {
      var selectedSignal = values.signals;
      var signalName = values.signalName;
      var signalExist = false;
      var update = {};

      var signals = utils.findRootElementsByType(signalEventDefinition, 'bpmn:Signal');
      forEach(signals, function(signal) {
        if (signal.id === selectedSignal) {
          signalExist = true;
        }
      });

      if (selectedSignal && !signalExist) {
        // create and reference new element
        return {
          cmd: 'properties-panel.create-and-reference',
          context: {
            element: element,
            referencingObject: signalEventDefinition,
            referenceProperty: 'signalRef',
            newObject: { type: 'bpmn:Signal', properties: { name: selectedSignal } },
            newObjectContainer: utils.getRoot(signalEventDefinition).rootElements,
            newObjectParent: utils.getRoot(signalEventDefinition)
          }
        };
      }

      // update signal business object
      var boSignal = signalEventDefinition.get('signalRef');
      if (boSignal && (boSignal.name != signalName)) {
          update.name = signalName;

         return cmdHelper.updateBusinessObject(element, boSignal, update);

      } else {

        // update or clear reference on business object
        update.signalRef = selectedSignal;

        return {
          cmd:'properties-panel.update-businessobject',
          context: {
            element: element,
            businessObject: signalEventDefinition,
            referenceType: 'bpmn:Signal',
            referenceProperty: 'signalRef',
            properties: update
          }
        };
      }

    },
    validate: function(element, values) {
      var validationResult = {};
      var signalName = values.signalName;

      // can be undefined (which is fine)
      if (signalName === '') {
        validationResult.signalName = 'Must provide a value.';
      }

      return validationResult;
    },
    clear:  function(element, inputNode) {
      var input = domQuery('input[name=signalName]', inputNode);
      input.value = '';
      return true;
    },
    canClear: function(element, inputNode) {
      var input = domQuery('input[name=signalName]', inputNode);
      return input.value !== '';
    },
    isSignalSelected: function(element, node) {
      var signalComboBox = domQuery('select[name=signals]', node.parentElement);
      if (signalComboBox.value && signalComboBox.value.length > 0)  {
        return true;
      } else {
        return false;
      }
    },

    cssClasses: ['textfield']
  });

}

module.exports = SignalEventDefinition;
