'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is;

var find = require('min-dash').find;

var entryFactory = require('../../../factory/EntryFactory');

var cmdHelper = require('../../../helper/CmdHelper'),
    ImplementationTypeHelper = require('../../../helper/ImplementationTypeHelper'),
    scriptImplementation = require('./implementation/Script'),
    timerImplementation = require('../../bpmn/parts/implementation/TimerEventDefinition');

module.exports = function(group, element, bpmnFactory, options, translate) {

  var LISTENER_TYPE_LABEL = {
    class: translate('Java Class'),
    expression: translate('Expression'),
    delegateExpression: translate('Delegate Expression'),
    script: translate('Script')
  };

  options = options || {};

  var getSelectedListener = options.getSelectedListener;

  var classProp = 'class',
      expressionProp = 'expression',
      delegateExpressionProp = 'delegateExpression',
      scriptProp = 'script';

  var executionListenerEventTypeOptions = ImplementationTypeHelper.isSequenceFlow(element) ? [
    { name: translate('take'), value: 'take' }
  ] : [
    { name: translate('start'), value: 'start' },
    { name: translate('end'), value: 'end' }
  ];

  var taskListenerEventTypeOptions = [
    { name: translate('create'), value: 'create' },
    { name: translate('assignment'), value: 'assignment' },
    { name: translate('complete'), value: 'complete' },
    { name: translate('delete'), value: 'delete' },
    { name: translate('update'), value: 'update' },
    { name: translate('timeout'), value: 'timeout' }
  ];

  var isSelected = function(element, node) {
    return getSelectedListener(element, node);
  };


  // eventType ////////////////
  group.entries.push(entryFactory.selectBox(translate, {
    id: 'listener-event-type',
    label: translate('Event Type'),
    modelProperty: 'eventType',
    emptyParameter: false,

    get: function(element, node) {

      var listener = getSelectedListener(element, node);

      var eventType = listener && listener.get('event');

      return {
        eventType: eventType
      };
    },

    set: function(element, values, node) {
      var eventType = values.eventType,
          listener = getSelectedListener(element, node),
          eventDefinitions = listener && listener.eventDefinitions;

      // ensure only timeout events can have timer event definitions
      if (eventDefinitions && eventType !== 'timeout') {
        eventDefinitions = [];
      }

      return cmdHelper.updateBusinessObject(element, listener,
        {
          event: eventType,
          eventDefinitions: eventDefinitions
        }
      );
    },

    selectOptions: function(element, node) {
      var eventTypeOptions;

      var selectedListener = getSelectedListener(element, node);
      if (ImplementationTypeHelper.isTaskListener(selectedListener)) {
        eventTypeOptions = taskListenerEventTypeOptions;
      } else if (ImplementationTypeHelper.isExecutionListener(selectedListener)) {
        eventTypeOptions = executionListenerEventTypeOptions;
      }

      return eventTypeOptions;

    },

    hidden: function(element, node) {
      return !isSelected(element, node);
    }

  }));


  // listenerId ///////////////
  group.entries.push(entryFactory.textField(translate, {
    id: 'listener-id',
    label: translate('Listener Id'),
    modelProperty: 'listenerId',

    get: function(element, node) {
      var value = {},
          listener = getSelectedListener(element, node);

      value.listenerId = (listener && listener.get('id')) || undefined;

      return value;
    },

    set: function(element, values, node) {
      var update = {},
          listener = getSelectedListener(element, node);

      update['id'] = values.listenerId || '';

      return cmdHelper.updateBusinessObject(element, listener, update);
    },

    hidden: function(element, node) {
      var listener = getSelectedListener(element, node);

      return !ImplementationTypeHelper.isTaskListener(listener);
    },

    validate: function(element, values, node) {
      var value = values.listenerId,
          listener = getSelectedListener(element, node),
          validate = {};

      if (!value && isTimeoutTaskListener(listener)) {
        validate.listenerId = translate('Must provide a value for timeout task listener');
      }

      return validate;
    }

  }));


  // listenerType ///////////////
  group.entries.push(entryFactory.selectBox(translate, {
    id: 'listener-type',
    label: translate('Listener Type'),
    selectOptions: [
      { value: classProp, name: translate('Java Class') },
      { value: expressionProp, name: translate('Expression') },
      { value: delegateExpressionProp, name: translate('Delegate Expression') },
      { value: scriptProp, name: translate('Script') }
    ],
    modelProperty: 'listenerType',
    emptyParameter: false,

    get: function(element, node) {
      var listener = getSelectedListener(element, node);
      return {
        listenerType: ImplementationTypeHelper.getImplementationType(listener)
      };
    },

    set: function(element, values, node) {
      var listener = getSelectedListener(element, node),
          listenerType = values.listenerType || undefined,
          update = {};

      update[classProp] = listenerType === classProp ? '' : undefined;
      update[expressionProp] = listenerType === expressionProp ? '' : undefined;
      update[delegateExpressionProp] = listenerType === delegateExpressionProp ? '' : undefined;
      update[scriptProp] = listenerType === scriptProp ? bpmnFactory.create('camunda:Script') : undefined;

      return cmdHelper.updateBusinessObject(element, listener, update);
    },

    hidden: function(element, node) {
      return !isSelected(element, node);
    }

  }));


  // listenerValue //////////////
  group.entries.push(entryFactory.textField(translate, {
    id: 'listener-value',
    dataValueLabel: 'listenerValueLabel',
    modelProperty: 'listenerValue',

    get: function(element, node) {
      var value = {},
          listener = getSelectedListener(element, node),
          listenerType = ImplementationTypeHelper.getImplementationType(listener);

      value.listenerValueLabel = LISTENER_TYPE_LABEL[listenerType] || '';
      value.listenerValue = (listener && listener.get(listenerType)) || undefined;

      return value;
    },

    set: function(element, values, node) {
      var update = {},
          listener = getSelectedListener(element, node),
          listenerType = ImplementationTypeHelper.getImplementationType(listener);

      update[listenerType] = values.listenerValue || '';

      return cmdHelper.updateBusinessObject(element, listener, update);
    },

    hidden: function(element, node) {
      var listener = getSelectedListener(element, node);
      return !listener || listener.script;
    },

    validate: function(element, values) {
      var value = values.listenerValue,
          validate = {};

      if (!value) {
        validate.listenerValue = translate('Must provide a value');
      }

      return validate;
    }

  }));


  // script ////////////////////
  var script = scriptImplementation('scriptFormat', 'value', true, translate);

  group.entries.push({
    id: 'listener-script-value',
    html: '<div data-show="isScript">' +
            script.template +
          '</div>',

    get: function(element, node) {
      var listener = getSelectedListener(element, node);
      return listener && listener.script ? script.get(element, listener.script) : {};
    },

    set: function(element, values, node) {
      var listener = getSelectedListener(element, node);
      var update = script.set(element, values, listener);
      return cmdHelper.updateBusinessObject(element, listener.script, update);
    },

    validate: function(element, values, node) {
      var listener = getSelectedListener(element, node);
      return listener && listener.script ? script.validate(element, values) : {};
    },

    isScript: function(element, node) {
      var listener = getSelectedListener(element, node);
      return listener && listener.script;
    },

    script: script

  });


  // timerEventDefinition //////
  var timerEventDefinitionHandler = function(element, node) {
    var listener = getSelectedListener(element, node);

    if (!listener || !isTimeoutTaskListener(listener)) {
      return;
    }

    var timerEventDefinition = getTimerEventDefinition(listener);

    if (!timerEventDefinition) {
      return false;
    }

    return timerEventDefinition;
  };

  function createTimerEventDefinition(element, node) {

    var listener = getSelectedListener(element, node);

    if (!listener || !isTimeoutTaskListener(listener)) {
      return;
    }

    var eventDefinitions = listener.get('eventDefinitions') || [],
        timerEventDefinition = bpmnFactory.create('bpmn:TimerEventDefinition');

    eventDefinitions.push(timerEventDefinition);

    listener.eventDefinitions = eventDefinitions;

    return timerEventDefinition;
  }

  var timerOptions = {
    idPrefix: 'listener-',
    createTimerEventDefinition: createTimerEventDefinition
  };

  timerImplementation(group, element, bpmnFactory, timerEventDefinitionHandler, translate, timerOptions);

};


// helpers //////////////

function isTimeoutTaskListener(listener) {
  var eventType = listener && listener.event;
  return eventType === 'timeout';
}

function getTimerEventDefinition(bo) {
  var eventDefinitions = bo.eventDefinitions || [];

  return find(eventDefinitions, function(event) {
    return is(event, 'bpmn:TimerEventDefinition');
  });

}
