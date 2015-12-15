'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  forEach = require('lodash/collection/forEach'),
  entryFactory = require('../../../factory/EntryFactory'),
  eventDefinitionHelper = require('../../../helper/EventDefinitionHelper'),
  elementHelper = require('../../../helper/ElementHelper'),
  cmdHelper = require('../../../helper/CmdHelper');



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

        var businessObject = getBusinessObject(element);

        var newValue = values.jobRetryTimeCycle;
        var shouldRemove = typeof newValue === 'undefined' || newValue === '';

        var extensionElements = businessObject.get('bpmn:extensionElements');

        var extensionValues = [];
        var failedJobRetryTimeCycleElement = null;
        // search for existing failedJobRetryTimeCycleElement
        if(!!extensionElements) {
          extensionValues = extensionElements.get('values');
          forEach(extensionValues, function(value) {
            if(typeof value.$instanceOf === 'function' && is(value, 'camunda:FailedJobRetryTimeCycle')) {
              failedJobRetryTimeCycleElement = value;
            }
          });
        }

        var cmd = null;

        if(shouldRemove) {
          // remove existing FailedJobRetryTimeCycle
          cmd = cmdHelper.removeElementsFromList(element, extensionElements, 'values',
                                                 [failedJobRetryTimeCycleElement]);
        }
        else {
          var isExtensionElementNew = false;
          if(!extensionElements) {
            extensionElements = elementHelper.createElement('bpmn:ExtensionElements',
                                                            { values: [] }, businessObject, bpmnFactory);
            extensionValues = extensionElements.get('values');
            isExtensionElementNew = true;
          }

          if(!failedJobRetryTimeCycleElement) {
            failedJobRetryTimeCycleElement = elementHelper.createElement('camunda:FailedJobRetryTimeCycle',
                                                                         { }, extensionElements, bpmnFactory);
            failedJobRetryTimeCycleElement.body = newValue;

            if(isExtensionElementNew) {
              extensionValues.push(failedJobRetryTimeCycleElement);
              // extensionElements element does not exist yet: create it
              cmd =  {
                extensionElements: extensionElements
              };
            }
            else {
              // add new failedJobRetryExtensionElement to existing extensionElements list
              cmd = cmdHelper.addElementsTolist(element, extensionElements, 'values', [failedJobRetryTimeCycleElement]);
            }
          }
          else {
            // updating value of pre-existing failedJobRetryTimeCycleElement
            var props = {
              body: newValue
            };
            cmd = cmdHelper.updateBusinessObject(element, failedJobRetryTimeCycleElement, props);
          }
        }

        return cmd;
      },
      disabled: function(element, node) {
        var bo = getBusinessObject(element);

        // async behaviour
        var hasAsyncBefore = !!bo.get('camunda:asyncBefore'),
            hasAsyncAfter = !!bo.get('camunda:asyncAfter'),
            isAsync = ( hasAsyncBefore || hasAsyncAfter );

        if( isAsync ) {
          return false;
        }

        // timer definition
        var isTimerEvent = false;
        if( is(element, 'bpmn:Event') ) {
          isTimerEvent = eventDefinitionHelper.getTimerEventDefinition(element);
        }

        return !isTimerEvent;
      }
    };

    group.entries.push(entryFactory.textField(entry));
  }
};