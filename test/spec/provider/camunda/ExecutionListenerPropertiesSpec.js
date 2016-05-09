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

describe('listener-properties', function() {

  var diagramXML = require('./ExecutionListenerPropertyTest.bpmn');

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

  function getExecutionListener(extensionElements) {
    var executionListeners = [];
    if (!!extensionElements && !!extensionElements.values) {
      forEach(extensionElements.values, function(value) {
        if (is(value, 'camunda:ExecutionListener')) {
          executionListeners.push(value);
        }
      });
    }
    return executionListeners;
  }


  it('should fetch execution listener properties for a flow element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('ServiceTask_Execution');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        eventTypes = domQuery.all('select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container);

    expect(bo.extensionElements.values.length).to.equal(3);
    expect(eventTypes.length).to.equal(2);
    expect(listenerTypes.length).to.equal(2);
    expect(listenerValues.length).to.equal(2);

    var extensionElementsValues = bo.extensionElements.values;
    // execution listener 1
    expect(eventTypes[0].value).to.equal('end');
    expect(listenerTypes[0].value).to.equal('expression');
    expect(listenerValues[0].value).to.equal('executionListenerExpr');
    expect(extensionElementsValues[0].get('event')).to.equal(eventTypes[0].value);
    expect(extensionElementsValues[0].get('expression')).to.equal(listenerValues[0].value);
    // execution listener 2
    expect(eventTypes[1].value).to.equal('start');
    expect(listenerTypes[1].value).to.equal('expression');
    expect(listenerValues[1].value).to.equal('abc');
    expect(extensionElementsValues[1].get('event')).to.equal(eventTypes[1].value);
    expect(extensionElementsValues[1].get('expression')).to.equal(listenerValues[1].value);

  }));


  it('should fetch execution listener properties for a sequence flow',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('SequenceFlow_1');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        eventTypes = domQuery.all('.djs-properties-static', propertiesPanel._container),
        listenerTypes = domQuery.all('select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container);

    expect(bo.extensionElements.values.length).to.equal(1);
    expect(eventTypes.length).to.equal(1);
    expect(listenerTypes.length).to.equal(1);
    expect(listenerValues.length).to.equal(1);

    var extensionElementsValues = bo.extensionElements.values;
    expect(eventTypes[0].textContent).to.equal('take');
    expect(listenerTypes[0].value).to.equal('delegateExpression');
    expect(listenerValues[0].value).to.equal('foo');
    expect(extensionElementsValues[0].get('event')).to.equal(eventTypes[0].textContent);
    expect(extensionElementsValues[0].get('delegateExpression')).to.equal(listenerValues[0].value);

  }));


  it('should not fetch execution listener properties for a text annotation',
      inject(function(propertiesPanel, selection, elementRegistry) {


    var taskShape = elementRegistry.get('TextAnnotation_1');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        eventTypes = domQuery.all('select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container);

    expect(is(bo, 'bpmn:FlowElement')).to.be.false;
    expect(eventTypes.length).to.equal(0);
    expect(listenerTypes.length).to.equal(0);
    expect(listenerValues.length).to.equal(0);

  }));


  it('should change properties of the first execution listener',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('ServiceTask_Execution');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        executionListeners = getExecutionListener(bo.extensionElements),
        eventTypes = domQuery.all('select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container);

    // given
    expect(bo.extensionElements.values.length).to.equal(3);
    expect(executionListeners.length).to.equal(2);

    // first execution listener
    expect(eventTypes[0].value).to.equal('end');
    expect(listenerTypes[0].value).to.equal('expression');
    expect(listenerValues[0].value).to.equal('executionListenerExpr');
    expect(executionListeners[0].get('event')).to.equal(eventTypes[0].value);
    expect(executionListeners[0].get('expression')).to.equal(listenerValues[0].value);
    // second execution listener
    expect(eventTypes[1].value).to.equal('start');
    expect(listenerTypes[1].value).to.equal('expression');
    expect(listenerValues[1].value).to.equal('abc');

    // when
    // select 'start'
    eventTypes[0].options[0].selected = 'selected';
    TestHelper.triggerEvent(eventTypes[0], 'change');
    // select 'java class'
    listenerTypes[0].options[0].selected = 'selected';
    TestHelper.triggerEvent(listenerTypes[0], 'change');
    TestHelper.triggerValue(listenerValues[0], 'newValue');

    // then
    executionListeners = getExecutionListener(bo.extensionElements);
    // first execution listener have new values
    expect(eventTypes[0].value).to.equal('start');
    expect(listenerTypes[0].value).to.equal('class');
    expect(listenerValues[0].value).to.equal('newValue');
    expect(executionListeners[0].get('event')).to.equal(eventTypes[0].value);
    expect(executionListeners[0].get('class')).to.equal(listenerValues[0].value);
    expect(executionListeners[0].get('expression')).to.be.undefined;
    // second execution listener have no changes
    expect(eventTypes[1].value).to.equal('start');
    expect(listenerTypes[1].value).to.equal('expression');
    expect(listenerValues[1].value).to.equal('abc');
  }));


  it('should add a new execution listener to an existing extension elements',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('ServiceTask_Execution');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        executionListeners = getExecutionListener(bo.extensionElements),
        addListenerButton = domQuery('[data-entry=executionListeners] > div > button[data-action=addListener]', propertiesPanel._container);

    // given
    expect(bo.extensionElements.values.length).to.equal(3);
    expect(executionListeners.length).to.equal(2);

    // when
    TestHelper.triggerEvent(addListenerButton, 'click');

    var eventTypes = domQuery.all('select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container);

    // set listener value to have a successfully validation
    TestHelper.triggerValue(listenerValues[2], 'newExecutionListenerVal');

    // then
    // check html
    expect(eventTypes[2].value).to.equal('start');
    expect(listenerTypes[2].value).to.equal('class');
    expect(listenerValues[2].value).to.equal('newExecutionListenerVal');

    // check business object
    executionListeners = getExecutionListener(bo.extensionElements);
    expect(bo.extensionElements.values.length).to.equal(4);
    expect(executionListeners.length).to.equal(3);
    expect(executionListeners[2].get('event')).to.equal(eventTypes[2].value);
    expect(executionListeners[2].get('class')).to.equal(listenerValues[2].value);

  }));


  it('should remove an execution listener from extension elements',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('ServiceTask_Execution');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        executionListeners = getExecutionListener(bo.extensionElements),
        removeListenerButtons = domQuery.all('[data-entry=executionListeners] button[data-action=removeListener]', propertiesPanel._container);

    // given
    expect(bo.extensionElements.values.length).to.equal(3);
    expect(executionListeners.length).to.equal(2);
    expect(removeListenerButtons.length).to.equal(2);

    // when
    // delete first execution listener
    TestHelper.triggerEvent(removeListenerButtons[0], 'click');

    // then
    var eventTypes = domQuery.all('select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container);

    // check html
    expect(eventTypes[0].value).to.equal('start');
    expect(listenerTypes[0].value).to.equal('expression');
    expect(listenerValues[0].value).to.equal('abc');

    // check business object
    executionListeners = getExecutionListener(bo.extensionElements);
    expect(bo.extensionElements.values.length).to.equal(2);
    expect(executionListeners.length).to.equal(1);
    expect(executionListeners[0].get('event')).to.equal(eventTypes[0].value);
    expect(executionListeners[0].get('expression')).to.equal(listenerValues[0].value);

  }));


  it('should add the first execution listener to an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('ServiceTask_2');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        executionListeners = getExecutionListener(bo.extensionElements),
        addListenerButton = domQuery('[data-entry=executionListeners] > div > button[data-action=addListener]', propertiesPanel._container);

    // given
    expect(bo.extensionElements).to.be.empty;
    expect(executionListeners).to.be.empty;

    // when
    TestHelper.triggerEvent(addListenerButton, 'click');

    var eventTypes = domQuery.all('select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container);

    // set listener value to have a successfully validation
    TestHelper.triggerValue(listenerValues[0], 'newExecutionListenerVal');

    // then
    // check html
    expect(eventTypes[0].value).to.equal('start');
    expect(listenerTypes[0].value).to.equal('class');
    expect(listenerValues[0].value).to.equal('newExecutionListenerVal');

    // check business object
    executionListeners = getExecutionListener(bo.extensionElements);
    expect(bo.extensionElements.values.length).to.equal(1);
    expect(executionListeners.length).to.equal(1);
    expect(executionListeners[0].get('event')).to.equal(eventTypes[0].value);
    expect(executionListeners[0].get('class')).to.equal(listenerValues[0].value);

  }));


  it('should clear execution listener value of the first execution listener',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('ServiceTask_Execution');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        executionListeners = getExecutionListener(bo.extensionElements),
        eventTypes = domQuery.all('select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container),
        clearButtons = domQuery.all('[data-entry=executionListeners] button[data-action=clearListenerValue]', propertiesPanel._container);

    // given
    expect(clearButtons.length).to.equal(2);
    expect(eventTypes[0].value).to.equal('end');
    expect(listenerTypes[0].value).to.equal('expression');
    expect(listenerValues[0].value).to.equal('executionListenerExpr');
    expect(executionListeners.length).to.equal(2);
    expect(executionListeners[0].get('event')).to.equal(eventTypes[0].value);
    expect(executionListeners[0].get('expression')).to.equal(listenerValues[0].value);

    // when
    // clear listener value input of first execution listener
    TestHelper.triggerEvent(clearButtons[0], 'click');

    // then
    // check html
    expect(eventTypes[0].value).to.equal('end');
    expect(listenerTypes[0].value).to.equal('expression');
    expect(listenerValues[0].className).to.equal('invalid');

    // check business object
    executionListeners = getExecutionListener(bo.extensionElements);
    expect(executionListeners.length).to.equal(2);
    expect(executionListeners[0].get('event')).to.equal(eventTypes[0].value);
    expect(executionListeners[0].get('expression')).to.equal('');

  }));


  it('should add a new execution listener for a sequence flow to an existing extension elements',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('SequenceFlow_1');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        executionListeners = getExecutionListener(bo.extensionElements),
        addListenerButton = domQuery('[data-entry=executionListeners] > div > button[data-action=addListener]', propertiesPanel._container);

    // given
    expect(bo.extensionElements.values.length).to.equal(1);
    expect(executionListeners.length).to.equal(1);

    // when
    TestHelper.triggerEvent(addListenerButton, 'click');

    var eventTypes = domQuery.all('.djs-properties-static', propertiesPanel._container),
        listenerTypes = domQuery.all('select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container);

    // set listener value to have a successfully validation
    TestHelper.triggerValue(listenerValues[1], 'newSequenceFlowListener');

    // then
    // check html
    expect(eventTypes[1].textContent).to.equal('take');
    expect(listenerTypes[1].value).to.equal('class');
    expect(listenerValues[1].value).to.equal('newSequenceFlowListener');

    // check business object
    executionListeners = getExecutionListener(bo.extensionElements);
    expect(bo.extensionElements.values.length).to.equal(2);
    expect(executionListeners.length).to.equal(2);
    expect(executionListeners[1].get('event')).to.equal(eventTypes[1].textContent);
    expect(executionListeners[1].get('class')).to.equal(listenerValues[1].value);

  }));


  it('should add two execution listener to an element at the same time',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('ServiceTask_2');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        executionListeners = getExecutionListener(bo.extensionElements),
        addListenerButton = domQuery('[data-entry=executionListeners] > div > button[data-action=addListener]', propertiesPanel._container);

    // given
    expect(bo.extensionElements).to.be.empty;
    expect(executionListeners).to.be.empty;

    // when
    // added two new execution listener
    TestHelper.triggerEvent(addListenerButton, 'click');
    TestHelper.triggerEvent(addListenerButton, 'click');

    var eventTypes = domQuery.all('select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container);

    // set listener value to have a successfully validation
    TestHelper.triggerValue(listenerValues[0], 'executionListenerValOne');
    TestHelper.triggerValue(listenerValues[1], 'executionListenerValTwo');

    // then
    // check html of first execution listener
    expect(eventTypes[0].value).to.equal('start');
    expect(listenerTypes[0].value).to.equal('class');
    expect(listenerValues[0].value).to.equal('executionListenerValOne');
    // check html of second execution listener
    expect(eventTypes[1].value).to.equal('start');
    expect(listenerTypes[1].value).to.equal('class');
    expect(listenerValues[1].value).to.equal('executionListenerValTwo');

    // check business object
    executionListeners = getExecutionListener(bo.extensionElements);
    expect(bo.extensionElements.values.length).to.equal(2);
    expect(executionListeners.length).to.equal(2);
    expect(executionListeners[0].get('event')).to.equal(eventTypes[0].value);
    expect(executionListeners[0].get('class')).to.equal(listenerValues[0].value);
    expect(executionListeners[1].get('event')).to.equal(eventTypes[1].value);
    expect(executionListeners[1].get('class')).to.equal(listenerValues[1].value);

  }));


  it('should undo adding an execution listener',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    // given
    var taskShape = elementRegistry.get('ServiceTask_2'),
        bo = getBusinessObject(taskShape);

    selection.select(taskShape);

    var query = '[data-entry=executionListeners] > div > button[data-action=addListener]',
        addListenerButton = domQuery(query, propertiesPanel._container);

    TestHelper.triggerEvent(addListenerButton, 'click');

    var listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container);

    // add execution listener value to first execution listener
    TestHelper.triggerValue(listenerValues[0], 'executionListenerValOne');

    // when
    // undo adding the execution listener value
    commandStack.undo();

    // then
    var executionListeners = getExecutionListener(bo.extensionElements);

    // execution listener exist with an invalid input field
    expect(executionListeners).to.have.length.of(1);

    expect(listenerValues[0].value).to.be.empty;
    expect(listenerValues[0].className).to.equal('invalid');
  }));


  it('should redo adding an execution listener',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    // given
    var taskShape = elementRegistry.get('ServiceTask_2'),
        bo = getBusinessObject(taskShape);

    selection.select(taskShape);

    var query = '[data-entry=executionListeners] > div > button[data-action=addListener]',
        addListenerButton = domQuery(query, propertiesPanel._container);

    TestHelper.triggerEvent(addListenerButton, 'click');

    var listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container);

    TestHelper.triggerValue(listenerValues[0], 'executionListenerValOne');

    // when
    commandStack.undo();
    commandStack.redo();

    // then
    var executionListeners = getExecutionListener(bo.extensionElements);

    expect(executionListeners).to.have.length.of(1);

  }));


  it('should undo adding two execution listeners at once',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    // given
    var taskShape = elementRegistry.get('ServiceTask_2'),
        bo = getBusinessObject(taskShape);

    selection.select(taskShape);

    var query = '[data-entry=executionListeners] > div > button[data-action=addListener]',
        addListenerButton = domQuery(query, propertiesPanel._container);

    TestHelper.triggerEvent(addListenerButton, 'click');
    TestHelper.triggerEvent(addListenerButton, 'click');

    var listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container);

    // add execution listener value to both execution listeners
    TestHelper.triggerValue(listenerValues[0], 'executionListenerValOne');
    TestHelper.triggerValue(listenerValues[1], 'executionListenerValTwo');

    // when
    // undo adding the last execution listener value
    commandStack.undo();

    // then
    var executionListeners = getExecutionListener(bo.extensionElements);

    // second execution listener exist with an invalid input field
    expect(executionListeners).to.have.length.of(2);

    expect(listenerValues[0].value).to.equal('executionListenerValOne');
    expect(listenerValues[1].value).to.be.empty;
    expect(listenerValues[1].className).to.equal('invalid');

  }));


  it('should redo adding two execution listeners at once',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    // given
    var taskShape = elementRegistry.get('ServiceTask_2'),
        bo = getBusinessObject(taskShape);

    selection.select(taskShape);

    var query = '[data-entry=executionListeners] > div > button[data-action=addListener]',
        addListenerButton = domQuery(query, propertiesPanel._container);

    TestHelper.triggerEvent(addListenerButton, 'click');
    TestHelper.triggerEvent(addListenerButton, 'click');

    var listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container);

    TestHelper.triggerValue(listenerValues[0], 'executionListenerValOne');
    TestHelper.triggerValue(listenerValues[1], 'executionListenerValTwo');

    // when
    commandStack.undo();
    commandStack.redo();

    // then
    var executionListeners = getExecutionListener(bo.extensionElements);

    expect(executionListeners).to.have.length.of(2);

  }));


  it('should fetch two invalid property fields when adding two execution listeners at once',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    // given
    var taskShape = elementRegistry.get('ServiceTask_2'),
        bo = getBusinessObject(taskShape);

    selection.select(taskShape);

    var query = '[data-entry=executionListeners] > div > button[data-action=addListener]',
        addListenerButton = domQuery(query, propertiesPanel._container);

    // given
    var executionListeners = getExecutionListener(bo.extensionElements);
    expect(executionListeners).to.have.length.of(0);

    // when
    TestHelper.triggerEvent(addListenerButton, 'click');
    TestHelper.triggerEvent(addListenerButton, 'click');

    var listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container),
        errorMessages = domQuery.all('.pp-error-message', propertiesPanel._container);

    // then
    expect(listenerValues[0].className).to.equal('invalid');
    expect(listenerValues[1].className).to.equal('invalid');
    expect(errorMessages).to.have.length(2);
    expect(errorMessages[0].textContent).to.equal('Must provide a value');
    expect(errorMessages[1].textContent).to.equal('Must provide a value');

  }));

});
