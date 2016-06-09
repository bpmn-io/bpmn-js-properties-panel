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

describe('collaboration-listener-properties', function() {

  var diagramXML = require('./ExecutionListenerCollaborationTest.bpmn');

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


  it('should fetch execution listener properties for a collaboration process', inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('Participant_One');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        eventTypes = domQuery.all('select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container);

    expect(bo.processRef.extensionElements.values.length).to.equal(1);
    expect(eventTypes.length).to.equal(1);
    expect(listenerTypes.length).to.equal(1);
    expect(listenerValues.length).to.equal(1);

    var extensionElementsValues = bo.processRef.extensionElements.values;
    // execution listener 1
    expect(eventTypes[0].value).to.equal('start');
    expect(listenerTypes[0].value).to.equal('expression');
    expect(listenerValues[0].value).to.equal('userOne');
    expect(extensionElementsValues[0].get('event')).to.equal(eventTypes[0].value);
    expect(extensionElementsValues[0].get('expression')).to.equal(listenerValues[0].value);

  }));


  it('should add the first execution listener to a collaboration process', inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('Participant_Two');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        extensionElements = bo.processRef.extensionElements,

        executionListeners = getExecutionListener(extensionElements),
        addListenerButton = domQuery('[data-entry=executionListeners] > div > button[data-action=addListener]', propertiesPanel._container);

    // given
    expect(extensionElements).to.be.empty;
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
    extensionElements = bo.processRef.extensionElements;
    executionListeners = getExecutionListener(extensionElements);
    expect(extensionElements.values.length).to.equal(1);
    expect(executionListeners.length).to.equal(1);
    expect(executionListeners[0].get('event')).to.equal(eventTypes[0].value);
    expect(executionListeners[0].get('class')).to.equal(listenerValues[0].value);

  }));


  it('should add a new execution listener to an existing extension elements', inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('Participant_One');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        extensionElements = bo.processRef.extensionElements,

        executionListeners = getExecutionListener(extensionElements),
        addListenerButton = domQuery('[data-entry=executionListeners] > div > button[data-action=addListener]', propertiesPanel._container);

    // given
    expect(extensionElements.values.length).to.equal(1);
    expect(executionListeners.length).to.equal(1);

    // when
    TestHelper.triggerEvent(addListenerButton, 'click');

    var eventTypes = domQuery.all('select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container);

    // set listener value to have a successfully validation
    TestHelper.triggerValue(listenerValues[1], 'newExecutionListenerVal');

    // then
    // check html
    expect(eventTypes[1].value).to.equal('start');
    expect(listenerTypes[1].value).to.equal('class');
    expect(listenerValues[1].value).to.equal('newExecutionListenerVal');

    // check business object
    executionListeners = getExecutionListener(extensionElements);
    expect(extensionElements.values.length).to.equal(2);
    expect(executionListeners.length).to.equal(2);
    expect(executionListeners[1].get('event')).to.equal(eventTypes[1].value);
    expect(executionListeners[1].get('class')).to.equal(listenerValues[1].value);

  }));


  it('should remove an execution listener from extension elements', inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('Participant_One');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        extensionElements = bo.processRef.extensionElements,

        executionListeners = getExecutionListener(extensionElements),
        removeListenerButtons = domQuery.all('[data-entry=executionListeners] button[data-action=removeListener]', propertiesPanel._container);

    // given
    expect(extensionElements.values.length).to.equal(1);
    expect(executionListeners.length).to.equal(1);
    expect(removeListenerButtons.length).to.equal(1);

    // when
    // delete execution listener
    TestHelper.triggerEvent(removeListenerButtons[0], 'click');

    // then
    var eventTypes = domQuery.all('select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container);

    // check html
    expect(eventTypes.length).to.equal(0);
    expect(listenerTypes.length).to.equal(0);
    expect(listenerValues.length).to.equal(0);

    // check business object
    extensionElements = bo.processRef.extensionElements;
    executionListeners = getExecutionListener(extensionElements);
    expect(extensionElements).to.be.empty;
    expect(executionListeners).to.be.empty;

  }));

});
