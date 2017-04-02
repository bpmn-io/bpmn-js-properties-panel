'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
    isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny,
    isEventSubProcess = require('bpmn-js/lib/util/DiUtil').isEventSubProcess,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    eventDefinitionHelper = require('../../../helper/EventDefinitionHelper');

var forEach = require('lodash/collection/forEach');

var message = require('./implementation/MessageEventDefinition'),
    signal = require('./implementation/SignalEventDefinition'),
    error = require('./implementation/ErrorEventDefinition'),
    escalation = require('./implementation/EscalationEventDefinition'),
    timer = require('./implementation/TimerEventDefinition'),
    compensation = require('./implementation/CompensateEventDefinition'),
    condition = require('./implementation/ConditionalEventDefinition');


module.exports = function(group, element, bpmnFactory, elementRegistry, translate) {
  var events = [
    'bpmn:StartEvent',
    'bpmn:EndEvent',
    'bpmn:IntermediateThrowEvent',
    'bpmn:BoundaryEvent',
    'bpmn:IntermediateCatchEvent'
  ];

  // Message and Signal Event Definition
  forEach(events, function(event) {
    if (is(element, event)) {

      var messageEventDefinition = eventDefinitionHelper.getMessageEventDefinition(element),
          signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(element);

      if (messageEventDefinition) {
        message(group, element, bpmnFactory, messageEventDefinition);
      }

      if (signalEventDefinition) {
        signal(group, element, bpmnFactory, signalEventDefinition);
      }

    }
  });

  // Special Case: Receive Task
  if (is(element, 'bpmn:ReceiveTask')) {
    message(group, element, bpmnFactory, getBusinessObject(element));
  }

  // Error Event Definition
  var errorEvents = [
    'bpmn:StartEvent',
    'bpmn:BoundaryEvent',
    'bpmn:EndEvent'
  ];

  forEach(errorEvents, function(event) {
    if (is(element, event)) {

      var errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(element);

      if (errorEventDefinition) {
        var isCatchingErrorEvent = is(element, 'bpmn:StartEvent') || is (element, 'bpmn:BoundaryEvent');

        var showErrorCodeVariable = isCatchingErrorEvent,
            showErrorMessageVariable = isCatchingErrorEvent;

        error(group, element, bpmnFactory, errorEventDefinition, showErrorCodeVariable, showErrorMessageVariable);
      }
    }
  });

  // Escalation Event Definition
  var escalationEvents = [
    'bpmn:StartEvent',
    'bpmn:BoundaryEvent',
    'bpmn:IntermediateThrowEvent',
    'bpmn:EndEvent'
  ];

  forEach(escalationEvents, function(event) {
    if (is(element, event)) {

      var showEscalationCodeVariable = is(element, 'bpmn:StartEvent') || is(element, 'bpmn:BoundaryEvent');

      // get business object
      var escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(element);

      if (escalationEventDefinition) {
        escalation(group, element, bpmnFactory, escalationEventDefinition, showEscalationCodeVariable);
      }
    }

  });

  // Timer Event Definition
  var timerEvents = [
    'bpmn:StartEvent',
    'bpmn:BoundaryEvent',
    'bpmn:IntermediateCatchEvent'
  ];

  forEach(timerEvents, function(event) {
    if (is(element, event)) {

      // get business object
      var timerEventDefinition = eventDefinitionHelper.getTimerEventDefinition(element);

      if (timerEventDefinition) {
        timer(group, element, bpmnFactory, timerEventDefinition);
      }
    }
  });

  // Compensate Event Definition
  var compensationEvents = [
    'bpmn:EndEvent',
    'bpmn:IntermediateThrowEvent'
  ];

  forEach(compensationEvents, function(event) {
    if (is(element, event)) {

      // get business object
      var compensateEventDefinition = eventDefinitionHelper.getCompensateEventDefinition(element);

      if (compensateEventDefinition) {
        compensation(group, element, bpmnFactory, compensateEventDefinition, elementRegistry);
      }
    }
  });


  // Conditional Event Defintion
  var conditionalEvents = [
    'bpmn:BoundaryEvent',
    'bpmn:IntermediateThrowEvent',
    'bpmn:IntermediateCatchEvent'
  ];

  if (isAny(element, conditionalEvents) ||
      (is(element, 'bpmn:StartEvent') && isEventSubProcess(element.parent))) {

    // get business object
    var conditionalEventDefinition = eventDefinitionHelper.getConditionalEventDefinition(element);

    if (conditionalEventDefinition) {
      condition(group, element, bpmnFactory, conditionalEventDefinition, elementRegistry);
    }
  }

};
