'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  domQuery = require('min-dom/lib/query'),
  cmdHelper = require('../../../helper/CmdHelper'),
  elementHelper = require('../../../helper/ElementHelper'),
  forEach = require('lodash/collection/forEach'),
  domify = require('min-dom/lib/domify'),
  utils = require('../../../Utils'),

  script = require('./implementation/Script')('scriptFormat', 'value', true);


function createListenerTemplate(id) {
  return '<div class="djs-listener-area" data-scope>' +
            '<button class="clear" data-action="removeListener"><span>X</span></button>' +

            '<div class="pp-row">' +
              '<label for="cam-task-listener-event-type-'+id+'">Event Type</label>' +
                  '<div class="pp-field-wrapper">' +
                    '<select id="cam-task-listener-event-type-'+id+'" name="eventType" data-value>' +
                      '<option value="create">create</option>' +
                      '<option value="assignment">assignment</option>' +
                      '<option value="complete">complete</option>' +
                      '<option value="delete">delete</option>' +
                    '</select>' +
                  '</div>' +
            '</div>' +

            '<div class="pp-row">' +
              '<label for="cam-task-listener-type-'+id+'">Listener Type</label>' +
              '<div class="pp-field-wrapper">' +
                '<select id="cam-task-listener-type-'+id+'" name="listenerType" data-value>' +
                  '<option value="class">Java Class</option>' +
                  '<option value="expression">Expression</option>' +
                  '<option value="delegateExpression">Delegate Expression</option>' +
                  '<option value="script">Script</option>' +
                '</select>' +
              '</div>' +
            '</div>' +

            '<div class="pp-row">' +
              '<div data-show="isNotScript">' +
                '<label for="cam-task-listener-val-'+id+'">' +
                  '<span data-show="isJavaClass">Java Class</span>' +
                  '<span data-show="isExpression">Expression</span>' +
                  '<span data-show="isDelegateExpression">Delegate Expression</span>' +
                '</label>' +
                '<div class="pp-field-wrapper">' +
                  '<input id="cam-task-listener-val-'+id+'" type="text" name="listenerValue" />' +
                  '<button class="clear" data-action="clearListenerValue" data-show="canClearListenerValue">' +
                    '<span>X</span>' +
                  '</button>' +
                '</div>' +
              '</div>' +
            '</div>'+

            '<div data-show="isScript">' +
              script.template +
            '</div>'+

          '</div>';
}

function getItem(element, bo) {
   // read values from xml:
  var boExpression = bo.get('expression'),
      boDelegate = bo.get('delegateExpression'),
      boClass = bo.get('class'),
      boEvent = bo.get('event'),
      boScript = bo.script;

  var values = {},
    listenerType = '';

  if(typeof boExpression !== 'undefined') {
    listenerType = 'expression';
    values.listenerValue = boExpression;
  }
  else if(typeof boDelegate !== 'undefined') {
    listenerType = 'delegateExpression';
    values.listenerValue = boDelegate;
  }
  else if(typeof boClass !== 'undefined') {
    listenerType = 'class';
    values.listenerValue = boClass;
  }
  else if (typeof boScript !== 'undefined') {
    listenerType = 'script';
    values = script.get(element, boScript);
  }

  values.listenerType = listenerType;
  values.eventType = boEvent;

  return values;
}

function setEmpty(update) {
  update.class = undefined;
  update.expression = undefined;
  update.delegateExpression = undefined;
  update.event = undefined;
  update.script = undefined;
}

function createTaskListener(element, values, extensionElements, taskListenerList, bpmnFactory) {
  // add task listener values to extension elements values
  forEach(values, function(value) {
    var update = {};
    setEmpty(update);
    update.event = value.eventType;

    var taskListener = elementHelper.createElement('camunda:TaskListener',
                                                     update, extensionElements, bpmnFactory);

    if (value.listenerType === 'script') {
      var scriptProps = script.set(element, value);
      taskListener.script = elementHelper.createElement('camunda:Script',
                                                     scriptProps, taskListener, bpmnFactory);
    }
    else {
      taskListener[value.listenerType] = value.listenerValue || '';
    }

    taskListenerList.push(taskListener);
  });

}

