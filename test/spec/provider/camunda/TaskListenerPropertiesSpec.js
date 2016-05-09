'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
  domQuery = require('min-dom/lib/query'),
  forEach = require('lodash/collection/forEach'),
  is = require('bpmn-js/lib/util/ModelUtil').is,
  coreModule = require('bpmn-js/lib/core'),
  selectionModule = require('diagram-js/lib/features/selection'),
  modelingModule = require('bpmn-js/lib/features/modeling'),
  propertiesProviderModule = require('../../../../lib/provider/camunda'),
  camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

describe('task-listener-properties', function() {

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
    moddleExtensions: {camunda: camundaModdlePackage}
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

  function getTaskListener(extensionElements) {
    var taskListeners = [];
    if (!!extensionElements && !!extensionElements.values) {
      forEach(extensionElements.values, function(value) {
        if (is(value, 'camunda:TaskListener')) {
          taskListeners.push(value);
        }
      });
    }
    return taskListeners;
  }


  it('should fetch task listener properties for an user task',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('UserTask_1');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        eventTypes = domQuery.all('select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container);

    expect(bo.extensionElements.values).to.have.length.of(2);
    expect(eventTypes).to.have.length.of(2);
    expect(listenerTypes).to.have.length.of(2);
    expect(listenerValues).to.have.length.of(2);

    var extensionElementsValues = bo.extensionElements.values;
    // execution listener
    expect(eventTypes[0].value).to.equal('end');
    expect(listenerTypes[0].value).to.equal('expression');
    expect(listenerValues[0].value).to.equal('executionListenerExpr');
    expect(is(extensionElementsValues[0], 'camunda:ExecutionListener')).to.be.true;
    expect(extensionElementsValues[0].get('event')).to.equal(eventTypes[0].value);
    expect(extensionElementsValues[0].get('expression')).to.equal(listenerValues[0].value);
    // task listener
    expect(eventTypes[1].value).to.equal('assignment');
    expect(listenerTypes[1].value).to.equal('expression');
    expect(listenerValues[1].value).to.equal('abc');
    expect(is(extensionElementsValues[1], 'camunda:TaskListener')).to.be.true;
    expect(extensionElementsValues[1].get('event')).to.equal(eventTypes[1].value);
    expect(extensionElementsValues[1].get('expression')).to.equal(listenerValues[1].value);

  }));


  it('should not fetch task listener properties for a sequence flow',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('SequenceFlow_1');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        taskListenersEntry = domQuery.all('[data-entry=taskListeners]', propertiesPanel._container);

    expect(bo.extensionElements.values).to.have.length.of(1);
    expect(taskListenersEntry).to.have.length(0);

    expect(is(bo.extensionElements.values[0], 'camunda:ExecutionListener')).to.be.true;
    expect(is(bo.extensionElements.values[0], 'camunda:TaskListener')).to.be.false;

  }));


  it('should change properties of a task listener',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('UserTask_1');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        taskListeners = getTaskListener(bo.extensionElements),
        eventTypes = domQuery.all('[data-entry=taskListeners] select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('[data-entry=taskListeners] select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('[data-entry=taskListeners] input[name=listenerValue]', propertiesPanel._container);

    // given
    expect(bo.extensionElements.values).to.have.length.of(2);
    expect(taskListeners).to.have.length.of(1);
    expect(eventTypes).to.have.length.of(1);
    expect(listenerTypes).to.have.length.of(1);
    expect(listenerValues).to.have.length.of(1);

    expect(eventTypes[0].value).to.equal('assignment');
    expect(listenerTypes[0].value).to.equal('expression');
    expect(listenerValues[0].value).to.equal('abc');
    expect(taskListeners[0].get('event')).to.equal(eventTypes[0].value);
    expect(taskListeners[0].get('expression')).to.equal(listenerValues[0].value);

    // when
    // select 'create'
    eventTypes[0].options[0].selected = 'selected';
    TestHelper.triggerEvent(eventTypes[0], 'change');
    // select 'java class'
    listenerTypes[0].options[0].selected = 'selected';
    TestHelper.triggerEvent(listenerTypes[0], 'change');

    // then
    taskListeners = getTaskListener(bo.extensionElements);

    expect(eventTypes[0].value).to.equal('create');
    expect(listenerTypes[0].value).to.equal('class');
    expect(listenerValues[0].value).to.equal('abc');
    expect(taskListeners[0].get('event')).to.equal(eventTypes[0].value);
    expect(taskListeners[0].get('class')).to.equal(listenerValues[0].value);
    expect(taskListeners[0].get('expression')).to.be.undefined;
  }));


  it('should add a new task listener to an existing extension elements',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('UserTask_1');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        taskListeners = getTaskListener(bo.extensionElements),
        addListenerButton = domQuery('[data-entry=taskListeners] > div > button[data-action=addListener]', propertiesPanel._container);

    // given
    expect(bo.extensionElements.values).to.have.length.of(2);
    expect(taskListeners).to.have.length.of(1);

    // when
    TestHelper.triggerEvent(addListenerButton, 'click');

    var eventTypes = domQuery.all('[data-entry=taskListeners] select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('[data-entry=taskListeners] select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('[data-entry=taskListeners] input[name=listenerValue]', propertiesPanel._container);

    // set listener value to have a successfully validation
    TestHelper.triggerValue(listenerValues[1], 'newTaskListenerVal');

    // then
    // check html
    expect(eventTypes[1].value).to.equal('create');
    expect(listenerTypes[1].value).to.equal('class');
    expect(listenerValues[1].value).to.equal('newTaskListenerVal');

    // check business object
    taskListeners = getTaskListener(bo.extensionElements);
    expect(bo.extensionElements.values).to.have.length.of(3);
    expect(taskListeners).to.have.length.of(2);
    expect(taskListeners[1].get('event')).to.equal(eventTypes[1].value);
    expect(taskListeners[1].get('class')).to.equal(listenerValues[1].value);

  }));


  it('should remove a task listener from extension elements',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('UserTask_1');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        taskListeners = getTaskListener(bo.extensionElements),
        removeListenerButtons = domQuery.all('[data-entry=taskListeners] button[data-action=removeListener]', propertiesPanel._container);

    // given
    expect(bo.extensionElements.values).to.have.length.of(2);
    expect(taskListeners).to.have.length.of(1);
    expect(removeListenerButtons).to.have.length.of(1);

    // when
    // delete task listener
    TestHelper.triggerEvent(removeListenerButtons[0], 'click');

    // then
    var eventTypes = domQuery.all('[data-entry=taskListeners] select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('[data-entry=taskListeners] select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('[data-entry=taskListeners] input[name=listenerValue]', propertiesPanel._container);

    // check html
    expect(eventTypes[0]).to.be.undefined;
    expect(listenerTypes[0]).to.be.undefined;
    expect(listenerValues[0]).to.be.undefined;

    // check business object
    taskListeners = getTaskListener(bo.extensionElements);
    expect(bo.extensionElements.values).to.have.length.of(1);
    expect(taskListeners).to.have.length.of(0);

  }));


  it('should add the first task listener to an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('UserTask_2');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        taskListeners = getTaskListener(bo.extensionElements),
        addListenerButton = domQuery('[data-entry=taskListeners] > div > button[data-action=addListener]', propertiesPanel._container);

    // given
    expect(bo.extensionElements).to.be.empty;
    expect(taskListeners).to.be.empty;

    // when
    TestHelper.triggerEvent(addListenerButton, 'click');

    var eventTypes = domQuery.all('[data-entry=taskListeners] select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('[data-entry=taskListeners] select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('[data-entry=taskListeners] input[name=listenerValue]', propertiesPanel._container);

    // set listener value to have a successfully validation
    TestHelper.triggerValue(listenerValues[0], 'newTaskListenerVal');

    // then
    // check html
    expect(eventTypes[0].value).to.equal('create');
    expect(listenerTypes[0].value).to.equal('class');
    expect(listenerValues[0].value).to.equal('newTaskListenerVal');

    // check business object
    taskListeners = getTaskListener(bo.extensionElements);
    expect(bo.extensionElements.values).to.have.length.of(1);
    expect(taskListeners).to.have.length.of(1);
    expect(taskListeners[0].get('event')).to.equal(eventTypes[0].value);
    expect(taskListeners[0].get('class')).to.equal(listenerValues[0].value);

  }));


  it('should clear task listener value of the task listener',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('UserTask_1');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        taskListeners = getTaskListener(bo.extensionElements),
        eventTypes = domQuery.all('[data-entry=taskListeners] select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('[data-entry=taskListeners] select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('[data-entry=taskListeners] input[name=listenerValue]', propertiesPanel._container),
        clearButtons = domQuery.all('[data-entry=taskListeners] button[data-action=clearListenerValue]', propertiesPanel._container);

    // given
    expect(clearButtons).to.have.length.of(1);
    expect(eventTypes[0].value).to.equal('assignment');
    expect(listenerTypes[0].value).to.equal('expression');
    expect(listenerValues[0].value).to.equal('abc');
    expect(taskListeners).to.have.length.of(1);
    expect(taskListeners[0].get('event')).to.equal(eventTypes[0].value);
    expect(taskListeners[0].get('expression')).to.equal(listenerValues[0].value);

    // when
    // clear listener value input of task listener
    TestHelper.triggerEvent(clearButtons[0], 'click');

    // then
    // check html
    expect(eventTypes[0].value).to.equal('assignment');
    expect(listenerTypes[0].value).to.equal('expression');

    // check business object
    taskListeners = getTaskListener(bo.extensionElements);
    expect(taskListeners).to.have.length.of(1);
    expect(taskListeners[0].get('event')).to.equal(eventTypes[0].value);
    expect(taskListeners[0].get('expression')).to.equal('');

  }));


  it('should add two task listener to an element at the same time',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('UserTask_2');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        taskListeners = getTaskListener(bo.extensionElements),
        addListenerButton = domQuery('[data-entry=taskListeners] > div > button[data-action=addListener]', propertiesPanel._container);

    // given
    expect(bo.extensionElements).to.be.empty;
    expect(taskListeners).to.be.empty;

    // when
    // added two new task listener
    TestHelper.triggerEvent(addListenerButton, 'click');
    TestHelper.triggerEvent(addListenerButton, 'click');

    var eventTypes = domQuery.all('[data-entry=taskListeners] select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('[data-entry=taskListeners] select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('[data-entry=taskListeners] input[name=listenerValue]', propertiesPanel._container),
        errorMessages = domQuery.all('.pp-error-message', propertiesPanel._container);

    expect(listenerValues[0].className).to.equal('invalid');
    expect(listenerValues[0].className).to.equal('invalid');
    expect(errorMessages).to.have.length(2);
    expect(errorMessages[0].textContent).to.equal('Must provide a value');
    expect(errorMessages[1].textContent).to.equal('Must provide a value');

    // set listener value to have a successfully validation
    TestHelper.triggerValue(listenerValues[0], 'taskListenerValOne');
    TestHelper.triggerValue(listenerValues[1], 'taskListenerValTwo');

    // then
    errorMessages = domQuery.all('.pp-error-message', propertiesPanel._container);
    expect(errorMessages).to.have.length(0);

    // check html of first task listener
    expect(eventTypes[0].value).to.equal('create');
    expect(listenerTypes[0].value).to.equal('class');
    expect(listenerValues[0].value).to.equal('taskListenerValOne');
    // check html of second task listener
    expect(eventTypes[1].value).to.equal('create');
    expect(listenerTypes[1].value).to.equal('class');
    expect(listenerValues[1].value).to.equal('taskListenerValTwo');

    // check business object
    taskListeners = getTaskListener(bo.extensionElements);
    expect(bo.extensionElements.values).to.have.length.of(2);
    expect(taskListeners).to.have.length.of(2);
    expect(taskListeners[0].get('event')).to.equal(eventTypes[0].value);
    expect(taskListeners[0].get('class')).to.equal(listenerValues[0].value);
    expect(taskListeners[1].get('event')).to.equal(eventTypes[1].value);
    expect(taskListeners[1].get('class')).to.equal(listenerValues[1].value);

  }));


  it('should undo adding a task listener',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    // given
    var taskShape = elementRegistry.get('UserTask_2'),
        bo = getBusinessObject(taskShape);

    selection.select(taskShape);

    var query = '[data-entry=taskListeners] > div > button[data-action=addListener]',
        addListenerButton = domQuery(query, propertiesPanel._container);

    TestHelper.triggerEvent(addListenerButton, 'click');

    var listenerValues = domQuery.all('[data-entry=taskListeners] input[name=listenerValue]', propertiesPanel._container);

    // add task listener value to the task listener
    TestHelper.triggerValue(listenerValues[0], 'taskListenerValOne');

    // when
    // undo adding the task listener value
    commandStack.undo();

    // then
    var taskListeners = getTaskListener(bo.extensionElements);

    // task listener exist with an invalid input field
    expect(taskListeners).to.have.length.of(1);

    expect(listenerValues[0].value).to.be.empty;
    expect(listenerValues[0].className).to.equal('invalid');
  }));


  it('should redo adding a task listener',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    // given
    var taskShape = elementRegistry.get('UserTask_2'),
        bo = getBusinessObject(taskShape);

    selection.select(taskShape);

    var query = '[data-entry=taskListeners] > div > button[data-action=addListener]',
        addListenerButton = domQuery(query, propertiesPanel._container);

    TestHelper.triggerEvent(addListenerButton, 'click');

    var listenerValues = domQuery.all('[data-entry=taskListeners] input[name=listenerValue]', propertiesPanel._container);

    TestHelper.triggerValue(listenerValues[0], 'taskListenerValOne');

    // when
    commandStack.undo();
    commandStack.redo();

    // then
    var taskListeners = getTaskListener(bo.extensionElements);

    expect(taskListeners).to.have.length.of(1);

  }));


  it('should undo adding two task listeners at once',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    // given
    var taskShape = elementRegistry.get('UserTask_2'),
        bo = getBusinessObject(taskShape);

    selection.select(taskShape);

    var query = '[data-entry=taskListeners] > div > button[data-action=addListener]',
        addListenerButton = domQuery(query, propertiesPanel._container);

    TestHelper.triggerEvent(addListenerButton, 'click');
    TestHelper.triggerEvent(addListenerButton, 'click');

    var listenerValues = domQuery.all('[data-entry=taskListeners] input[name=listenerValue]', propertiesPanel._container);

    // add task listener value to both the task listeners
    TestHelper.triggerValue(listenerValues[0], 'taskListenerValOne');
    TestHelper.triggerValue(listenerValues[1], 'taskListenerValTwo');

    // when
    // undo adding the last execution listener value
    commandStack.undo();

    // then
    var taskListeners = getTaskListener(bo.extensionElements);

    // second execution listener exist with an invalid input field
    expect(taskListeners).to.have.length.of(2);

    expect(listenerValues[0].value).to.equal('taskListenerValOne');
    expect(listenerValues[1].value).to.be.empty;
    expect(listenerValues[1].className).to.equal('invalid');

  }));


  it('should redo adding two task listeners at once',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    // given
    var taskShape = elementRegistry.get('UserTask_2'),
        bo = getBusinessObject(taskShape);

    selection.select(taskShape);

    var query = '[data-entry=taskListeners] > div > button[data-action=addListener]',
        addListenerButton = domQuery(query, propertiesPanel._container);

    TestHelper.triggerEvent(addListenerButton, 'click');
    TestHelper.triggerEvent(addListenerButton, 'click');

    var listenerValues = domQuery.all('[data-entry=taskListeners] input[name=listenerValue]', propertiesPanel._container);

    TestHelper.triggerValue(listenerValues[0], 'taskListenerValOne');
    TestHelper.triggerValue(listenerValues[1], 'taskListenerValTwo');

    // when
    commandStack.undo();
    commandStack.redo();

    // then
    var taskListeners = getTaskListener(bo.extensionElements);

    expect(taskListeners).to.have.length.of(2);

  }));


  it('should add task listener and execution listener to an element at the same time',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('UserTask_2');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        taskListeners = getTaskListener(bo.extensionElements),
        addExecutionListenerButton = domQuery('[data-entry=executionListeners] > div > button[data-action=addListener]', propertiesPanel._container),
        addTaskListenerButton = domQuery('[data-entry=taskListeners] > div > button[data-action=addListener]', propertiesPanel._container);

    // given
    expect(bo.extensionElements).to.be.empty;
    expect(taskListeners).to.be.empty;

    // when
    // add task listener/execution listener
    TestHelper.triggerEvent(addExecutionListenerButton, 'click');
    TestHelper.triggerEvent(addTaskListenerButton, 'click');

    var taskEventTypes = domQuery.all('[data-entry=taskListeners] select[name=eventType]', propertiesPanel._container),
        taskListenerTypes = domQuery.all('[data-entry=taskListeners] select[name=listenerType]', propertiesPanel._container),
        taskListenerValues = domQuery.all('[data-entry=taskListeners] input[name=listenerValue]', propertiesPanel._container);

    var eventTypes = domQuery.all('[data-entry=executionListeners] select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('[data-entry=executionListeners] select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('[data-entry=executionListeners] input[name=listenerValue]', propertiesPanel._container);

    // set listener value to have a successfully validation
    TestHelper.triggerValue(taskListenerValues[0], 'taskListenerVal');
    TestHelper.triggerValue(listenerValues[0], 'executionListenerVal');

    // then
    // check html of task listener
    expect(taskEventTypes[0].value).to.equal('create');
    expect(taskListenerTypes[0].value).to.equal('class');
    expect(taskListenerValues[0].value).to.equal('taskListenerVal');
    // check html of execution listener
    expect(eventTypes[0].value).to.equal('start');
    expect(listenerTypes[0].value).to.equal('class');
    expect(listenerValues[0].value).to.equal('executionListenerVal');

    // check business object
    // taskListener and executionListener exists with invalid input fields because
    // every state is saved
    expect(bo.extensionElements.values).to.have.length.of(2);

  }));
});
