'use strict';

var entryFactory = require('../../../../factory/EntryFactory');

var extensionElementsEntry = require('./ExtensionElements'),
    extensionElementsHelper = require('../../../../helper/ExtensionElementsHelper'),
    cmdHelper = require('../../../../helper/CmdHelper'),
    elementHelper = require('../../../../helper/ElementHelper'),
    ImplementationTypeHelper = require('../../../../helper/ImplementationTypeHelper'),

    script = require('./Script')('scriptFormat', 'value', true);


function getListeners(bo, type) {
  return bo && extensionElementsHelper.getExtensionElements(bo, type) || [];
}

var LISTENER_TYPE_LABEL = {
  class: 'Java Class',
  expression: 'Expression',
  delegateExpression: 'Delegate Expression',
  script: 'Script'
};

module.exports = function(element, bpmnFactory, options) {

  options = options || {};

  var idPrefix = options.idPrefix || '',
      label = options.label,
      type = options.type,
      bo = options.bo,
      eventTypeOptions = options.eventTypeOptions,
      initialEvent = options.initialEvent,
      reference = options.reference || undefined,
      entries = [];

  var classProp = 'class',
      expressionProp = 'expression',
      delegateExpressionProp = 'delegateExpression',
      scriptProp = 'script';


  var isSelected = function(element, node) {
    return getSelectedListener(element, node);
  };

  function getSelectedListener(element, node) {
    var selected = listenerEntry.getSelected(element, node.parentNode);

    if (selected.idx === -1) {
      return;
    }

    var listeners = getListeners(bo, type);

    return listeners[selected.idx];
  }

  var setOptionLabelValue = function() {
    return function(element, node, option, property, value, idx) {
      var listeners = getListeners(bo, type);
      var listener = listeners[idx];
      var listenerType = ImplementationTypeHelper.getImplementationType(listener);

      var event = (listener.get('event')) ? listener.get('event') : '<empty>';

      var label = (event || '*') + ' : ' + (LISTENER_TYPE_LABEL[listenerType] || '');

      option.text = label;
    };
  };

  var newElement = function(element) {
    return function(element, extensionElements, value) {
      var props = {
        event: initialEvent,
        class: ''
      };

      var newElem = elementHelper.createElement(type, props, extensionElements, bpmnFactory);

      return cmdHelper.addElementsTolist(element, extensionElements, 'values', [ newElem ]);
    };
  };

  var removeElement = function(element) {
    return function(element, extensionElements, value, idx) {
      var listeners = getListeners(bo, type);
      var listener = listeners[idx];
      if (listener) {
        return extensionElementsHelper.removeEntry(bo, element, listener);
      }
    };
  };

  var listenerEntry = extensionElementsEntry(element, bpmnFactory, {
    id : idPrefix,
    label : label,
    modelProperty: 'name',
    idGeneration: 'false',
    reference: reference,

    createExtensionElement: newElement(element),
    removeExtensionElement: removeElement(element),

    getExtensionElements: function(element) {
      return getListeners(bo, type);
    },

    setOptionLabelValue: setOptionLabelValue()

  });
  entries.push(listenerEntry);


  entries.push(entryFactory.selectBox({
    id: idPrefix + '-event-type',
    label: 'Event Type',
    selectOptions: eventTypeOptions,
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

    disabled: function(element, node) {
      return !isSelected(element, node);
    }

  }));


  entries.push(entryFactory.selectBox({
    id: idPrefix + '-type',
    label: 'Listener Type',
    selectOptions: [
      { value: classProp, name: 'Java Class' },
      { value: expressionProp, name: 'Expression' },
      { value: delegateExpressionProp, name: 'Delegate Expression' },
      { value: scriptProp, name: 'Script' }
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

    disabled: function(element, node) {
      return !isSelected(element, node);
    }

  }));


  entries.push(entryFactory.textField({
    id: idPrefix + '-value',
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

      update[listenerType] = values.listenerValue || undefined;

      return cmdHelper.updateBusinessObject(element, listener, update);
    },

    disabled: function(element, node) {
      var listener = getSelectedListener(element, node);
      return !listener || listener.script;
    },

    validate: function(element, values) {
      var value = values.listenerValue,
          validate = {};

      if (!value) {
        validate.listenerValue = 'Must provide a value';
      }

      return validate;
    }

  }));


  entries.push({
    id: idPrefix + '-script-value',
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

  return { entries };

};
