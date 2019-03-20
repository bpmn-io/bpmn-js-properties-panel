'use strict';

var entryFactory = require('../../../factory/EntryFactory');

var cmdHelper = require('../../../helper/CmdHelper'),
    ImplementationTypeHelper = require('../../../helper/ImplementationTypeHelper'),

    scriptImplementation = require('./implementation/Script');


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
    { name: translate('delete'), value: 'delete' }
  ];

  var isSelected = function(element, node) {
    return getSelectedListener(element, node);
  };

  group.entries.push(entryFactory.selectBox({
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
      var eventType = values.eventType;

      return cmdHelper.updateBusinessObject(element, getSelectedListener(element, node), { event: eventType });
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


  group.entries.push(entryFactory.selectBox({
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


  group.entries.push(entryFactory.textField({
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

};
