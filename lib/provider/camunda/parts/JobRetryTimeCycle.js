'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  entryFactory = require('../../../factory/EntryFactory'),
  abstractJobRetryTimeCycle = require('../abstract/AbstractJobRetryTimeCycle');



module.exports = function(group, element, bpmnFactory) {
  if (is(element, 'camunda:AsyncCapable')) {

    var bo = getBusinessObject(element),
        entry = {
          id : 'jobRetryTimeCycle',
          description : 'Retry interval in ISO 8601 format (e.g. "R3/PT10M" for "3 cycles, every 10 minutes")',
          label : 'Retry Time Cycle',
          modelProperty : 'jobRetryTimeCycle'
        };

    group.entries.push(entryFactory.textField(
      abstractJobRetryTimeCycle(bo, entry, bpmnFactory)
    ));
  }
};