'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    is = require('bpmn-js/lib/util/ModelUtil').is,
    asyncContinuation = require('./implementation/AsyncContinuation');

module.exports = function(group, element, bpmnFactory, translate) {

  if (is(element, 'camunda:AsyncCapable')) {

    group.entries = group.entries.concat(asyncContinuation(element, bpmnFactory, {
      getBusinessObject: getBusinessObject
    }, translate));

  }
};