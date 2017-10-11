'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
    domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes'),
    forEach = require('lodash/collection/forEach'),
    is = require('bpmn-js/lib/util/ModelUtil').is,
    coreModule = require('bpmn-js/lib/core'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    propertiesProviderModule = require('../../../../lib/provider/camunda'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

describe('taskListeners-properties', function() {

  var diagramXML = require('./TaskListenerPropertyTest.bpmn');

  var testModules = [
    coreModule, selectionModule, modelingModule,
    propertiesPanelModule,
    propertiesProviderModule
  ];

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapModeler(diagramXML, {
    modules: testModules,
    moddleExtensions: { camunda: camundaModdlePackage }
  }));

  beforeEach(inject(function(commandStack, propertiesPanel) {

    var undoButton = document.createElement('button');
    undoButton.textContent = 'UNDO';

    undoButton.addEventListener('click', function() {
      commandStack.undo();
    });

    container.appendChild(undoButton);

    propertiesPanel.attachTo(container);
  }));

  var CAMUNDA_TASK_LISTENER_ELEMENT = 'camunda:TaskListener',
      CAMUNDA_EXECUTION_LISTENER_ELEMENT = 'camunda:ExecutionListener';


  function getListener(extensionElements, type) {
    var listeners = [];
    if (!!extensionElements && !!extensionElements.values) {
      forEach(extensionElements.values, function(value) {
        if (is(value, type)) {
          listeners.push(value);
        }
      });
    }
    return listeners;
  }

  function getInput(container, selector, dataEntrySelector) {
    return domQuery('div[data-entry=' + dataEntrySelector + '] input[name=' + selector + ']', container);
  }

  function getSelect(container, selector, dataEntrySelector) {
    return domQuery('div[data-entry=' + dataEntrySelector + '] select[name=' + selector + ']', container);
  }

  function getClearValueButton(container, dataEntrySelector) {
    return domQuery('div[data-entry=' + dataEntrySelector + '] button[data-action=clear]', container);
  }

  function getAddButton(container, dataEntrySelector) {
    return domQuery('div[data-entry=' + dataEntrySelector + '] button[data-action=createElement]', container);
  }

  function getRemoveButton(container) {
    return domQuery('div[data-entry=taskListeners] button[data-action=removeElement]', container);
  }

  function selectListener(container, idx, dataEntrySelector) {
    dataEntrySelector = (dataEntrySelector) ? dataEntrySelector : 'taskListeners';
    var listeners = getSelect(container, 'selectedExtensionElement', dataEntrySelector);

    listeners.options[idx].selected = 'selected';
    TestHelper.triggerEvent(listeners, 'change');
  }

  var LISTENER_EVENT_TYPE_ENTRY = 'listener-event-type',
      LISTENER_TYPE_ENTRY       = 'listener-type',
      LISTENER_VALUE_ENTRY      = 'listener-value';


  it('should fetch task listener properties for an user task', inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('UserTask_1');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY),
        listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY),
        listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY);

    expect(bo.extensionElements.values).to.have.length(2);
    var extensionElementsValues = bo.extensionElements.values;

    selectListener(propertiesPanel._container, 0);

    expect(eventType.value).to.equal('assignment');
    expect(listenerType.value).to.equal('expression');
    expect(listenerValue.value).to.equal('abc');

    expect(is(extensionElementsValues[1], 'camunda:TaskListener')).to.be.true;
    expect(extensionElementsValues[1].get('event')).to.equal(eventType.value);
    expect(extensionElementsValues[1].get('expression')).to.equal(listenerValue.value);

  }));


  it('should not fetch task listener properties for a sequence flow', inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('SequenceFlow_1');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        executionListeners = getSelect(container, 'selectedExtensionElement', 'executionListeners'),
        taskListeners = getSelect(container, 'selectedExtensionElement', 'taskListeners');

    expect(is(bo.extensionElements.values[0], 'camunda:ExecutionListener')).to.be.true;
    expect(is(bo.extensionElements.values[0], 'camunda:TaskListener')).to.be.false;

    expect(bo.extensionElements.values).to.have.length(1);

    expect(executionListeners).to.exist;
    expect(taskListeners).to.be.null;

  }));


  it('should change properties of a task listener', inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('UserTask_1');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT),

        eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY),
        listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY),
        listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY);

    // given
    expect(bo.extensionElements.values).to.have.length(2);
    expect(taskListeners).to.have.length(1);

    selectListener(propertiesPanel._container, 0);

    expect(eventType.value).to.equal('assignment');
    expect(listenerType.value).to.equal('expression');
    expect(listenerValue.value).to.equal('abc');

    expect(taskListeners[0].get('event')).to.equal(eventType.value);
    expect(taskListeners[0].get('expression')).to.equal(listenerValue.value);

    // when
    // select 'create'
    eventType.options[0].selected = 'selected';
    TestHelper.triggerEvent(eventType, 'change');

    // select 'java class'
    listenerType.options[0].selected = 'selected';
    TestHelper.triggerEvent(listenerType, 'change');

    // then
    expect(eventType.value).to.equal('create');
    expect(listenerType.value).to.equal('class');
    expect(listenerValue.value).to.equal('');

    taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT);

    expect(taskListeners[0].get('event')).to.equal(eventType.value);
    expect(taskListeners[0].get('class')).to.equal(listenerValue.value);
    expect(taskListeners[0].get('expression')).to.be.undefined;
  }));


  it('should add a new task listener to an existing extension elements', inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('UserTask_1');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT),

        addListenerButton = getAddButton(propertiesPanel._container, 'taskListeners');

    var eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY),
        listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY),
        listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY);

    // given
    expect(bo.extensionElements.values).to.have.length(2);
    expect(taskListeners).to.have.length(1);

    // when
    TestHelper.triggerEvent(addListenerButton, 'click');

    // set listener value to have a successfully validation
    TestHelper.triggerValue(listenerValue, 'newTaskListenerVal');

    // then
    // check html
    expect(eventType.value).to.equal('create');
    expect(listenerType.value).to.equal('class');
    expect(listenerValue.value).to.equal('newTaskListenerVal');

    // check business object
    taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT);

    expect(bo.extensionElements.values).to.have.length(3);
    expect(taskListeners).to.have.length(2);

    expect(taskListeners[1].get('event')).to.equal(eventType.value);
    expect(taskListeners[1].get('class')).to.equal(listenerValue.value);

  }));


  it('should remove a task listener from extension elements', inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('UserTask_1');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT),

        removeListenerButton = getRemoveButton(propertiesPanel._container);

    var listeners = getSelect(container, 'selectedExtensionElement', 'taskListeners');

    // given
    expect(bo.extensionElements.values).to.have.length(2);
    expect(taskListeners).to.have.length(1);

    expect(listeners.options).to.have.length(1);

    selectListener(propertiesPanel._container, 0);

    // when
    // delete task listener
    TestHelper.triggerEvent(removeListenerButton, 'click');

    // then
    // check html
    expect(listeners.options).to.have.length(0);

    // check business object
    taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT);
    expect(bo.extensionElements.values).to.have.length(1);
    expect(taskListeners).to.have.length(0);

  }));


  it('should add the first task listener to an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('UserTask_2');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT),

        addListenerButton = getAddButton(propertiesPanel._container, 'taskListeners');

    var eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY),
        listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY),
        listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY),
        listeners = getSelect(container, 'selectedExtensionElement', 'taskListeners');

    // given
    expect(bo.extensionElements).not.to.exist;
    expect(taskListeners).to.be.empty;

    expect(listeners.options).to.have.length(0);

    // when
    TestHelper.triggerEvent(addListenerButton, 'click');

    // set listener value to have a successfully validation
    TestHelper.triggerValue(listenerValue, 'newTaskListenerVal');

    // then
    // check html
    expect(listeners.options).to.have.length(1);

    expect(eventType.value).to.equal('create');
    expect(listenerType.value).to.equal('class');
    expect(listenerValue.value).to.equal('newTaskListenerVal');

    // check business object
    taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT);
    expect(bo.extensionElements.values).to.have.length(1);
    expect(taskListeners).to.have.length(1);

    expect(taskListeners[0].get('event')).to.equal(eventType.value);
    expect(taskListeners[0].get('class')).to.equal(listenerValue.value);

  }));


  it('should clear task listener value of the task listener', inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('UserTask_1');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT),

        clearButton = getClearValueButton(propertiesPanel._container, LISTENER_VALUE_ENTRY);

    var eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY),
        listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY),
        listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY);

    selectListener(propertiesPanel._container, 0);

    // given
    expect(eventType.value).to.equal('assignment');
    expect(listenerType.value).to.equal('expression');
    expect(listenerValue.value).to.equal('abc');

    expect(taskListeners).to.have.length(1);
    expect(taskListeners[0].get('event')).to.equal(eventType.value);
    expect(taskListeners[0].get('expression')).to.equal(listenerValue.value);

    // when
    // clear listener value input of task listener
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    // check html
    expect(eventType.value).to.equal('assignment');
    expect(listenerType.value).to.equal('expression');
    expect(listenerValue.value).to.equal('');
    expect(domClasses(listenerValue).has('invalid')).to.be.true;

    // check business object
    taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT);
    expect(taskListeners).to.have.length(1);

    expect(taskListeners[0].get('event')).to.equal(eventType.value);
    expect(taskListeners[0].get('expression')).to.equal('');

  }));


  it('should add two task listener to an element at the same time', inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('UserTask_2');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT),

        addListenerButton = getAddButton(propertiesPanel._container, 'taskListeners');

    var eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY),
        listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY),
        listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY);

    // given
    expect(bo.extensionElements).not.to.exist;
    expect(taskListeners).to.be.empty;

    // when
    // added two new task listener
    TestHelper.triggerEvent(addListenerButton, 'click');
    TestHelper.triggerEvent(addListenerButton, 'click');

    // select first task listener
    selectListener(propertiesPanel._container, 0);
    expect(domClasses(listenerValue).has('invalid')).to.be.true;

    // set listener value to have a successfully validation
    TestHelper.triggerValue(listenerValue, 'taskListenerValOne');

    // check html of first task listener
    expect(eventType.value).to.equal('create');
    expect(listenerType.value).to.equal('class');
    expect(listenerValue.value).to.equal('taskListenerValOne');

    // select second task listener
    selectListener(propertiesPanel._container, 1);
    expect(domClasses(listenerValue).has('invalid')).to.be.true;

    TestHelper.triggerValue(listenerValue, 'taskListenerValTwo');

    // check html of second task listener
    expect(eventType.value).to.equal('create');
    expect(listenerType.value).to.equal('class');
    expect(listenerValue.value).to.equal('taskListenerValTwo');

    // check business object
    taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT);
    expect(bo.extensionElements.values).to.have.length(2);
    expect(taskListeners).to.have.length(2);

    expect(taskListeners[0].get('event')).to.equal('create');
    expect(taskListeners[0].get('class')).to.equal('taskListenerValOne');
    expect(taskListeners[1].get('event')).to.equal('create');
    expect(taskListeners[1].get('class')).to.equal('taskListenerValTwo');

  }));


  it('should undo adding a task listener', inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    // given
    var taskShape = elementRegistry.get('UserTask_2');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape);
    var taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT);

    var addListenerButton = getAddButton(propertiesPanel._container, 'taskListeners'),
        listeners = getSelect(container, 'selectedExtensionElement', 'taskListeners');

    expect(taskListeners).to.have.length(0);
    expect(listeners.options).to.have.length(0);

    // add task listener
    TestHelper.triggerEvent(addListenerButton, 'click');

    // when
    // undo adding the task listener value
    commandStack.undo();

    // then
    expect(listeners.options).to.have.length(0);

    taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT);
    expect(taskListeners).to.have.length(0);

  }));


  it('should redo adding a task listener', inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    // given
    var taskShape = elementRegistry.get('UserTask_2');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape);
    var taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT);

    var addListenerButton = getAddButton(propertiesPanel._container, 'taskListeners'),
        listeners = getSelect(container, 'selectedExtensionElement', 'taskListeners');

    expect(taskListeners).to.have.length(0);
    expect(listeners.options).to.have.length(0);

    // add task listener
    TestHelper.triggerEvent(addListenerButton, 'click');

    // when
    commandStack.undo();
    commandStack.redo();

    // then
    taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT);

    expect(taskListeners).to.have.length(1);
    expect(taskListeners).to.have.length(1);

  }));


  it('should undo adding two task listeners at once', inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    // given
    var taskShape = elementRegistry.get('UserTask_2');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape);

    var addListenerButton = getAddButton(propertiesPanel._container, 'taskListeners'),
        listeners = getSelect(propertiesPanel._container, 'selectedExtensionElement', 'taskListeners');

    TestHelper.triggerEvent(addListenerButton, 'click');
    TestHelper.triggerEvent(addListenerButton, 'click');

    var taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT);

    expect(taskListeners).to.have.length(2);
    expect(listeners.options).to.have.length(2);

    // when
    // undoing only the last added listener
    commandStack.undo();

    // then
    // first task listener exist because only one undo was executed
    taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT);
    expect(taskListeners).to.have.length(1);
    expect(listeners.options).to.have.length(1);

  }));


  it('should redo adding two task listeners at once', inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    // given
    var taskShape = elementRegistry.get('UserTask_2');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape);

    var addListenerButton = getAddButton(propertiesPanel._container, 'taskListeners'),
        listeners = getSelect(propertiesPanel._container, 'selectedExtensionElement', 'taskListeners');

    TestHelper.triggerEvent(addListenerButton, 'click');
    TestHelper.triggerEvent(addListenerButton, 'click');

    var taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT);
    expect(taskListeners).to.have.length(2);
    expect(listeners.options).to.have.length(2);

    // when
    commandStack.undo();
    commandStack.redo();

    // then
    taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT);
    expect(taskListeners).to.have.length(2);
    expect(listeners.options).to.have.length(2);

  }));


  it('should add task listener and execution listener to an element at the same time', inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('UserTask_2');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT),
        executionListeners = getListener(bo.extensionElements, CAMUNDA_EXECUTION_LISTENER_ELEMENT),

        addExecutionListenerButton = getAddButton(propertiesPanel._container, 'executionListeners'),
        addTaskListenerButton = getAddButton(propertiesPanel._container, 'taskListeners');

    var eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY),
        listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY),
        listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY);

    // given
    expect(bo.extensionElements).not.to.exist;
    expect(taskListeners).to.be.empty;
    expect(executionListeners).to.be.empty;

    // when
    // add task listener/execution listener
    TestHelper.triggerEvent(addExecutionListenerButton, 'click');
    TestHelper.triggerEvent(addTaskListenerButton, 'click');

    // set task listener value to have a successfully validation
    TestHelper.triggerValue(listenerValue, 'taskListenerVal', 'change');

    // check html of task listener
    expect(eventType.value).to.equal('create');
    expect(listenerType.value).to.equal('class');
    expect(listenerValue.value).to.equal('taskListenerVal');

    // select execution listener
    selectListener(propertiesPanel._container, 0, 'executionListeners');

    // set execution listener value to have a successfully validation
    TestHelper.triggerValue(listenerValue, 'executionListenerVal', 'change');

    // check html of execution listener
    expect(eventType.value).to.equal('start');
    expect(listenerType.value).to.equal('class');
    expect(listenerValue.value).to.equal('executionListenerVal');

    // check business object
    // taskListener and executionListener exists
    expect(bo.extensionElements.values).to.have.length(2);

    taskListeners = getListener(bo.extensionElements, CAMUNDA_TASK_LISTENER_ELEMENT);
    expect(taskListeners).to.have.length(1);

    executionListeners = getListener(bo.extensionElements, CAMUNDA_EXECUTION_LISTENER_ELEMENT);
    expect(executionListeners).to.have.length(1);

  }));
});
