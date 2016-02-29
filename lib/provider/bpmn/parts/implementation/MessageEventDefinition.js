'use strict';

var domQuery = require('min-dom/lib/query'),
    forEach = require('lodash/collection/forEach'),
    domAttr = require('min-dom/lib/attr'),
    cmdHelper = require('../../../../helper/CmdHelper'),
    elementHelper = require('../../../../helper/ElementHelper'),
    domify = require('min-dom/lib/domify'),

    utils = require('../../../../Utils');


function MessageEventDefinition(group, element, bpmnFactory, messageEventDefinition) {
  group.entries.push({
    'id': 'messageDefinition',
    'description': 'Configure the message element',
    label: 'Messages',
    'html': '<div class="pp-row pp-select">' +
              '<label for="camunda-messages">Messages</label>' +
              '<div class="pp-field-wrapper">' +
                '<select id="camunda-messages" name="messages" data-value>' +
                '</select>' +
                '<button class="add" id="addMessage" data-action="addMessage"><span>+</span></button>' +
              '</div>' +
            '</div>' +

            '<div class="pp-row pp-textfield" data-show="isMessageSelected">' +
              '<label for="camunda-message-name">Message Name</label>' +
              '<div class="pp-field-wrapper">' +
                '<input id="camunda-message-name" type="text" name="messageName" />' +
                '<button class="clear" data-action="clear" data-show="canClear">' +
                  '<span>X</span>' +
                '</button>' +
              '</div>' +
            '</div>',

    addMessage: function(element, inputNode) {
      var update = {};

      // create new empty message
      var newMessage = elementHelper.createElement('bpmn:Message', {}, utils.getRoot(messageEventDefinition),
                                                    bpmnFactory);
      var optionTemplate = domify('<option value="' + newMessage.id + '"> (id='+newMessage.id+')' + '</option>');

      var existingMessages = domQuery('select[name=messages]', inputNode.parentElement);
      // add new option
      existingMessages.insertBefore(optionTemplate, existingMessages.firstChild);
      // select new message in the message select box
      forEach(existingMessages, function(message) {
        if (message.value === newMessage.id) {
          domAttr(message, 'selected', 'selected');
        } else {
          domAttr(message, 'selected', null);
        }
      });

      update.messages = newMessage.id;
      update.messageName = '';

      return update;
    },

    get: function(element, entryNode) {
      var values = {};

      // fill message select box with options
      utils.updateOptionsDropDown('select[name=messages]', messageEventDefinition, 'bpmn:Message', entryNode);

      var boMessage = messageEventDefinition.get('messageRef');
      if (boMessage) {
        values.messages = boMessage.id;
        values.messageName = boMessage.get('name');
      } else {
        values.messages = '';
      }

      return values;
    },
    set: function(element, values) {
      var selectedMessage = values.messages;
      var messageName = values.messageName;
      var messageExist = false;
      var update = {};

      var messages = utils.findRootElementsByType(messageEventDefinition, 'bpmn:Message');
      forEach(messages, function(message) {
        if (message.id === selectedMessage) {
          messageExist = true;
        }
      });

      if (selectedMessage && !messageExist) {
        // create and reference new element
        return {
          cmd: 'properties-panel.create-and-reference',
          context: {
            element: element,
            referencingObject: messageEventDefinition,
            referenceProperty: 'messageRef',
            newObject: { type: 'bpmn:Message', properties: { name: selectedMessage } },
            newObjectContainer: utils.getRoot(messageEventDefinition).rootElements,
            newObjectParent: utils.getRoot(messageEventDefinition)
          }
        };
      }

      // update message business object
      var boMessage = messageEventDefinition.get('messageRef');
      if (boMessage && (boMessage.name != messageName)) {
          update.name = messageName;

         return cmdHelper.updateBusinessObject(element, boMessage, update);

      } else {

        // update or clear reference on business object
        update.messageRef = selectedMessage || undefined;

        return {
          cmd:'properties-panel.update-businessobject',
          context: {
            element: element,
            businessObject: messageEventDefinition,
            referenceType: 'bpmn:Message',
            referenceProperty: 'messageRef',
            properties: update
          }
        };
      }

    },
    validate: function(element, values) {
      var validationResult = {};
      var messageName = values.messageName;

      // can be undefined (which is fine)
      if (messageName === '') {
        validationResult.messageName = 'Must provide a value.';
      }

      return validationResult;
    },
    clear:  function(element, inputNode) {
      var input = domQuery('input[name=messageName]', inputNode);
      input.value = '';
      return true;
    },
    canClear: function(element, inputNode) {
      var input = domQuery('input[name=messageName]', inputNode);
      return input.value !== '';
    },
    isMessageSelected: function(element, node) {
      var messageComboBox = domQuery('select[name=messages]', node.parentElement);
      if (messageComboBox.value && messageComboBox.value.length > 0)  {
        return true;
      } else {
        return false;
      }
    },

    cssClasses: ['textfield']
  });

}

module.exports = MessageEventDefinition;
