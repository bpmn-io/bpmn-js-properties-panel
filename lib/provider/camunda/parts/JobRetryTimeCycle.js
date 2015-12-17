'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  forEach = require('lodash/collection/forEach'),
  entryFactory = require('../../../factory/EntryFactory'),
  eventDefinitionHelper = require('../../../helper/EventDefinitionHelper'),
  elementHelper = require('../../../helper/ElementHelper'),
  extensionElementsHelper = require('../../../helper/ExtensionElementsHelper'),
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

        var businessObject = getBusinessObject(element),
            newValue = values.jobRetryTimeCycle,
            shouldRemove = ( newValue === undefined || newValue === '' ),
            extensionElements = businessObject.get('bpmn:extensionElements'),
            jobRetryTimeCycleElement = null,
            cmd;

        // search for existing failedJobRetryTimeCycleElement
        if( !!extensionElements ) {
          var extensionValues = extensionElements.get('values');
          forEach(extensionValues, function(value) {
            if(typeof value.$instanceOf === 'function' && is(value, 'camunda:FailedJobRetryTimeCycle')) {
              jobRetryTimeCycleElement = value;

              return false;
            }
          });
        }

        if( shouldRemove ) {
          // remove existing FailedJobRetryTimeCycle
          cmd = extensionElementsHelper.removeEntry(businessObject, element, jobRetryTimeCycleElement);
        } else {
          if( !jobRetryTimeCycleElement ) {
            jobRetryTimeCycleElement = elementHelper.createElement(
                                                                    'camunda:FailedJobRetryTimeCycle',
                                                                    { body : newValue },
                                                                    extensionElements,
                                                                    bpmnFactory
                                                                  );

            cmd = extensionElementsHelper.addEntry(businessObject, element, jobRetryTimeCycleElement, bpmnFactory);
          } else {
            // updating value of pre-existing failedJobRetryTimeCycleElement
            cmd = cmdHelper.updateBusinessObject(element, jobRetryTimeCycleElement, { body: newValue });
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