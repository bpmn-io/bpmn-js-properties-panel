'use strict';

var domQuery = require('min-dom/lib/query'),
    entryFactory = require('../../../../factory/EntryFactory'),
    cmdHelper = require('../../../../helper/CmdHelper');


function MessageEventDefinition(group, element, bpmnFactory, messageEventDefinition) {
  group.entries.push(entryFactory.referenceCombobox({
    id: 'selectMessage',
    description: '',
    label: 'Message Definition',
    businessObject: messageEventDefinition,
    referencedType: 'bpmn:Message',
    referenceProperty: 'messageRef'
  }));

  group.entries.push(entryFactory.textField({
    id : 'messageName',
    description : 'Configure the name of a message event',
    label : 'Message Name',
    modelProperty : 'messageName',
    get: function(element) {
      var values = {};

      var boMessage = messageEventDefinition.get('messageRef');
      if (boMessage) {
        values.messageName = boMessage.get('name');
      }

      return values;
    },
    set: function(element, values) {
      var update = {};

      var boMessage = messageEventDefinition.get('messageRef');
      update.name = values.messageName;

      return cmdHelper.updateBusinessObject(element, boMessage, update);
    },
    validate: function(element, values) {
      var messageName = values.messageName;
      var validationResult = {};

      if(!messageName) {
        validationResult.messageName = 'Must provide a value.';
      }

      return validationResult;
    },
    disabled: function(element, node) {
      var messageComboBox = domQuery('input[name=messageRef]', node.parentElement);
      if (messageComboBox.value) {
        return false;
      } else {
        return true;
      }
    }
  }));
}

module.exports = MessageEventDefinition;
