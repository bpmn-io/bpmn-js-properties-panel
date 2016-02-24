'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    is = require('bpmn-js/lib/util/ModelUtil').is;

var multiInstanceLoopCharacteristics = require('./implementation/MultiInstanceLoopCharacteristics');

var jobRetryTimeCycle = require('./implementation/JobRetryTimeCycle'),
    asyncContinuation = require('./implementation/AsyncContinuation');


function getLoopCharacteristics(element) {
  var bo = getBusinessObject(element);
  return bo.loopCharacteristics;
}


function ensureMultiInstanceSupported(element) {
  var loopCharacteristics = getLoopCharacteristics(element);
  return !!loopCharacteristics && is(loopCharacteristics, 'camunda:Collectable');
}

module.exports = function(group, element, bpmnFactory) {

  if (!ensureMultiInstanceSupported(element)) {
    return;
  }

  // multi instance properties
  group.entries = group.entries.concat(multiInstanceLoopCharacteristics(element, bpmnFactory));

  // async continuation ///////////////////////////////////////////////////////
  group.entries = group.entries.concat(asyncContinuation(element, bpmnFactory, {
    getBusinessObject: getLoopCharacteristics,
    idPrefix: 'multi-instance-',
    labelPrefix: 'Multi Instance '
  }));


  // retry time cycle //////////////////////////////////////////////////////////
  group.entries = group.entries.concat(jobRetryTimeCycle(element, bpmnFactory, {
    getBusinessObject: getLoopCharacteristics,
    idPrefix: 'multi-instance-',
    labelPrefix: 'Multi Instance '
  }));
};
