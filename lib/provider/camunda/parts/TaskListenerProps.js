'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var listener = require('./implementation/Listener');


module.exports = function(group, element, bpmnFactory) {

  var bo;

  if (is(element, 'bpmn:UserTask')) {
    bo = getBusinessObject(element);
  }

  if (!bo) {
    return;
  }

  var eventTypeOptions = [
    { name: 'create', value: 'create' },
    { name: 'assignment', value: 'assignment' },
    { name: 'complete', value: 'complete' },
    { name: 'delete', value: 'delete' }
  ];

  var listenerProps = listener(element, bpmnFactory, {
    idPrefix: 'taskListeners',
    label: 'Task Listener',
    type: 'camunda:TaskListener',
    bo: bo,
    eventTypeOptions: eventTypeOptions,
    initialEvent: 'create'
  });

  if (listenerProps.entries && listenerProps.entries.length) {
    group.entries = group.entries.concat(listenerProps.entries);
  }

};
