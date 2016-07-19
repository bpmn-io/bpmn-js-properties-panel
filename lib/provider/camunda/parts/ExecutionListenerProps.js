'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var listener = require('./implementation/Listener');

module.exports = function(group, element, bpmnFactory) {

  var bo;

  if (is(element, 'bpmn:FlowElement') || is(element, 'bpmn:Process') || is(element, 'bpmn:Participant')) {
    bo = getBusinessObject(element);
    if (is(element, 'bpmn:Participant')) {
      element = element.processRef;
      bo = bo.get('processRef');
    }
  }

  if (!bo) {
    return;
  }

  var isSequenceFlow = is(element, 'bpmn:SequenceFlow');

  var eventTypeOptions = (isSequenceFlow) ? [
    { name: 'take', value: 'take' }
  ] : [
    { name: 'start', value: 'start' },
    { name: 'end', value: 'end' }
  ];

  var listenerProps = listener(element, bpmnFactory, {
    idPrefix: 'executionListeners',
    label: 'Execution Listener',
    type: 'camunda:ExecutionListener',
    bo: bo,
    reference: 'processRef',
    eventTypeOptions: eventTypeOptions,
    initialEvent: (isSequenceFlow) ? 'take' : 'start'
  });

  if (listenerProps.entries && listenerProps.entries.length) {
    group.entries = group.entries.concat(listenerProps.entries);
  }

};
