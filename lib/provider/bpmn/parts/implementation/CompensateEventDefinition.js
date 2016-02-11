'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
    cmdHelper = require('../../../../helper/CmdHelper'),
    utils = require('../../../../Utils');

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var forEach = require('lodash/collection/forEach'),
    is = require('bpmn-js/lib/util/ModelUtil').is,
    find = require('lodash/collection/find');


 function isBoundaryEventAttached(bo, activity, boundaryEvents) {
  var attachedBoundaryEvent = find(boundaryEvents, function(boundaryEvent) {
    var isCompensationEventDefinition = boundaryEvent.eventDefinitions && 
                                        is(boundaryEvent.eventDefinitions[0], 'bpmn:CompensateEventDefinition');
    var isAttached = boundaryEvent.attachedToRef && (boundaryEvent.attachedToRef.id === activity.id);

    return isCompensationEventDefinition && isAttached;
  });

  return attachedBoundaryEvent;
 }

 function getActivitiesForActivityRef(element) {
  var activitiesForActivityRef = [];

  var bo = getBusinessObject(element);
  var activities = utils.filterElementsByType(bo.$parent.flowElements, 'bpmn:Activity');
  var boundaryEvents = utils.filterElementsByType(bo.$parent.flowElements, 'bpmn:BoundaryEvent');

  // subprocess: only when it is not triggeredByEvent
  // task: only when it attach a compensation boundary event
  // callActivity: no limitation
  forEach(activities, function(activity) {
    var attachedBoundaryEvent = isBoundaryEventAttached(bo, activity, boundaryEvents);
    if (( is(activity, 'bpmn:SubProcess') && !activity.triggeredByEvent ) ||
        ( is(activity, 'bpmn:Task') && attachedBoundaryEvent ) ||
        is(activity, 'bpmn:CallActivity')) {

      activitiesForActivityRef.push(activity);
    }
  });

  return activitiesForActivityRef;
 }

 function createActivityRefOptions(element) {
  var activities = getActivitiesForActivityRef(element);

  var options = '';
  if (activities) {
    forEach(activities, function(activity) {
      options += 
        '<option value="' + activity.id + '">' + (activity.name || '') + ' (id=' + activity.id + ')' + '</option>';
    });
  }

  return options;
 }


function CompensateEventDefinition(group, element, bpmnFactory, compensateEventDefinition) {
  group.entries.push(entryFactory.checkbox({
      id: 'wait-for-completion',
      description: 'Configure compensation event definition',
      label: 'Wait for Completion',
      modelProperty: 'waitForCompletion',
      get: function(element, node) {
        var waitForCompletion = compensateEventDefinition.waitForCompletion;

        return { waitForCompletion : waitForCompletion };
      },
      set: function(element, values) {
        var update = {};

        update.waitForCompletion = values.waitForCompletion || undefined;
        
        return cmdHelper.updateBusinessObject(element, compensateEventDefinition, update);        
      }
  }));

  group.entries.push({
    id: 'activity-ref',
    html: '<div class="pp-row">' +
            '<label for="camunda-activity-ref">Activity Ref</label>' +
            '<div class="pp-field-wrapper">' +
              '<select id="camunda-activity-ref" name="activityRef" data-value>' +
                '<option value="" selected></option>' +
                 createActivityRefOptions(element) +
              '</select>' +
            '</div>' +
          '</div>',

    get: function(element, node) {
      var activityRefId = '';
      var activityRef = compensateEventDefinition.activityRef;

      if (activityRef) {
        activityRefId = activityRef.id;
      }

      return { activityRef : activityRefId };
    },
    set: function(element, values) {
      var update = {};

      if (typeof values.activityRef === 'undefined') {
        update.activityRef = undefined;
      } else {
        var activities = getActivitiesForActivityRef(element);
        if (activities) {
          var currentActivity = find(activities, function(activity) {
            return activity.id === values.activityRef;
          });

          update.activityRef = currentActivity;
        }
      }

      return cmdHelper.updateBusinessObject(element, compensateEventDefinition, update);

    }
  });

}

module.exports = CompensateEventDefinition;
