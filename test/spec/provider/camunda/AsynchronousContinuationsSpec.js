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

describe('flow-node-properties', function() {

  var diagramXML = require('./AsynchronousContinuations.bpmn');

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


  it('should set the asyncBefore property of a gateway flow node',
    inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('InclusiveGateway_1');
    selection.select(shape);
    var asyncBefore = domQuery('input[name=asyncBefore]', propertiesPanel._container),
        taskBo      = getBusinessObject(shape);

    // given
    // that the asyncBefore is false
    expect(taskBo.get("asyncBefore")).to.not.be.ok;

    // when
    // I click on the checkbox
    TestHelper.triggerEvent(asyncBefore, 'click');

    // then
    // the value is true in the model
    expect(taskBo.get("asyncBefore")).to.be.ok;
  }));


  it('should set the asyncBefore property of a event flow node',
    inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('IntermediateThrowEvent_1');
    selection.select(shape);
    var asyncBefore = domQuery('input[name=asyncBefore]', propertiesPanel._container),
        taskBo      = getBusinessObject(shape);

    // given
    // that the asyncBefore is false
    expect(taskBo.get("asyncBefore")).to.not.be.ok;

    // when
    // I click on the checkbox
    TestHelper.triggerEvent(asyncBefore, 'click');

    // then
    // the value is true in the model
    expect(taskBo.get("asyncBefore")).to.be.ok;
  }));


  it('should set the asyncBefore property of a activity flow node',
    inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_2');
    selection.select(shape);
    var asyncBefore = domQuery('input[name=asyncBefore]', propertiesPanel._container),
        taskBo      = getBusinessObject(shape);

    // given
    // that the asyncBefore is false
    expect(taskBo.get("asyncBefore")).to.not.be.ok;

    // when
    // I click on the checkbox
    TestHelper.triggerEvent(asyncBefore, 'click');

    // then
    // the value is true in the model
    expect(taskBo.get("asyncBefore")).to.be.ok;
  }));


  it('should set the asyncAfter property of a gateway flow node',
    inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('InclusiveGateway_1');
    selection.select(shape);
    var asyncAfter = domQuery('input[name=asyncAfter]', propertiesPanel._container),
        taskBo      = getBusinessObject(shape);

    // given
    // that the asyncAfter is false
    expect(taskBo.get("asyncAfter")).to.not.be.ok;

    // when
    // I click on the checkbox
    TestHelper.triggerEvent(asyncAfter, 'click');

    // then
    // the value is true in the model
    expect(taskBo.get("asyncAfter")).to.be.ok;
  }));


  it('should set the asyncAfter property of a event flow node',
    inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('IntermediateThrowEvent_1');
    selection.select(shape);
    var checkbox = domQuery('input[name=asyncAfter]', propertiesPanel._container),
        taskBo   = getBusinessObject(shape);

    // given
    // that the asyncAfter property is false (unset)
    expect(taskBo.get("asyncAfter")).to.not.be.ok;
    expect(checkbox.selected).to.not.be.true;

    // when
    // I click on the checkbox
    TestHelper.triggerEvent(checkbox, 'click');

    // then
    // the value is true in the model
    expect(taskBo.get("asyncAfter")).to.be.ok;

  }));


  it('should set the asyncAfter property of a activity flow node',
    inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_2');
    selection.select(shape);
    var asyncAfter = domQuery('input[name=asyncAfter]', propertiesPanel._container),
        taskBo      = getBusinessObject(shape);

    // given
    // that the asyncAfter is false (unset)
    expect(taskBo.get("asyncAfter")).to.not.be.ok;

    // when
    // I click on the checkbox
    TestHelper.triggerEvent(asyncAfter, 'click');

    // then
    // the value is true in the model
    expect(taskBo.get("asyncAfter")).to.be.ok;
  }));


  it('should fetch the exclusive property for a flow node',
    inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_2');
    selection.select(shape);
    var input = domQuery('input[name=exclusive]', propertiesPanel._container),
        asyncBeforeInput = domQuery('input[name=asyncBefore]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(input.checked).to.be.true;
    expect(input.checked).to.equal(businessObject.get('exclusive'));
  }));


  it('should set the exclusive property for a flow node',
    inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_2');
    selection.select(shape);
    var asyncBeforeCheckbox = domQuery('input[name=asyncBefore]', propertiesPanel._container);
    var exclusiveCheckbox = domQuery('input[name=exclusive]', propertiesPanel._container);
    var businessObject = getBusinessObject(shape)

    // given
    TestHelper.triggerEvent(asyncBeforeCheckbox, 'click');
    expect(businessObject.get('exclusive')).to.be.true;
    expect(exclusiveCheckbox.checked).to.be.true;

    // when
    // I click the checkbox
    TestHelper.triggerEvent(exclusiveCheckbox, 'click');

    // then
    expect(businessObject.get('exclusive')).to.be.false;
    expect(exclusiveCheckbox.checked).to.be.false;

  }));


  it('should reset the exclusive property for a flow node',
    inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_2');
    selection.select(shape);
    var exclusiveInput = domQuery('input[name=exclusive]', propertiesPanel._container),
        asyncBeforeInput = domQuery('input[name=asyncBefore]', propertiesPanel._container);
    var  businessObject = getBusinessObject(shape);

    // given
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


  it('should remove the retryTimeCycle when the element is not async',
    inject(function(propertiesPanel, selection, elementRegistry) {

      propertiesPanel.attachTo(container);

      var shape = elementRegistry.get('ServiceTask'),
          bo = getBusinessObject(shape),
          extensionElementsCount = bo.get('extensionElements')
            .get('values')
            .length;
      // given
      selection.select(shape);
      var domElement = domQuery('input[name=asyncBefore]', propertiesPanel._container);

      // when
      TestHelper.triggerEvent(domElement, 'click');
      var newCount = bo.get('extensionElements')
        .get('values')
        .length;

      // then
      expect(newCount + 1).to.equal(extensionElementsCount);
    }));


  it('should remove the retryTimeCycle and extensionElements list when the element is not async',
    inject(function(propertiesPanel, selection, elementRegistry) {

      propertiesPanel.attachTo(container);

      var shape = elementRegistry.get('ServiceTask2'),
          bo = getBusinessObject(shape);

      // given
      selection.select(shape);
      var domElement = domQuery('input[name=asyncBefore]', propertiesPanel._container);

      // when
      TestHelper.triggerEvent(domElement, 'click');

      // then
      expect(bo.get('extensionElements')).to.be.undefined;
    }));


  it('should show camunda:async as asyncBefore in the ui',
    inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('ServiceTask'),
          inputEl = 'input[name=asyncBefore]';

      // when
      selection.select(shape);
      var asyncBeforeField = domQuery(inputEl, propertiesPanel._container);

      // then
      expect(!!asyncBeforeField.checked).to.be.ok;

    }));


  it('should migrate camunda:async to asyncBefore when asyncBefore is toggled',
    inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('ServiceTask'),
          inputEl = 'input[name=asyncBefore]';

      // given
      selection.select(shape);
      var asyncBeforeField = domQuery(inputEl, propertiesPanel._container);

      // when
      TestHelper.triggerEvent(asyncBeforeField, 'click');
      var bo = getBusinessObject(shape);

      // then
      expect(bo.get('camunda:async')).to.be.not.ok;
    }));
});
