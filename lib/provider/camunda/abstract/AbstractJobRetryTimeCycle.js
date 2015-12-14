'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
    forEach = require('lodash/collection/forEach'),
    eventDefinitionHelper = require('../../../helper/EventDefinitionHelper'),
    elementHelper = require('../../../helper/ElementHelper'),
    extensionElementsHelper = require('../../../helper/ExtensionElementsHelper'),
    cmdHelper = require('../../../helper/CmdHelper');

function isAsyncBefore(bo) {
  // also check deprecated camunda:async attribute
  return ( !!bo.get('camunda:asyncBefore') || !!bo.get('camunda:async') );
}

var jobRetryTimeCycleEntry = function(bo, options, bpmnFactory) {

  var get = function(element) {
    var businessObject = bo.get('extensionElements');

    var val = '';
    if(businessObject) {
      forEach(businessObject.get('values'), function (value) {
        // TODO: Wating for https://github.com/bpmn-io/moddle-xml/issues/8 to remove the typeof check
        if (typeof value.$instanceOf === 'function' && is(value, 'camunda:FailedJobRetryTimeCycle')) {
          val = value.get('body');
        }
      });
    }

    var res = {};
    res[options.id] = val;

    return res;

    //return { jobRetryTimeCycle: val };
  };

  var set = function(element, values) {
    //newValue = values.jobRetryTimeCycle,
    var newValue = values[options.id],
        shouldRemove = ( newValue === undefined || newValue === '' ),
        extensionElements = bo.get('bpmn:extensionElements'),
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
      cmd = extensionElementsHelper.removeEntry(bo, element, jobRetryTimeCycleElement);
    } else {
      if( !jobRetryTimeCycleElement ) {
        jobRetryTimeCycleElement = elementHelper.createElement(
          'camunda:FailedJobRetryTimeCycle',
          { body : newValue },
          extensionElements,
          bpmnFactory
        );

        var extensionElUpdate = extensionElementsHelper.addEntry(bo, element, jobRetryTimeCycleElement, bpmnFactory);
        if( !is(bo.loopCharacteristics, 'camunda:Collectable') ) {
          cmd = cmdHelper.updateBusinessObject(element, bo, extensionElUpdate);
        } else {
          cmd = extensionElUpdate;
        }
      } else {
        // updating value of pre-existing failedJobRetryTimeCycleElement
        cmd = cmdHelper.updateBusinessObject(element, jobRetryTimeCycleElement, { body: newValue });
      }
    }

    return cmd;
  };

  var disabled = function(element, node) {
    // async behaviour
    var hasAsyncBefore = isAsyncBefore(bo),
        hasAsyncAfter = !!bo.get('camunda:asyncAfter'),
        isAsync = ( hasAsyncBefore || hasAsyncAfter );

    if (is(element, 'bpmn:BoundaryEvent')) {
      var eventDefinitions = eventDefinitionHelper.getTimerEventDefinition(element);
      if (eventDefinitions) {
        return true;
      }
    }

    return !isAsync;
  };

  var entry = options;
  entry.get = ( options.get || get );
  entry.set = ( options.set || set );
  entry.disabled = ( options.disabled || disabled );

  return entry;

};


module.exports = jobRetryTimeCycleEntry;
