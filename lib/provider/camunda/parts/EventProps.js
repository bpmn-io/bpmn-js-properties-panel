'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  propertyEntryFactory = require('../../../PropertyEntryFactory');

var forEach = require('lodash/collection/forEach');

function getEventDefinition(element, eventType) {

  var bo = getBusinessObject(element),
      eventDefinition = null;

  if(bo.eventDefinitions) {
    forEach(bo.eventDefinitions, function(event) {
      if(is(event, eventType)) {
        eventDefinition = event;
      }
    });
  }

  return eventDefinition;
}

function getMessageEventDefinition(element) {
  return getEventDefinition(element, 'bpmn:MessageEventDefinition');
}

function getSignalEventDefinition(element) {
  return getEventDefinition(element, 'bpmn:SignalEventDefinition');
}

module.exports = function(group, element) {
  var events = [
    'bpmn:StartEvent',
    'bpmn:EndEvent',
    'bpmn:IntermediateThrowEvent',
    'bpmn:BoundaryEvent',
    'bpmn:IntermediateCatchEvent'
  ];

  forEach(events, function(event) {
    if(is(element, event)) {

      var messageEventDefinition = getMessageEventDefinition(element),
          signalEventDefinition = getSignalEventDefinition(element),
          eventId = event.substr(5);

      if(messageEventDefinition) {
        group.entries.push(propertyEntryFactory.referableCombobox({
          id: 'selectMessage-' + eventId,
          description: '',
          label: 'Message Definition',
          businessObject: messageEventDefinition,
          referencedType: 'bpmn:Message',
          referenceProperty: 'messageRef'
        }));
      }

      if(signalEventDefinition) {
        group.entries.push(propertyEntryFactory.referableCombobox({
          id: 'selectSignal-' + eventId,
          description: '',
          label: 'Signal Definition',
          businessObject: signalEventDefinition,
          referencedType: 'bpmn:Signal',
          referenceProperty: 'signalRef'
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

