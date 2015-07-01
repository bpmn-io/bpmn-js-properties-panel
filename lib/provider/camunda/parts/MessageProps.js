'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  propertyEntryFactory = require('../../../PropertyEntryFactory');

var forEach = require('lodash/collection/forEach');

function getMessageEventDefinition(element) {

  var bo = getBusinessObject(element);

  var messageEventDefinition = null;
  if(bo.eventDefinitions) {
    forEach(bo.eventDefinitions, function(eventDefinition) {
      if(is(eventDefinition, 'bpmn:MessageEventDefinition')) {
        messageEventDefinition = eventDefinition;
      }
    });
  }

  return messageEventDefinition;
}

module.exports = function(group, element) {
  var messageEvents = [
    'bpmn:StartEvent',
    'bpmn:EndEvent',
    'bpmn:IntermediateThrowEvent',
    'bpmn:BoundaryEvent',
    'bpmn:IntermediateCatchEvent'
  ];

  forEach(messageEvents, function(messageEvent) {
    if(is(element, messageEvent)) {

      var messageEventDefinition = getMessageEventDefinition(element);

      if(messageEventDefinition) {
        group.entries.push(propertyEntryFactory.referableCombobox({
          id: 'selectMessage-' + messageEvent.substr(5),
          description: '',
          label: 'Message Definition',
          businessObject: messageEventDefinition,
          referencedType: 'bpmn:Message',
          referenceProperty: 'messageRef'
        }));
      }
    }
  });

  if(is(element, 'bpmn:ReceiveTask')) {
    group.entries.push(propertyEntryFactory.referableCombobox({
      id: 'selectMessage-ReceiveTask',
      description: '',
      label: 'Message Definition',
      businessObject: getBusinessObject(element),
      referencedType: 'bpmn:Message',
      referenceProperty: 'messageRef'
    }))
  }

};