module.exports = function(group, element, bpmnFactory) {

  var bo;
  var lastIdx = 0;

  if (is(element, 'bpmn:UserTask')) {
    bo = getBusinessObject(element);
  }

  if (!bo) {
    return;
  }

  group.entries.push({
    'id': 'taskListeners',
    'description': 'Configure task listener.',
    label: 'Listener',
    'html': '<div class="cam-add-listener">' +
              '<label for="addTaskListener">Add Task Listener </label>' +
              '<button class="add" id="addTaskListener" data-action="addListener"><span>+</span></button>' +
            '</div>' +
            '<div data-list-entry-container></div>',

    createListEntryTemplate: function(value, idx) {
      lastIdx = idx;
      return createListenerTemplate(idx);
    },

    get: function (element, propertyName) {
      var values = [];

      if (!!bo.extensionElements) {
        var extensionElementsValues = getBusinessObject(element).extensionElements.values;
        forEach(extensionElementsValues, function(extensionElement) {
          if (typeof extensionElement.$instanceOf === 'function' && is(extensionElement, 'camunda:TaskListener')) {
            values.push(getItem(element, extensionElement));
          }
        });
      }

      return values;
    },

    set: function (element, values, containerElement) {
      var cmd;

      var extensionElements = bo.extensionElements;
      var isExtensionElementsNew = false;

      if (!extensionElements) {
        isExtensionElementsNew = true;
        extensionElements = elementHelper.createElement('bpmn:ExtensionElements',
                                                        { values: [] }, bo, bpmnFactory);
      }

      if (isExtensionElementsNew) {
        var extensionValues = extensionElements.get('values');
        createTaskListener(element, values, extensionElements, extensionValues, bpmnFactory);

        cmd = cmdHelper.updateProperties(element, { extensionElements: extensionElements });

      } else {

        // remove all existing task listeners
        var objectsToRemove = [];
        forEach(extensionElements.get('values'), function(extensionElement) {
          if (is(extensionElement, 'camunda:TaskListener')) {
            objectsToRemove.push(extensionElement);
          }
        });

        // add all the listeners
        var objectsToAdd = [];
        createTaskListener(element, values, extensionElements, objectsToAdd, bpmnFactory);

        cmd = cmdHelper.addAndRemoveElementsFromList(element, extensionElements, 'values', 'extensionElements',
                                                      objectsToAdd, objectsToRemove);

      }

      return cmd;
    },

    validateListItem: function(element, values) {
      var validationResult = {};

      if(values.listenerType === 'script') {
        validationResult = script.validate(element, values);
      }
      else if(!values.listenerValue) {
        validationResult.listenerValue = "Must provide a value";
      }

      return validationResult;
    },

    addListener: function(element, inputNode) {
      var listenerContainer = domQuery('[data-list-entry-container]', inputNode);
      lastIdx++;
      var template = domify(createListenerTemplate(lastIdx));
      listenerContainer.appendChild(template);
      return true;
    },

    removeListener: function(element, entryNode, btnNode, scopeNode) {
      scopeNode.parentElement.removeChild(scopeNode);
      return true;
    },

    clearListenerValue:  function(element, entryNode, btnNode, scopeNode) {
      var input = domQuery('input[name=listenerValue]', scopeNode);
      input.value = '';
      return true;
    },

    canClearListenerValue: function(element, entryNode, btnNode, scopeNode) {
      var input = domQuery('input[name=listenerValue]', scopeNode);
      return input.value !== '';
    },

    isExpression: function(element, entryNode, btnNode, scopeNode) {
      var type = utils.selectedType('select[name=listenerType]', scopeNode);
      return type === 'expression';
    },

    isJavaClass: function(element, entryNode, btnNode, scopeNode) {
      var type = utils.selectedType('select[name=listenerType]', scopeNode);
      return type === 'class';
    },

    isDelegateExpression: function(element, entryNode, btnNode, scopeNode) {
      var type = utils.selectedType('select[name=listenerType]', scopeNode);
      return type === 'delegateExpression';
    },

    isScript: function(element, entryNode, btnNode, scopeNode) {
      var type = utils.selectedType('select[name=listenerType]', scopeNode);
      return type === 'script';
    },

    isNotScript: function(element, entryNode, btnNode, scopeNode) {
      var type = utils.selectedType('select[name=listenerType]', scopeNode);
      return type !== 'script';
    },

    script: script,

    cssClasses: ['pp-textfield']
   });

};
