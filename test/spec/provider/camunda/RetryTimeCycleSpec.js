'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
    domQuery = require('min-dom/lib/query'),
    coreModule = require('bpmn-js/lib/core'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    propertiesProviderModule = require('../../../../lib/provider/camunda'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var asyncCapableHelper = require('../../../../lib/helper/AsyncCapableHelper');
var extensionElementsHelper = require('../../../../lib/helper/ExtensionElementsHelper');

describe('retryTimeCycle', function() {

  var diagramXML = require('./RetryTimeCycle.bpmn');

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


  it('should fetch a retry time cycle for an element with timer def', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BoundaryEvent'),
        inputEl = 'div[data-entry=retryTimeCycle] input[name=cycle]';

    selection.select(shape);

    var bo = getBusinessObject(shape),
        inputValue = domQuery(inputEl, propertiesPanel._container).value;

    var retryTimer = bo.get('extensionElements').get('values')[1];

    expect(retryTimer.get('body')).to.equal(inputValue);
    expect(retryTimer.get('body')).to.equal('asd');
  }));


  it('should set a retry time cycle for an element with timer def', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask'),
        inputEl = 'div[data-entry=retryTimeCycle] input[name=cycle]';
    var bo = getBusinessObject(shape);

    selection.select(shape);

    var asyncField = domQuery('input[name=asyncBefore]', propertiesPanel._container),
        retryField = domQuery(inputEl, propertiesPanel._container);

    // given
    expect(asyncField.checked).to.be.false;
    expect(retryField.value).to.equal('');

    // when
    TestHelper.triggerEvent(asyncField, 'click');

    TestHelper.triggerValue(retryField, 'foo', 'change');

    var inputValue = domQuery(inputEl, propertiesPanel._container).value;
    var retryTimer = bo.get('extensionElements').get('values')[0];

    // then
    expect(retryTimer.get('body')).to.equal(inputValue);
    expect(retryTimer.get('body')).to.equal('foo');
  }));


  it('should remove a retry time cycle for an element with timer def', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BoundaryEvent'),
        inputEl = 'div[data-entry=retryTimeCycle] input[name=cycle]';

    selection.select(shape);

    var inputValue = domQuery(inputEl, propertiesPanel._container);
    var retryTimerArrayOld = getBusinessObject(shape).get('extensionElements').get('values').length;

    // given
    expect(inputValue.value).to.equal('asd');

    // when
    TestHelper.triggerValue(inputValue, '', 'change');

    var retryTimerArray = getBusinessObject(shape).get('extensionElements').get('values').length;

    // then
    expect(retryTimerArray).to.equal(1);
    expect(retryTimerArrayOld - 1).to.equal(retryTimerArray);
    expect(inputValue.value).to.equal('');
  }));

  describe('add retry time cycle', function() {

    var bo, input;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      var container = propertiesPanel._container;

      var shape = elementRegistry.get('WITH_LISTENER');
      selection.select(shape);

      bo = getBusinessObject(shape);

      input = domQuery('div[data-entry=retryTimeCycle] input[name=cycle]', container);

      // when
      TestHelper.triggerValue(input, 'foo', 'change');
    }));

    describe('retain existing extension elements', function() {

      it('should execute', function() {
        // then
        var timeCycles = extensionElementsHelper.getExtensionElements(bo, 'camunda:FailedJobRetryTimeCycle');
        expect(timeCycles).to.have.length(1);

        var listeners = extensionElementsHelper.getExtensionElements(bo, 'camunda:ExecutionListener');
        expect(listeners).to.have.length(1);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        var timeCycles = extensionElementsHelper.getExtensionElements(bo, 'camunda:FailedJobRetryTimeCycle');
        expect(timeCycles).not.to.ok;

        var listeners = extensionElementsHelper.getExtensionElements(bo, 'camunda:ExecutionListener');
        expect(listeners).to.have.length(1);
      }));


      it('should redo', inject(function(commandStack) {
        // when

        commandStack.undo();
        commandStack.redo();

        // then
        var timeCycles = extensionElementsHelper.getExtensionElements(bo, 'camunda:FailedJobRetryTimeCycle');
        expect(timeCycles).to.have.length(1);

        var listeners = extensionElementsHelper.getExtensionElements(bo, 'camunda:ExecutionListener');
        expect(listeners).to.have.length(1);
      }));

    });


    describe('on the business object', function() {

      it('should execute', function() {
        // then
        var cycle = asyncCapableHelper.getFailedJobRetryTimeCycle(bo);
        expect(cycle).to.be.ok;
        expect(cycle.body).to.equal('foo');
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        var cycle = asyncCapableHelper.getFailedJobRetryTimeCycle(bo);
        expect(cycle).not.to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when

        commandStack.undo();
        commandStack.redo();

        // then
        var cycle = asyncCapableHelper.getFailedJobRetryTimeCycle(bo);
        expect(cycle).to.be.ok;
        expect(cycle.body).to.equal('foo');
      }));

    });


    describe('in the DOM', function() {

      it('should execute', function() {
        // then
        expect(input.value).to.equal('foo');
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(input.value).to.equal('');
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(input.value).to.equal('foo');
      }));

    });

  });

  describe('change retry time cycle', function() {

    var bo, input;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      var container = propertiesPanel._container;

      var shape = elementRegistry.get('WITH_LISTENER_AND_CYCLE');
      selection.select(shape);

      bo = getBusinessObject(shape);

      input = domQuery('div[data-entry=retryTimeCycle] input[name=cycle]', container);

      // when
      TestHelper.triggerValue(input, 'bar', 'change');
    }));

    describe('retain existing extension elements', function() {

      it('should execute', function() {
        // then
        var timeCycles = extensionElementsHelper.getExtensionElements(bo, 'camunda:FailedJobRetryTimeCycle');
        expect(timeCycles).to.have.length(1);

        var listeners = extensionElementsHelper.getExtensionElements(bo, 'camunda:ExecutionListener');
        expect(listeners).to.have.length(1);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        var timeCycles = extensionElementsHelper.getExtensionElements(bo, 'camunda:FailedJobRetryTimeCycle');
        expect(timeCycles).to.have.length(1);

        var listeners = extensionElementsHelper.getExtensionElements(bo, 'camunda:ExecutionListener');
        expect(listeners).to.have.length(1);
      }));


      it('should redo', inject(function(commandStack) {
        // when

        commandStack.undo();
        commandStack.redo();

        // then
        var timeCycles = extensionElementsHelper.getExtensionElements(bo, 'camunda:FailedJobRetryTimeCycle');
        expect(timeCycles).to.have.length(1);

        var listeners = extensionElementsHelper.getExtensionElements(bo, 'camunda:ExecutionListener');
        expect(listeners).to.have.length(1);
      }));

    });


    describe('on the business object', function() {

      it('should execute', function() {
        // then
        var cycle = asyncCapableHelper.getFailedJobRetryTimeCycle(bo);
        expect(cycle).to.be.ok;
        expect(cycle.body).to.equal('bar');
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        var cycle = asyncCapableHelper.getFailedJobRetryTimeCycle(bo);
        expect(cycle).to.be.ok;
        expect(cycle.body).to.equal('foo');
      }));


      it('should redo', inject(function(commandStack) {
        // when

        commandStack.undo();
        commandStack.redo();

        // then
        var cycle = asyncCapableHelper.getFailedJobRetryTimeCycle(bo);
        expect(cycle).to.be.ok;
        expect(cycle.body).to.equal('bar');
      }));

    });


    describe('in the DOM', function() {

      it('should execute', function() {
        // then
        expect(input.value).to.equal('bar');
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(input.value).to.equal('foo');
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(input.value).to.equal('bar');
      }));

    });

  });


  describe('remove retry time cycle', function() {

    var bo, input;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      var container = propertiesPanel._container;

      var shape = elementRegistry.get('WITH_LISTENER_AND_CYCLE');
      selection.select(shape);

      bo = getBusinessObject(shape);

      input = domQuery('div[data-entry=retryTimeCycle] input[name=cycle]', container);

      // when
      TestHelper.triggerValue(input, '', 'change');
    }));

    describe('retain existing extension elements', function() {

      it('should execute', function() {
        // then
        var timeCycles = extensionElementsHelper.getExtensionElements(bo, 'camunda:FailedJobRetryTimeCycle');
        expect(timeCycles).not.to.ok;

        var listeners = extensionElementsHelper.getExtensionElements(bo, 'camunda:ExecutionListener');
        expect(listeners).to.have.length(1);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        var timeCycles = extensionElementsHelper.getExtensionElements(bo, 'camunda:FailedJobRetryTimeCycle');
        expect(timeCycles).to.have.length(1);

        var listeners = extensionElementsHelper.getExtensionElements(bo, 'camunda:ExecutionListener');
        expect(listeners).to.have.length(1);
      }));


      it('should redo', inject(function(commandStack) {
        // when

        commandStack.undo();
        commandStack.redo();

        // then
        var timeCycles = extensionElementsHelper.getExtensionElements(bo, 'camunda:FailedJobRetryTimeCycle');
        expect(timeCycles).not.to.ok;

        var listeners = extensionElementsHelper.getExtensionElements(bo, 'camunda:ExecutionListener');
        expect(listeners).to.have.length(1);
      }));

    });


    describe('on the business object', function() {

      it('should execute', function() {
        // then
        var cycle = asyncCapableHelper.getFailedJobRetryTimeCycle(bo);
        expect(cycle).not.to.be.ok;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        var cycle = asyncCapableHelper.getFailedJobRetryTimeCycle(bo);
        expect(cycle).to.be.ok;
        expect(cycle.body).to.equal('foo');
      }));


      it('should redo', inject(function(commandStack) {
        // when

        commandStack.undo();
        commandStack.redo();

        // then
        var cycle = asyncCapableHelper.getFailedJobRetryTimeCycle(bo);
        expect(cycle).not.to.be.ok;
      }));

    });


    describe('in the DOM', function() {

      it('should execute', function() {
        // then
        expect(input.value).to.equal('');
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(input.value).to.equal('foo');
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(input.value).to.equal('');
      }));

    });

  });

});
