'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  eventDefinitionHelper = require('../../../helper/EventDefinitionHelper'),
  entryFactory = require('../../../factory/EntryFactory');

var forEach = require('lodash/collection/forEach');

module.exports = function(group, element) {
  var events = [
    'bpmn:StartEvent',
    'bpmn:EndEvent',
    'bpmn:IntermediateThrowEvent',
    'bpmn:BoundaryEvent',
    'bpmn:IntermediateCatchEvent'
  ];

  // Message and Signal Event Definition
  forEach(events, function(event) {
    if(is(element, event)) {

      var messageEventDefinition = eventDefinitionHelper.getMessageEventDefinition(element),
          signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(element);

      if(messageEventDefinition) {
        group.entries.push(entryFactory.referenceCombobox({
          id: 'selectMessage',
          description: '',
          label: 'Message Definition',
          businessObject: messageEventDefinition,
          referencedType: 'bpmn:Message',
          referenceProperty: 'messageRef'
        }));
      }

      if(signalEventDefinition) {
        group.entries.push(entryFactory.referenceCombobox({
          id: 'selectSignal',
          description: '',
          label: 'Signal Definition',
          businessObject: signalEventDefinition,
          referencedType: 'bpmn:Signal',
          referenceProperty: 'signalRef'
        }));
      }
    }
  });

  // Special Case: Receive Task
  if(is(element, 'bpmn:ReceiveTask')) {
    group.entries.push(entryFactory.referenceCombobox({
      id: 'selectMessage-ReceiveTask',
      description: '',
      label: 'Message Definition',
      businessObject: getBusinessObject(element),
      referencedType: 'bpmn:Message',
      referenceProperty: 'messageRef'
    }))
  }

  // Error Event Definition
  var errorEvents = [
    'bpmn:StartEvent',
    'bpmn:BoundaryEvent',
    'bpmn:EndEvent'
  ];

  forEach(errorEvents, function(event) {
    if(is(element, event)) {

      var errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(element);

      if(errorEventDefinition) {
        group.entries.push(entryFactory.referenceCombobox({
          id: 'selectError',
          description: '',
          label: 'Error Definition',
          businessObject: errorEventDefinition,
          referencedType: 'bpmn:Error',
          referenceProperty: 'errorRef',
          referencedObjectToString: function(obj) {
            var code = (obj.errorCode) ? obj.errorCode : '';
            return obj.name + ' (id=' + obj.id + ';errorCode=' + code + ')';
          }
        }))
      }
    }
  })
};

