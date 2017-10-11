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

  function getListenersTab(container) {
    return domQuery('div[data-tab="listeners"]', container);
  }

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

  function getInput(container, selector, dataEntrySelector) {
    return domQuery('div[data-entry=' + dataEntrySelector + '] input[name=' + selector + ']', container);
  }

  function getSelect(container, selector, dataEntrySelector) {
    return domQuery('div[data-entry=' + dataEntrySelector + '] select[name=' + selector + ']', container);
  }

  function getAddButton(container) {
    return domQuery('div[data-entry=executionListeners] button[data-action=createElement]', container);
  }

  function getRemoveButton(container) {
    return domQuery('div[data-entry=executionListeners] button[data-action=removeElement]', container);
  }

  function selectListener(container) {
    var listeners = getSelect(container, 'selectedExtensionElement', 'executionListeners');

    listeners.options[0].selected = 'selected';
    TestHelper.triggerEvent(listeners, 'change');
  }

  var LISTENER_EVENT_TYPE_ENTRY = 'listener-event-type',
      LISTENER_TYPE_ENTRY = 'listener-type',
      LISTENER_VALUE_ENTRY = 'listener-value';


  describe('get', function() {

    it('should fetch execution listener properties for a collaboration process',
      inject(function(propertiesPanel, selection, elementRegistry) {

        var taskShape = elementRegistry.get('Participant_One');
        selection.select(taskShape);

        var bo = getBusinessObject(taskShape),
            eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY),
            listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY),
            listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY);

        selectListener(propertiesPanel._container);

        expect(bo.processRef.extensionElements.values.length).to.equal(1);

        var extensionElementsValues = bo.processRef.extensionElements.values;
        // execution listener 1
        expect(eventType.value).to.equal('start');
        expect(listenerType.value).to.equal('expression');
        expect(listenerValue.value).to.equal('userOne');
        expect(extensionElementsValues[0].get('event')).to.equal(eventType.value);
        expect(extensionElementsValues[0].get('expression')).to.equal(listenerValue.value);

      }));

  });


  describe('add', function() {

    it('should add the first execution listener to a collaboration process',
      inject(function(propertiesPanel, selection, elementRegistry) {

        var taskShape = elementRegistry.get('Participant_Two');
        selection.select(taskShape);

        var bo = getBusinessObject(taskShape),
            extensionElements = bo.processRef.extensionElements,

            executionListeners = getExecutionListener(extensionElements),
            addListenerButton = getAddButton(propertiesPanel._container);

        var eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY),
            listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY),
            listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY);

        // given
        expect(extensionElements).not.to.exist;
        expect(executionListeners).to.be.empty;

        // when
        TestHelper.triggerEvent(addListenerButton, 'click');

        // set listener value to have a successfully validation
        TestHelper.triggerValue(listenerValue, 'newExecutionListenerVal');

        // then
        // check html
        expect(eventType.value).to.equal('start');
        expect(listenerType.value).to.equal('class');
        expect(listenerValue.value).to.equal('newExecutionListenerVal');

        // check business object
        extensionElements = bo.processRef.extensionElements;
        executionListeners = getExecutionListener(extensionElements);
        expect(extensionElements.values.length).to.equal(1);
        expect(executionListeners.length).to.equal(1);
        expect(executionListeners[0].get('event')).to.equal(eventType.value);
        expect(executionListeners[0].get('class')).to.equal(listenerValue.value);

      }));


    it('should add a new execution listener to an existing extension elements',
      inject(function(propertiesPanel, selection, elementRegistry) {

        var taskShape = elementRegistry.get('Participant_One');
        selection.select(taskShape);

        var bo = getBusinessObject(taskShape),
            extensionElements = bo.processRef.extensionElements,

            executionListeners = getExecutionListener(extensionElements),
            addListenerButton = getAddButton(propertiesPanel._container);

        var eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY),
            listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY),
            listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY);

        // given
        expect(extensionElements.values.length).to.equal(1);
        expect(executionListeners.length).to.equal(1);

        // when
        TestHelper.triggerEvent(addListenerButton, 'click');

        // set listener value to have a successfully validation
        TestHelper.triggerValue(listenerValue, 'newExecutionListenerVal');

        // then
        // check html
        expect(eventType.value).to.equal('start');
        expect(listenerType.value).to.equal('class');
        expect(listenerValue.value).to.equal('newExecutionListenerVal');

        // check business object
        executionListeners = getExecutionListener(extensionElements);
        expect(extensionElements.values.length).to.equal(2);
        expect(executionListeners.length).to.equal(2);
        expect(executionListeners[1].get('event')).to.equal(eventType.value);
        expect(executionListeners[1].get('class')).to.equal(listenerValue.value);

      }));

  });


  describe('remove', function() {

    it('should remove an execution listener from extension elements',
      inject(function(propertiesPanel, selection, elementRegistry) {

        var taskShape = elementRegistry.get('Participant_One');
        selection.select(taskShape);

        var bo = getBusinessObject(taskShape),
            extensionElements = bo.processRef.extensionElements,

            executionListeners = getExecutionListener(extensionElements),
            removeListenerButton = getRemoveButton(propertiesPanel._container);

        var eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY),
            listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY),
            listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY),
            listeners = getSelect(propertiesPanel._container, 'selectedExtensionElement', 'executionListeners');

        // given
        expect(extensionElements.values).to.have.length(1);
        expect(executionListeners).to.have.length(1);
        expect(listeners.options).to.have.length(1);

        selectListener(propertiesPanel._container);

        // when
        // delete execution listener
        TestHelper.triggerEvent(removeListenerButton, 'click');

        // then
        // check html
        expect(listeners.options).to.have.length(0);
        expect(domClasses(eventType).has('bpp-hidden')).to.be.true;
        expect(domClasses(listenerType).has('bpp-hidden')).to.be.true;
        expect(domClasses(listenerValue.parentElement).has('bpp-hidden')).to.be.true;

        // check business object
        extensionElements = bo.processRef.extensionElements;
        executionListeners = getExecutionListener(extensionElements);
        expect(extensionElements).not.to.exist;
        expect(executionListeners).to.be.empty;

      }));

  });


  describe('visibility', function() {

    it('participant without processRef', inject(function(elementRegistry, selection, propertiesPanel) {

      // given
      var participant = elementRegistry.get('Participant_Three');
      selection.select(participant);

      var extensionTab = getListenersTab(propertiesPanel._container);

      expect(domClasses(extensionTab).has('bpp-hidden')).to.be.true;

    }));

  });


});
