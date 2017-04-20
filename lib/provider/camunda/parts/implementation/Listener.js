'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var extensionElementsEntry = require('./ExtensionElements'),
    extensionElementsHelper = require('../../../../helper/ExtensionElementsHelper'),
    cmdHelper = require('../../../../helper/CmdHelper'),
    elementHelper = require('../../../../helper/ElementHelper'),
    ImplementationTypeHelper = require('../../../../helper/ImplementationTypeHelper');


function getListeners(bo, type) {
  return bo && extensionElementsHelper.getExtensionElements(bo, type) || [];
}

var CAMUNDA_EXECUTION_LISTENER_ELEMENT = 'camunda:ExecutionListener';
var CAMUNDA_TASK_LISTENER_ELEMENT = 'camunda:TaskListener';

module.exports = function(element, bpmnFactory, options, translate) {

  var LISTENER_TYPE_LABEL = {
    class: translate('Java Class'),
    expression: translate('Expression'),
    delegateExpression: translate('Delegate Expression'),
    script: translate('Script')
  };

  var bo;

  var result = {
    getSelectedListener: getSelectedListener
  };

  var entries = result.entries = [];

  var isSequenceFlow = ImplementationTypeHelper.isSequenceFlow(element);

  function getSelectedListener(element, node) {
    var selection = (executionListenerEntry && executionListenerEntry.getSelected(element, node)) || { idx: -1 };

    var listener = getListeners(bo, CAMUNDA_EXECUTION_LISTENER_ELEMENT)[selection.idx];
    if (!listener && taskListenerEntry) {
      selection = taskListenerEntry.getSelected(element, node);
      listener = getListeners(bo, CAMUNDA_TASK_LISTENER_ELEMENT)[selection.idx];
    }
    return listener;
  }

  var setOptionLabelValue = function(type) {
    return function(element, node, option, property, value, idx) {
      var listeners = getListeners(bo, type);
      var listener = listeners[idx];
      var listenerType = ImplementationTypeHelper.getImplementationType(listener);

      var event = (listener.get('event')) ? listener.get('event') : '<empty>';

      var label = (event || '*') + ' : ' + (LISTENER_TYPE_LABEL[listenerType] || '');

      option.text = label;
    };
  };

  var newElement = function(element, type, initialEvent) {
    return function(element, extensionElements, value) {
      var props = {
        event: initialEvent,
        class: ''
      };

      var newElem = elementHelper.createElement(type, props, extensionElements, bpmnFactory);

      return cmdHelper.addElementsTolist(element, extensionElements, 'values', [ newElem ]);
    };
  };

  var removeElement = function(element, type) {
    return function(element, extensionElements, value, idx) {
      var listeners = getListeners(bo, type);
      var listener = listeners[idx];
      if (listener) {
        return extensionElementsHelper.removeEntry(bo, element, listener);
      }
    };
  };


  ////////// Execution Listener

  if (is(element, 'bpmn:FlowElement') || is(element, 'bpmn:Process') || is(element, 'bpmn:Participant')) {
    bo = getBusinessObject(element);
    if (is(element, 'bpmn:Participant')) {
      element = element.processRef;
      bo = bo.get('processRef');
    }

    if (bo) {

      var executionListenerEntry = extensionElementsEntry(element, bpmnFactory, {
        id : 'executionListeners',
        label : translate('Execution Listener'),
        modelProperty: 'name',
        idGeneration: 'false',
        reference: 'processRef',

        createExtensionElement: newElement(element, CAMUNDA_EXECUTION_LISTENER_ELEMENT, (isSequenceFlow) ? 'take' : 'start'),
        removeExtensionElement: removeElement(element, CAMUNDA_EXECUTION_LISTENER_ELEMENT),

        getExtensionElements: function(element) {
          return getListeners(bo, CAMUNDA_EXECUTION_LISTENER_ELEMENT);
        },

        onSelectionChange: function(element, node, event, scope) {
          taskListenerEntry && taskListenerEntry.deselect(element, node);
        },

        setOptionLabelValue: setOptionLabelValue(CAMUNDA_EXECUTION_LISTENER_ELEMENT)

      });
      entries.push(executionListenerEntry);

    }
  }


  ////////// Task Listener

  if (is(element, 'bpmn:UserTask')) {
    bo = getBusinessObject(element);

    var taskListenerEntry = extensionElementsEntry(element, bpmnFactory, {
      id : 'taskListeners',
      label : translate('Task Listener'),
      modelProperty: 'name',
      idGeneration: 'false',

      createExtensionElement: newElement(element, CAMUNDA_TASK_LISTENER_ELEMENT, 'create'),
      removeExtensionElement: removeElement(element, CAMUNDA_TASK_LISTENER_ELEMENT),

      getExtensionElements: function(element) {
        return getListeners(bo, CAMUNDA_TASK_LISTENER_ELEMENT);
      },

      onSelectionChange: function(element, node, event, scope) {
        executionListenerEntry.deselect(element, node);
      },

      setOptionLabelValue: setOptionLabelValue(CAMUNDA_TASK_LISTENER_ELEMENT)

    });
    entries.push(taskListenerEntry);
  }

  return result;

};
