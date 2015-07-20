'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  domQuery = require('min-dom/lib/query'),
  forEach = require('lodash/collection/forEach'),
  entryFactory = require('../../../factory/EntryFactory'),
  eventDefinitionHelper = require('../../../helper/EventDefinitionHelper'),
  elementHelper = require('../../../helper/ElementHelper');


module.exports = function(group, element, bpmnFactory) {
  if (is(element, 'camunda:AsyncCapable')) {

    var entry = {
      id: 'jobRetryTimerCycle',
      description: 'Retry interval in ISO 8601 format (e.g. "R3/PT10M" for "3 cycles, every 10 minutes")',
      label: 'Retry Time Cycle',
      modelProperty: 'jobRetryTimeCycle',
      get: function (element) {
        var businessObject = getBusinessObject(element).get('extensionElements');

        var val = '';
        if(businessObject) {
          forEach(businessObject.get('values'), function (value) {
            // TODO: Wating for https://github.com/bpmn-io/moddle-xml/issues/8 to remove the typeof check
            if (typeof value.$instanceOf === 'function' && is(value, 'camunda:FailedJobRetryTimeCycle')) {
              val = value.get('body');
            }
          });
        }

        return {jobRetryTimeCycle: val};
      },
      set: function (element, values) {
        var businessObject = getBusinessObject(element),
            isNotEmpty = typeof values.jobRetryTimeCycle !== 'undefined' && values.jobRetryTimeCycle != '';

        var extensionElements = businessObject.get('extensionElements'),
          jobRetryTimerElement = undefined,
          isExtensionElementNew = false,
          isJobElementNew = false;

        // create the extensionElements field if it does not exist
        if (!extensionElements) {
          extensionElements = elementHelper.createElement('bpmn:ExtensionElements', {values: []}, businessObject, bpmnFactory);
          isExtensionElementNew = true;
        }

        // Set job retry timer value if there is one already
        // TODO: Waiting for https://github.com/bpmn-io/moddle-xml/issues/8 to remove the typeof check
        var extensionValues = extensionElements.get('values');
        forEach(extensionValues, function (value) {
          if (typeof value.$instanceOf === 'function' && is(value, 'camunda:FailedJobRetryTimeCycle')) {
            jobRetryTimerElement = value;
          }
        });

        // create job retry timer if it not exists
        if (!jobRetryTimerElement && isNotEmpty) {
          jobRetryTimerElement = elementHelper.createElement(
            'camunda:FailedJobRetryTimeCycle',
            {body: values['jobRetryTimeCycle']},
            extensionElements, bpmnFactory
          );

          isJobElementNew = true;
        }

        var updatedElements = [];
        if(isNotEmpty) {
          // create full new element set
          if (isExtensionElementNew && isJobElementNew) {
            extensionElements.get('values').push(jobRetryTimerElement);

            return {extensionElements: extensionElements};
          }

          if (isJobElementNew) {

            return elementHelper.createElementUpdateContext(element, extensionElements, 'values', [jobRetryTimerElement]);
          }

          var oldJob = jobRetryTimerElement;
          jobRetryTimerElement.body = values['jobRetryTimeCycle'];

          updatedElements.push({
            old: oldJob,
            new: jobRetryTimerElement
          });

          return elementHelper.createListUpdateContext(element, extensionElements, 'values', updatedElements);
        } else {

          // removing
          if(extensionValues.length > 1) {

            return {
              extensionElements: elementHelper.removeElement({
                businessObject: extensionElements,
                propertyName: 'values',
                elementType: 'camunda:FailedJobRetryTimeCycle'
              })
            }
          } else {

            return { extensionElements: undefined };
          }
        }

      }
    };

    var condition = function(element, node) {
      var asyncBeforeChecked = domQuery('input[name=asyncBefore]', node.parentElement).checked,
        asyncAfterChecked = domQuery('input[name=asyncAfter]', node.parentElement).checked,
        oneIsChecked = (asyncBeforeChecked || asyncAfterChecked);

      if (is(element, 'bpmn:BoundaryEvent')) {
        var eventDefinitions = eventDefinitionHelper.getTimerEventDefinition(element);
        if (eventDefinitions) return true;
      }

      return oneIsChecked
    };

    group.entries.push(entryFactory.isConditional(entryFactory.textField(entry), condition));
  }
};