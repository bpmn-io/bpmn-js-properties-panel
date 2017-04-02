'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var ImplementationTypeHelper = require('../../../helper/ImplementationTypeHelper');

var externalTaskPriority = require('./implementation/ExternalTaskPriority');

function getServiceTaskLikeBusinessObject(element) {
  var bo = ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);

  // if the element is not a serviceTaskLike element, fetch the normal business object
  // This avoids the loss of the process / participant business object
  if (!bo) {
    bo = getBusinessObject(element);
  }

  return bo;
}

module.exports = function(group, element, bpmnFactory, translate) {

  var bo = getServiceTaskLikeBusinessObject(element);

  if (!bo) {
    return;
  }

  if (is(bo, 'camunda:TaskPriorized') || (is(bo, 'bpmn:Participant')) && bo.get('processRef')) {
    group.entries = group.entries.concat(externalTaskPriority(element, bpmnFactory, {
      getBusinessObject: function(element) {
        if (!is(bo, 'bpmn:Participant')) {
          return bo;
        }
        return bo.get('processRef');
      }
    }, translate));
  }
};