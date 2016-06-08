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

function getAsyncBefore(container) {
  return domQuery('div[data-entry=asyncBefore] input[name=asyncBefore]', container);
}

function getAsyncAfter(container) {
  return domQuery('div[data-entry=asyncAfter] input[name=asyncAfter]', container);
}

function getExclusive(container) {
  return domQuery('div[data-entry=exclusive] input[name=exclusive]', container);
}

describe('flow-node-properties', function() {

  var diagramXML = require('./AsynchronousContinuations.bpmn');

  var testModules = [ coreModule, selectionModule, modelingModule, propertiesPanelModule, propertiesProviderModule ];

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


  it('should set the asyncBefore property of a gateway flow node', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('InclusiveGateway_1');

    selection.select(shape);

    var asyncBefore = getAsyncBefore(propertiesPanel._container),
        taskBo      = getBusinessObject(shape);

    // assume
    // that the asyncBefore is false
    expect(taskBo.get('asyncBefore')).to.not.be.ok;

    // when
    // I click on the checkbox
    TestHelper.triggerEvent(asyncBefore, 'click');

    // then
    // the value is true in the model
    expect(taskBo.get('asyncBefore')).to.be.ok;
  }));


  it('should set the asyncBefore property of a event flow node', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('IntermediateThrowEvent_1');

    selection.select(shape);

    var asyncBefore = getAsyncBefore(propertiesPanel._container),
        taskBo      = getBusinessObject(shape);

    // assume
    // that the asyncBefore is false
    expect(taskBo.get('asyncBefore')).to.not.be.ok;

    // when
    // I click on the checkbox
    TestHelper.triggerEvent(asyncBefore, 'click');

    // then
    // the value is true in the model
    expect(taskBo.get('asyncBefore')).to.be.ok;
  }));


  it('should set the asyncBefore property of a activity flow node', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('CallActivity_2');

    selection.select(shape);

    var asyncBefore = getAsyncBefore(propertiesPanel._container),
        taskBo      = getBusinessObject(shape);

    // assume
    // that the asyncBefore is false
    expect(taskBo.get('asyncBefore')).to.not.be.ok;

    // when
    // I click on the checkbox
    TestHelper.triggerEvent(asyncBefore, 'click');

    // then
    // the value is true in the model
    expect(taskBo.get('asyncBefore')).to.be.ok;
  }));


  it('should set the asyncAfter property of a gateway flow node', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('InclusiveGateway_1');

    selection.select(shape);

    var asyncAfter = getAsyncAfter(propertiesPanel._container),
        taskBo      = getBusinessObject(shape);

    // assume
    // that the asyncAfter is false
    expect(taskBo.get('asyncAfter')).to.not.be.ok;

    // when
    // I click on the checkbox
    TestHelper.triggerEvent(asyncAfter, 'click');

    // then
    // the value is true in the model
    expect(taskBo.get('asyncAfter')).to.be.ok;
  }));


  it('should set the asyncAfter property of a event flow node', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('IntermediateThrowEvent_1');

    selection.select(shape);

    var checkbox = getAsyncAfter(propertiesPanel._container),
        taskBo   = getBusinessObject(shape);

    // assume
    // that the asyncAfter property is false (unset)
    expect(taskBo.get('asyncAfter')).to.not.be.ok;
    expect(checkbox.selected).to.not.be.true;

    // when
    // I click on the checkbox
    TestHelper.triggerEvent(checkbox, 'click');

    // then
    // the value is true in the model
    expect(taskBo.get('asyncAfter')).to.be.ok;

  }));


  it('should set the asyncAfter property of a activity flow node', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('CallActivity_2');

    selection.select(shape);

    var asyncAfter = getAsyncAfter(propertiesPanel._container),
        taskBo      = getBusinessObject(shape);

    // assume
    // that the asyncAfter is false (unset)
    expect(taskBo.get('asyncAfter')).to.not.be.ok;

    // when
    // I click on the checkbox
    TestHelper.triggerEvent(asyncAfter, 'click');

    // then
    // the value is true in the model
    expect(taskBo.get('asyncAfter')).to.be.ok;
  }));


  it('should fetch the exclusive property for a flow node', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('CallActivity_2');

    // when
    selection.select(shape);

    // then
    var input = getExclusive(propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(input.checked).to.be.true;
    expect(input.checked).to.equal(businessObject.get('exclusive'));
  }));


  it('should set the exclusive property for a flow node', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('CallActivity_2');

    selection.select(shape);

    var asyncBeforeCheckbox = getAsyncBefore(propertiesPanel._container),
        exclusiveCheckbox = domQuery('div[data-entry=exclusive] input[name=exclusive]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    TestHelper.triggerEvent(asyncBeforeCheckbox, 'click');

    // assume
    expect(businessObject.get('exclusive')).to.be.true;
    expect(exclusiveCheckbox.checked).to.be.true;

    // when
    // I click the checkbox
    TestHelper.triggerEvent(exclusiveCheckbox, 'click');

    // then
    expect(businessObject.get('exclusive')).to.be.false;
    expect(exclusiveCheckbox.checked).to.be.false;

  }));


  it('should reset the exclusive property for a flow node', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('CallActivity_2');

    selection.select(shape);

    var exclusiveInput = getExclusive(propertiesPanel._container),
        asyncBeforeInput = getAsyncBefore(propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // assume
    expect(businessObject.get('exclusive')).to.be.ok;
    expect(exclusiveInput.selected).to.not.be.true;
    expect(asyncBeforeInput.selected).to.not.be.true;
    expect(businessObject.get('asyncBefore')).to.not.be.ok;

    // when
    // I click on the checkbox
    TestHelper.triggerEvent(asyncBeforeInput, 'click'); // make the exclusive field visible

    TestHelper.triggerEvent(exclusiveInput, 'click'); // change value of the exclusive field

    TestHelper.triggerEvent(asyncBeforeInput, 'click'); // reset the exclusive field

    // then
    expect(exclusiveInput.checked).to.equal(businessObject.get('exclusive'));
    expect(businessObject.get('exclusive')).to.be.ok;
  }));


  it('should remove the retryTimeCycle when the element is not async', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
    var shape = elementRegistry.get('ServiceTask'),
        bo = getBusinessObject(shape),
        extensionElementsCount = bo.get('extensionElements').get('values').length;

    selection.select(shape);

    var domElement = getAsyncBefore(propertiesPanel._container);

      // when
    TestHelper.triggerEvent(domElement, 'click');

      // then
    var newCount = bo.get('extensionElements').get('values').length;

    expect(newCount + 1).to.equal(extensionElementsCount);
  }));


  it('should remove the retryTimeCycle and extensionElements list when the element is not async', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
    var shape = elementRegistry.get('ServiceTask2'),
        bo = getBusinessObject(shape);

    selection.select(shape);

    var domElement = getAsyncBefore(propertiesPanel._container);

      // when
    TestHelper.triggerEvent(domElement, 'click');

      // then
    expect(bo.get('extensionElements')).to.be.undefined;
  }));


  it('should show camunda:async as asyncBefore in the ui', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
    var shape = elementRegistry.get('ServiceTask');

      // when
    selection.select(shape);

      // then
    var asyncBeforeField = getAsyncBefore(propertiesPanel._container);

    expect(!!asyncBeforeField.checked).to.be.ok;

  }));


  it('should migrate camunda:async to asyncBefore when asyncBefore is toggled', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
    var shape = elementRegistry.get('ServiceTask');

    selection.select(shape);

    var asyncBeforeField = getAsyncBefore(propertiesPanel._container);

      // when
    TestHelper.triggerEvent(asyncBeforeField, 'click');

      // then
    var bo = getBusinessObject(shape);

    expect(bo.get('camunda:async')).to.be.not.ok;
  }));


  it('should not remove the retryTimeCycle when the element is a timer event and is not async', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
    var shape = elementRegistry.get('StartEvent_Timer'),
        bo = getBusinessObject(shape),
        extensionElements = bo.get('extensionElements').get('values'),
        extensionElementsCount = extensionElements.length;

    selection.select(shape);

    var domElement = getAsyncBefore(propertiesPanel._container);

    expect(domElement.checked).to.be.true;
    expect(extensionElements[0].$type).to.equal('camunda:FailedJobRetryTimeCycle');

      // when
    TestHelper.triggerEvent(domElement, 'click');

      // then
    expect(domElement.checked).to.be.false;

    var newExtensionElements = bo.get('extensionElements').get('values');
    var newCount = newExtensionElements.length;

    expect(newCount).to.equal(extensionElementsCount);
    expect(extensionElements[0].$type).to.equal(newExtensionElements[0].$type);
  }));
});
