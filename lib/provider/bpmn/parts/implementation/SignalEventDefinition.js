'use strict';

var domQuery = require('min-dom/lib/query'),
    entryFactory = require('../../../../factory/EntryFactory'),
    cmdHelper = require('../../../../helper/CmdHelper');


function SignalEventDefinition(group, element, bpmnFactory, signalEventDefinition) {
  group.entries.push(entryFactory.referenceCombobox({
    id: 'selectSignal',
    description: '',
    label: 'Signal Definition',
    businessObject: signalEventDefinition,
    referencedType: 'bpmn:Signal',
    referenceProperty: 'signalRef'
  }));

  group.entries.push(entryFactory.textField({
    id : 'signalName',
    description : 'Configure the name of a signal event',
    label : 'Signal Name',
    modelProperty : 'signalName',
    get: function(element) {
      var values = {};

      var boSignal = signalEventDefinition.get('signalRef');
      if (boSignal) {
        values.signalName = boSignal.get('name');
      }

      return values;
    },
    set: function(element, values) {
      var update = {};

      var boSignal = signalEventDefinition.get('signalRef');
      update.name = values.signalName;

      return cmdHelper.updateBusinessObject(element, boSignal, update);
    },
    validate: function(element, values) {
      var signalName = values.signalName;
      var validationResult = {};

      if(!signalName) {
        validationResult.signalName = 'Must provide a value.';
      }

      return validationResult;
    },
    disabled: function(element, node) {
      var signalComboBox = domQuery('input[name=signalRef]', node.parentElement);
      if (signalComboBox.value) {
        return false;
      } else {
        return true;
      }
    }
  }));
}

module.exports = SignalEventDefinition;
