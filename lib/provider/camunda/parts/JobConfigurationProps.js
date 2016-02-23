'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var jobPriority = require('./implementation/JobPriority'),
    jobRetryTimeCycle = require('./implementation/JobRetryTimeCycle');

module.exports = function(group, element, bpmnFactory) {

  if (is(element, 'camunda:JobPriorized') || is(element, 'bpmn:Participant')) {
    group.entries = group.entries.concat(jobPriority(element, bpmnFactory, {
      getBusinessObject: function(element) {
        var bo = getBusinessObject(element);
        if (!is(bo, 'bpmn:Participant')) {
          return bo;
        }
        return bo.get('processRef');
      }
    }));
  }

  if (is(element, 'camunda:AsyncCapable')) {
    group.entries = group.entries.concat(jobRetryTimeCycle(element, bpmnFactory, {
      getBusinessObject: getBusinessObject
    }));
  }

};