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

  function getListenerTab(container) {
    return domQuery('a[data-tab-target=listeners]' , container);
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

  function getAddButton(container) {
    return domQuery('div[data-entry=executionListeners] button[data-action=createElement]', container);
  }

  function getRemoveButton(container) {
    return domQuery('div[data-entry=executionListeners] button[data-action=removeElement]', container);
  }

  function selectListener(container, idx) {
    var listeners = getSelect(container, 'selectedExtensionElement', 'executionListeners');

    listeners.options[idx].selected = 'selected';
    TestHelper.triggerEvent(listeners, 'change');
  }

  var LISTENER_EVENT_TYPE_ENTRY = 'listener-event-type',
      LISTENER_TYPE_ENTRY       = 'listener-type',
      LISTENER_VALUE_ENTRY      = 'listener-value';


  describe('get', function() {

    it('should fetch execution listener properties for a flow element',
      inject(function(propertiesPanel, selection, elementRegistry) {

        var taskShape = elementRegistry.get('ServiceTask_Execution');
        selection.select(taskShape);

        var bo = getBusinessObject(taskShape),
            eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY),
            listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY),
            listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY);

        // 2 execution listener in the extension elements
        expect(bo.extensionElements.values.length).to.equal(3);

        var extensionElementsValues = bo.extensionElements.values;

        // execution listener 1
        selectListener(propertiesPanel._container, 0);

        expect(eventType.value).to.equal('end');
        expect(listenerType.value).to.equal('expression');
        expect(listenerValue.value).to.equal('executionListenerExpr');
        expect(extensionElementsValues[0].get('event')).to.equal(eventType.value);
        expect(extensionElementsValues[0].get('expression')).to.equal(listenerValue.value);

        // execution listener 2
        selectListener(propertiesPanel._container, 1);

        expect(eventType.value).to.equal('start');
        expect(listenerType.value).to.equal('expression');
        expect(listenerValue.value).to.equal('abc');
        expect(extensionElementsValues[1].get('event')).to.equal(eventType.value);
        expect(extensionElementsValues[1].get('expression')).to.equal(listenerValue.value);

      }));


    it('should fetch execution listener properties for a sequence flow',
      inject(function(propertiesPanel, selection, elementRegistry) {

        var taskShape = elementRegistry.get('SequenceFlow_1');
        selection.select(taskShape);

        var bo = getBusinessObject(taskShape),
            eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY),
            listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY),
            listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY);

        expect(bo.extensionElements.values.length).to.equal(1);

        selectListener(propertiesPanel._container, 0);

        var extensionElementsValues = bo.extensionElements.values;

        expect(eventType.value).to.equal('take');
        expect(listenerType.value).to.equal('delegateExpression');
        expect(listenerValue.value).to.equal('foo');
        expect(extensionElementsValues[0].get('event')).to.equal(eventType.textContent);
        expect(extensionElementsValues[0].get('delegateExpression')).to.equal(listenerValue.value);

      }));


    it('should not fetch execution listener properties for a text annotation',
      inject(function(propertiesPanel, selection, elementRegistry) {

        var taskShape = elementRegistry.get('TextAnnotation_1');
        selection.select(taskShape);

        var bo = getBusinessObject(taskShape),
            listenerTab = getListenerTab(propertiesPanel._container);

        expect(is(bo, 'bpmn:FlowElement')).to.be.false;

        expect(domClasses(listenerTab.parentElement).has('bpp-hidden')).to.be.true;

      }));


    it('should not fetch execution listener properties for a link intermediate throw event',
      inject(function(propertiesPanel, selection, elementRegistry) {

        var linkEventShape = elementRegistry.get('LinkThrowEvent_1');
        selection.select(linkEventShape);

        var listenerTab = getListenerTab(propertiesPanel._container);

        expect(domClasses(listenerTab.parentElement).has('bpp-hidden')).to.be.true;

      }));


    it('should fetch execution listener properties for a link intermediate catch vent',
      inject(function(propertiesPanel, selection, elementRegistry) {

        var linkEventShape = elementRegistry.get('LinkCatchEvent_1');
        selection.select(linkEventShape);

        var listenerTab = getListenerTab(propertiesPanel._container);

        expect(domClasses(listenerTab.parentElement).has('bpp-hidden')).to.be.false;

      }));


    it('should fetch execution listener properties for a process element',
      inject(function(propertiesPanel, selection, elementRegistry) {

        var taskShape = elementRegistry.get('Process_1');
        selection.select(taskShape);

        var bo = getBusinessObject(taskShape),
            eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY),
            listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY),
            listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY);

        expect(bo.extensionElements.values.length).to.equal(1);

        selectListener(propertiesPanel._container, 0);

        var extensionElementsValues = bo.extensionElements.values;

        expect(eventType.value).to.equal('start');
        expect(listenerType.value).to.equal('expression');
        expect(listenerValue.value).to.equal('abc');
        expect(extensionElementsValues[0].get('event')).to.equal(eventType.value);
        expect(extensionElementsValues[0].get('expression')).to.equal(listenerValue.value);

      }));


    it('should fetch two invalid property fields when adding two execution listeners at once',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

        // given
        var taskShape = elementRegistry.get('ServiceTask_2'),
            bo = getBusinessObject(taskShape);

        selection.select(taskShape);

        var addListenerButton = getAddButton(propertiesPanel._container);

        // given
        var executionListeners = getExecutionListener(bo.extensionElements);
        expect(executionListeners).to.have.length(0);

        // when
        TestHelper.triggerEvent(addListenerButton, 'click');
        TestHelper.triggerEvent(addListenerButton, 'click');

        var listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY);

        // then
        // select first listener
        selectListener(propertiesPanel._container, 0);
        expect(domClasses(listenerValue).has('invalid')).to.be.true;

        // select second listener
        selectListener(propertiesPanel._container, 1);
        expect(domClasses(listenerValue).has('invalid')).to.be.true;

      }));

  });


  describe('set', function() {

    it('should clear execution listener value of the first execution listener',
      inject(function(propertiesPanel, selection, elementRegistry) {

        var taskShape = elementRegistry.get('ServiceTask_Execution');
        selection.select(taskShape);

        var bo = getBusinessObject(taskShape),
            executionListeners = getExecutionListener(bo.extensionElements),

            eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY),
            listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY),
            listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY),

            clearButton = getClearValueButton(propertiesPanel._container, LISTENER_VALUE_ENTRY);

        selectListener(propertiesPanel._container, 0);

        // given
        expect(eventType.value).to.equal('end');
        expect(listenerType.value).to.equal('expression');
        expect(listenerValue.value).to.equal('executionListenerExpr');

        expect(executionListeners.length).to.equal(2);
        expect(executionListeners[0].get('event')).to.equal(eventType.value);
        expect(executionListeners[0].get('expression')).to.equal(listenerValue.value);

        // when
        // clear listener value input of first execution listener
        TestHelper.triggerEvent(clearButton, 'click');

        // then
        // check html
        expect(eventType.value).to.equal('end');
        expect(listenerType.value).to.equal('expression');
        expect(listenerValue.className).to.equal('invalid');

        // check business object
        executionListeners = getExecutionListener(bo.extensionElements);
        expect(executionListeners.length).to.equal(2);

        expect(executionListeners[0].get('event')).to.equal(eventType.value);
        expect(executionListeners[0].get('expression')).to.equal('');

      }));


    describe('should change properties of the first execution listener', function() {

      var executionListeners, eventType, listenerType, listenerValue;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

        var taskShape = elementRegistry.get('ServiceTask_Execution');
        selection.select(taskShape);

        var bo = getBusinessObject(taskShape);
        executionListeners = getExecutionListener(bo.extensionElements);

        eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY),
        listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY),
        listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY);

        expect(bo.extensionElements.values.length).to.equal(3);
        expect(executionListeners.length).to.equal(2);

        // select first execution listener
        selectListener(propertiesPanel._container, 0);

        // select 'start'
        eventType.options[0].selected = 'selected';
        TestHelper.triggerEvent(eventType, 'change');

        // select 'java class'
        listenerType.options[0].selected = 'selected';
        TestHelper.triggerEvent(listenerType, 'change');

        // change value
        TestHelper.triggerValue(listenerValue, 'newValue');
      }));


      describe('in the DOM', function() {

        it('should execute', function() {

          expect(eventType.value).to.equal('start');
          expect(listenerType.value).to.equal('class');
          expect(listenerValue.value).to.equal('newValue');

        });

        it('should undo', inject(function(commandStack) {

          // undo for every field change
          commandStack.undo();
          commandStack.undo();
          commandStack.undo();

          expect(eventType.value).to.equal('end');
          expect(listenerType.value).to.equal('expression');
          expect(listenerValue.value).to.equal('executionListenerExpr');

        }));

        it('should redo', inject(function(commandStack) {

          // undo/redo for every field change
          commandStack.undo();
          commandStack.undo();
          commandStack.undo();
          commandStack.redo();
          commandStack.redo();
          commandStack.redo();

          expect(eventType.value).to.equal('start');
          expect(listenerType.value).to.equal('class');
          expect(listenerValue.value).to.equal('newValue');

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {

          expect(executionListeners[0].get('event')).to.equal('start');
          expect(executionListeners[0].get('class')).to.exist;
          expect(executionListeners[0].get('expression')).to.be.undefined;
          expect(executionListeners[0].get('class')).to.equal('newValue');

        });

        it('should undo', inject(function(commandStack) {

          // undo for every field change
          commandStack.undo();
          commandStack.undo();
          commandStack.undo();

          expect(executionListeners[0].get('event')).to.equal('end');
          expect(executionListeners[0].get('class')).to.be.undefined;
          expect(executionListeners[0].get('expression')).to.exist;
          expect(executionListeners[0].get('expression')).to.equal('executionListenerExpr');

        }));

        it('should redo', inject(function(commandStack) {

          // undo/redo for every field change
          commandStack.undo();
          commandStack.undo();
          commandStack.undo();
          commandStack.redo();
          commandStack.redo();
          commandStack.redo();

          expect(executionListeners[0].get('event')).to.equal('start');
          expect(executionListeners[0].get('class')).to.exist;
          expect(executionListeners[0].get('expression')).to.be.undefined;
          expect(executionListeners[0].get('class')).to.equal('newValue');

        }));

      });

    });

  });


  describe('add', function() {

    it('should add a new execution listener to an existing extension elements',
      inject(function(propertiesPanel, selection, elementRegistry) {

        var taskShape = elementRegistry.get('ServiceTask_Execution');
        selection.select(taskShape);

        var bo = getBusinessObject(taskShape),
            executionListeners = getExecutionListener(bo.extensionElements),
            addListenerButton = getAddButton(propertiesPanel._container);

        var eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY),
            listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY),
            listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY);

        // given
        expect(bo.extensionElements.values.length).to.equal(3);
        expect(executionListeners.length).to.equal(2);

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
        executionListeners = getExecutionListener(bo.extensionElements);
        expect(bo.extensionElements.values.length).to.equal(4);
        expect(executionListeners.length).to.equal(3);
        expect(executionListeners[2].get('event')).to.equal(eventType.value);
        expect(executionListeners[2].get('class')).to.equal(listenerValue.value);

      }));


    it('should add a new execution listener for a sequence flow to an existing extension elements',
      inject(function(propertiesPanel, selection, elementRegistry) {

        var taskShape = elementRegistry.get('SequenceFlow_1');
        selection.select(taskShape);

        var bo = getBusinessObject(taskShape),
            executionListeners = getExecutionListener(bo.extensionElements),
            addListenerButton = getAddButton(propertiesPanel._container);

        var eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY),
            listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY),
            listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY);

        // given
        expect(bo.extensionElements.values.length).to.equal(1);
        expect(executionListeners.length).to.equal(1);

        // when
        TestHelper.triggerEvent(addListenerButton, 'click');

        // set listener value to have a successfully validation
        TestHelper.triggerValue(listenerValue, 'newSequenceFlowListener');

        // then
        // check html
        expect(eventType.value).to.equal('take');
        expect(listenerType.value).to.equal('class');
        expect(listenerValue.value).to.equal('newSequenceFlowListener');

        // check business object
        executionListeners = getExecutionListener(bo.extensionElements);

        expect(bo.extensionElements.values.length).to.equal(2);
        expect(executionListeners.length).to.equal(2);
        expect(executionListeners[1].get('event')).to.equal(eventType.value);
        expect(executionListeners[1].get('class')).to.equal(listenerValue.value);

      }));


    describe('should add the first execution listener to an element', function() {

      var bo, eventType, listenerType, listenerValue;

      beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {

        var taskShape = elementRegistry.get('ServiceTask_2');
        selection.select(taskShape);

        bo = getBusinessObject(taskShape);

        var executionListeners = getExecutionListener(bo.extensionElements);
        var addListenerButton = getAddButton(propertiesPanel._container);

        eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY),
        listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY),
        listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY);

        // given
        expect(bo.extensionElements).not.to.exist;
        expect(executionListeners).to.be.empty;

        // when
        TestHelper.triggerEvent(addListenerButton, 'click');

        // set listener value to have a successfully validation
        TestHelper.triggerValue(listenerValue, 'newExecutionListenerVal');

      }));


      describe('in the DOM', function() {

        it('should execute', function() {

          expect(eventType.value).to.equal('start');
          expect(listenerType.value).to.equal('class');
          expect(listenerValue.value).to.equal('newExecutionListenerVal');

        });

        it('should undo', inject(function(commandStack) {

          // undo/redo for every field change
          commandStack.undo();
          commandStack.undo();

          expect(domClasses(eventType).has('bpp-hidden')).to.be.true;
          expect(domClasses(listenerType).has('bpp-hidden')).to.be.true;
          expect(domClasses(listenerValue.parentElement).has('bpp-hidden')).to.be.true;

        }));

        it('should redo', inject(function(commandStack, propertiesPanel) {

          // undo/redo for every field change
          commandStack.undo();
          commandStack.undo();
          commandStack.redo();
          commandStack.redo();

          selectListener(propertiesPanel._container, 0);

          expect(eventType.value).to.equal('start');
          expect(listenerType.value).to.equal('class');
          expect(listenerValue.value).to.equal('newExecutionListenerVal');

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {

          var executionListeners = getExecutionListener(bo.extensionElements);

          expect(bo.extensionElements.values).to.have.length(1);
          expect(executionListeners).to.have.length(1);

          expect(executionListeners[0].get('event')).to.equal('start');
          expect(executionListeners[0].get('class')).to.equal('newExecutionListenerVal');

        });

        it('should undo', inject(function(commandStack) {

          // undo/redo for every field change
          commandStack.undo();
          commandStack.undo();

          var executionListeners = getExecutionListener(bo.extensionElements);

          expect(bo.extensionElements).not.to.exist;
          expect(executionListeners).to.be.empty;

        }));

        it('should redo', inject(function(commandStack) {

          // undo/redo for every field change
          commandStack.undo();
          commandStack.undo();
          commandStack.redo();
          commandStack.redo();

          var executionListeners = getExecutionListener(bo.extensionElements);

          expect(bo.extensionElements.values).to.have.length(1);
          expect(executionListeners).to.have.length(1);

          expect(executionListeners[0].get('event')).to.equal('start');
          expect(executionListeners[0].get('class')).to.equal('newExecutionListenerVal');

        }));

      });


    });


    describe('should add two execution listener to an element at the same time', function() {

      var bo, eventType, listenerType, listenerValue, listeners;

      beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {

        var taskShape = elementRegistry.get('ServiceTask_2');
        selection.select(taskShape);

        bo = getBusinessObject(taskShape);

        var executionListeners = getExecutionListener(bo.extensionElements);
        var addListenerButton = getAddButton(propertiesPanel._container);

        eventType = getSelect(propertiesPanel._container, 'eventType', LISTENER_EVENT_TYPE_ENTRY);
        listenerType = getSelect(propertiesPanel._container, 'listenerType', LISTENER_TYPE_ENTRY);
        listenerValue = getInput(propertiesPanel._container, 'listenerValue', LISTENER_VALUE_ENTRY);
        listeners = getSelect(propertiesPanel._container, 'selectedExtensionElement', 'executionListeners');

        // given
        expect(bo.extensionElements).not.to.exist;
        expect(executionListeners).to.be.empty;

        // when
        TestHelper.triggerEvent(addListenerButton, 'click');
        TestHelper.triggerEvent(addListenerButton, 'click');

      }));


      describe('in the DOM', function() {

        it('should execute', function() {

          expect(listeners.options).to.have.length(2);

          expect(eventType.value).to.equal('start');
          expect(listenerType.value).to.equal('class');
          expect(listenerValue.value).to.equal('');
          expect(domClasses(listenerValue).has('invalid')).to.be.true;

        });

        it('should undo', inject(function(commandStack) {

          // undo/redo for every field change
          commandStack.undo();
          commandStack.undo();

          expect(listeners.options).to.have.length(0);

          expect(domClasses(eventType).has('bpp-hidden')).to.be.true;
          expect(domClasses(listenerType).has('bpp-hidden')).to.be.true;
          expect(domClasses(listenerValue.parentElement).has('bpp-hidden')).to.be.true;

        }));

        it('should redo', inject(function(commandStack, propertiesPanel) {

          // undo/redo for every field change
          commandStack.undo();
          commandStack.undo();
          commandStack.redo();
          commandStack.redo();

          expect(listeners.options).to.have.length(2);

          expect(eventType.value).to.equal('start');
          expect(listenerType.value).to.equal('class');
          expect(listenerValue.value).to.equal('');
          expect(domClasses(listenerValue).has('invalid')).to.be.true;

        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {

          var executionListeners = getExecutionListener(bo.extensionElements);

          expect(bo.extensionElements.values).to.have.length(2);
          expect(executionListeners).to.have.length(2);

          expect(executionListeners[0].get('event')).to.equal('start');
          expect(executionListeners[0].get('class')).to.equal('');
          expect(executionListeners[1].get('event')).to.equal('start');
          expect(executionListeners[1].get('class')).to.equal('');

        });

        it('should undo', inject(function(commandStack) {

          // undo/redo for every field change
          commandStack.undo();
          commandStack.undo();

          var executionListeners = getExecutionListener(bo.extensionElements);

          expect(bo.extensionElements).not.to.exist;
          expect(executionListeners).to.be.empty;

        }));

        it('should redo', inject(function(commandStack) {

          // undo/redo for every field change
          commandStack.undo();
          commandStack.undo();
          commandStack.redo();
          commandStack.redo();

          var executionListeners = getExecutionListener(bo.extensionElements);

          expect(bo.extensionElements.values).to.have.length(2);
          expect(executionListeners).to.have.length(2);

          expect(executionListeners[0].get('event')).to.equal('start');
          expect(executionListeners[0].get('class')).to.equal('');
          expect(executionListeners[1].get('event')).to.equal('start');
          expect(executionListeners[1].get('class')).to.equal('');

        }));

      });

    });

  });


  describe('remove', function() {

    it('should remove an execution listener from extension elements',
      inject(function(propertiesPanel, selection, elementRegistry) {

        var taskShape = elementRegistry.get('ServiceTask_Execution');
        selection.select(taskShape);

        var bo = getBusinessObject(taskShape),
            executionListeners = getExecutionListener(bo.extensionElements),
            removeListenerButton = getRemoveButton(propertiesPanel._container);

        var listeners = getSelect(propertiesPanel._container, 'selectedExtensionElement', 'executionListeners');

        // given
        expect(bo.extensionElements.values).to.have.length(3);
        expect(executionListeners).to.have.length(2);
        expect(listeners.options).to.have.length(2);

        selectListener(propertiesPanel._container, 0);

        // when
        // delete first execution listener
        TestHelper.triggerEvent(removeListenerButton, 'click');

        // then
        // check business object
        executionListeners = getExecutionListener(bo.extensionElements);

        expect(bo.extensionElements.values).to.have.length(2);
        expect(executionListeners).to.have.length(1);

        // check html
        expect(listeners.options).to.have.length(1);
      }));

  });


});
