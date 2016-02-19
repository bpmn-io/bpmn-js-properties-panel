'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
  domQuery = require('min-dom/lib/query'),
  is = require('bpmn-js/lib/util/ModelUtil').is,
  forEach = require('lodash/collection/forEach'),
  coreModule = require('bpmn-js/lib/core'),
  selectionModule = require('diagram-js/lib/features/selection'),
  modelingModule = require('bpmn-js/lib/features/modeling'),
  propertiesProviderModule = require('../../../../lib/provider/camunda'),
  camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

describe('call-activity-variable-mapping', function() {

  var diagramXML = require('./CallActivityVariableMapping.bpmn');

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

  function getMappingsWithSourceAttr(extensionElements, type) {
    var mappings = [];

    if (extensionElements && extensionElements.values) {
      forEach(extensionElements.values, function(value) {
        if (is(value, type) && (typeof value.source !== 'undefined' || typeof value.sourceExpression !== 'undefined')) {
          mappings.push(value);
        }
      });
    }
    return mappings;
  }

  function getMappingsWithVariablesAttr(extensionElements, type) {
    var mappings = [];

    if (extensionElements && extensionElements.values) {
      forEach(extensionElements.values, function(value) {
        if (is(value, type) && (value.variables && value.variables === 'all')) {
          mappings.push(value);
        }
      });
    }
    return mappings;
  }

var CAMUNDA_IN_EXTENSION_ELEMENT = 'camunda:In',
    CAMUNDA_OUT_EXTENSION_ELEMENT = 'camunda:Out';


  it('should fetch camunda:in mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_2');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extension-elements-in-mapping]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(selectBox.options).to.have.length.of(3);
    
    expect(businessObject.extensionElements).not.to.be.undefined;

    var sourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(sourceMappings).to.have.length.of(3);
  }));


  it('should fetch camunda:out mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_6');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extension-elements-out-mapping]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(selectBox.options).to.have.length.of(3);
    
    expect(businessObject.extensionElements).not.to.be.undefined;

    var sourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(sourceMappings).to.have.length.of(3);
  }));


  it('should fetch camunda:in/camunda:out mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_5');
    selection.select(shape);

    var inSelectBox = domQuery('select[id=cam-extension-elements-in-mapping]', propertiesPanel._container),
        outSelectBox = domQuery('select[id=cam-extension-elements-out-mapping]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(inSelectBox.options).to.have.length.of(3);
    expect(outSelectBox.options).to.have.length.of(2);

    expect(businessObject.extensionElements).not.to.be.undefined;

    var inSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(inSourceMappings).to.have.length.of(3);

    var outSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(outSourceMappings).to.have.length.of(2);
  }));


  it('should delete camunda:in mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_5');
    selection.select(shape);

    var inSelectBox = domQuery('select[id=cam-extension-elements-in-mapping]', propertiesPanel._container),
        removeButton = domQuery('button[id=cam-extension-elements-remove-in-mapping]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(inSelectBox.options).to.have.length.of(3);

    inSelectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(inSelectBox, 'change');

    expect(businessObject.extensionElements).not.to.be.undefined;

    var inSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(inSourceMappings).to.have.length.of(3);

    // when
    TestHelper.triggerEvent(removeButton, 'click');

    // then
    expect(inSelectBox.options).to.have.length.of(2);
    expect(inSelectBox.options[0].value).not.to.equal('0 : myVar');

    expect(businessObject.extensionElements).not.to.be.undefined;

    inSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(inSourceMappings).to.have.length.of(2);

  }));


  it('should delete camunda:out mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_5');
    selection.select(shape);

    var outSelectBox = domQuery('select[id=cam-extension-elements-out-mapping]', propertiesPanel._container),
        removeButton = domQuery('button[id=cam-extension-elements-remove-out-mapping]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(outSelectBox.options).to.have.length.of(2);

    outSelectBox.options[1].selected = 'selected';
    TestHelper.triggerEvent(outSelectBox, 'change');

    expect(businessObject.extensionElements).not.to.be.undefined;

    var outSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(outSourceMappings).to.have.length.of(2);

    // when
    TestHelper.triggerEvent(removeButton, 'click');

    // then
    expect(outSelectBox.options).to.have.length.of(1);
    expect(outSelectBox.options[0].value).not.to.equal('0 : #{foo}');

    expect(businessObject.extensionElements).not.to.be.undefined;

    outSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(outSourceMappings).to.have.length.of(1);

  }));


  it('should undo to delete camunda:out mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    var shape = elementRegistry.get('CallActivity_5');
    selection.select(shape);

    var outSelectBox = domQuery('select[id=cam-extension-elements-out-mapping]', propertiesPanel._container),
        removeButton = domQuery('button[id=cam-extension-elements-remove-out-mapping]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(outSelectBox.options).to.have.length.of(2);

    outSelectBox.options[1].selected = 'selected';
    TestHelper.triggerEvent(outSelectBox, 'change');

    expect(businessObject.extensionElements).not.to.be.undefined;

    var outSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(outSourceMappings).to.have.length.of(2);

    // when
    TestHelper.triggerEvent(removeButton, 'click');

    // then
    expect(outSelectBox.options).to.have.length.of(1);
    expect(outSelectBox.options[0].value).not.to.equal('0 : #{foo}');

    expect(businessObject.extensionElements).not.to.be.undefined;

    outSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(outSourceMappings).to.have.length.of(1);

    // when undo
    commandStack.undo();

    // then
    expect(outSelectBox.options).to.have.length.of(2);

    outSelectBox.options[1].selected = 'selected';
    TestHelper.triggerEvent(outSelectBox, 'change');

    expect(businessObject.extensionElements).not.to.be.undefined;

    var outSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(outSourceMappings).to.have.length.of(2);    

  }));


  it('should redo to delete camunda:out mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    var shape = elementRegistry.get('CallActivity_5');
    selection.select(shape);

    var outSelectBox = domQuery('select[id=cam-extension-elements-out-mapping]', propertiesPanel._container),
        removeButton = domQuery('button[id=cam-extension-elements-remove-out-mapping]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(outSelectBox.options).to.have.length.of(2);

    outSelectBox.options[1].selected = 'selected';
    TestHelper.triggerEvent(outSelectBox, 'change');

    expect(businessObject.extensionElements).not.to.be.undefined;

    var outSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(outSourceMappings).to.have.length.of(2);

    // when
    TestHelper.triggerEvent(removeButton, 'click');

    // then
    expect(outSelectBox.options).to.have.length.of(1);
    expect(outSelectBox.options[0].value).not.to.equal('0 : #{foo}');

    expect(businessObject.extensionElements).not.to.be.undefined;

    outSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(outSourceMappings).to.have.length.of(1);

    // when redo
    commandStack.undo();
    commandStack.redo();

    // then
    expect(outSelectBox.options).to.have.length.of(1);
    expect(outSelectBox.options[0].value).not.to.equal('0 : #{foo}');

    expect(businessObject.extensionElements).not.to.be.undefined;

    outSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(outSourceMappings).to.have.length.of(1);

  }));


  it('should add camunda:in mapping to call activity',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_5');
    selection.select(shape);

    var inSelectBox = domQuery('select[id=cam-extension-elements-in-mapping]', propertiesPanel._container),
        addButton = domQuery('button[id=cam-extension-elements-create-in-mapping]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(inSelectBox.options).to.have.length.of(3);

    expect(businessObject.extensionElements).not.to.be.undefined;

    var inSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(inSourceMappings).to.have.length.of(3);

    // when
    TestHelper.triggerEvent(addButton, 'click');

    // then
    expect(inSelectBox.options).to.have.length.of(4);
    expect(inSelectBox.textContent).to.contain('3 : <empty>');

    expect(businessObject.extensionElements).not.to.be.undefined;

    inSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(inSourceMappings).to.have.length.of(4);

  }));


  it('should undo to add camunda:in mapping to call activity',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    var shape = elementRegistry.get('CallActivity_5');
    selection.select(shape);

    var inSelectBox = domQuery('select[id=cam-extension-elements-in-mapping]', propertiesPanel._container),
        addButton = domQuery('button[id=cam-extension-elements-create-in-mapping]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(inSelectBox.options).to.have.length.of(3);

    expect(businessObject.extensionElements).not.to.be.undefined;

    var inSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(inSourceMappings).to.have.length.of(3);

    // when
    TestHelper.triggerEvent(addButton, 'click');

    // then
    expect(inSelectBox.options).to.have.length.of(4);
    expect(inSelectBox.textContent).to.contain('3 : <empty>');

    expect(businessObject.extensionElements).not.to.be.undefined;

    inSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(inSourceMappings).to.have.length.of(4);

    // when undo
    commandStack.undo();

    // then
    expect(inSelectBox.options).to.have.length.of(3);

    expect(businessObject.extensionElements).not.to.be.undefined;

    inSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(inSourceMappings).to.have.length.of(3);

  }));


  it('should redo to add camunda:in mapping to call activity',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    var shape = elementRegistry.get('CallActivity_5');
    selection.select(shape);

    var inSelectBox = domQuery('select[id=cam-extension-elements-in-mapping]', propertiesPanel._container),
        addButton = domQuery('button[id=cam-extension-elements-create-in-mapping]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(inSelectBox.options).to.have.length.of(3);

    expect(businessObject.extensionElements).not.to.be.undefined;

    var inSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(inSourceMappings).to.have.length.of(3);

    // when
    TestHelper.triggerEvent(addButton, 'click');

    // then
    expect(inSelectBox.options).to.have.length.of(4);
    expect(inSelectBox.textContent).to.contain('3 : <empty>');

    expect(businessObject.extensionElements).not.to.be.undefined;

    inSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(inSourceMappings).to.have.length.of(4);

    // when undo
    commandStack.undo();
    commandStack.redo();

    // then
    expect(inSelectBox.options).to.have.length.of(4);
    expect(inSelectBox.textContent).to.contain('3 : <empty>');

    expect(businessObject.extensionElements).not.to.be.undefined;

    inSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(inSourceMappings).to.have.length.of(4);

  }));


  it('should add camunda:out mapping to call activity',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_5');
    selection.select(shape);

    var outSelectBox = domQuery('select[id=cam-extension-elements-out-mapping]', propertiesPanel._container),
        addButton = domQuery('button[id=cam-extension-elements-create-out-mapping]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(outSelectBox.options).to.have.length.of(2);

    expect(businessObject.extensionElements).not.to.be.undefined;

    var outSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(outSourceMappings).to.have.length.of(2);

    // when
    TestHelper.triggerEvent(addButton, 'click');

    // then
    expect(outSelectBox.options).to.have.length.of(3);
    expect(outSelectBox.textContent).to.contain('2 : <empty>');

    expect(businessObject.extensionElements).not.to.be.undefined;

    outSourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(outSourceMappings).to.have.length.of(3);

  }));


  it('should hide camunda:in details',
     inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_3');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extension-elements-in-mapping]', propertiesPanel._container),
        sourceTypeSelect = domQuery('select[id=camunda-source-type]', propertiesPanel._container),
        sourceInput = domQuery('input[id=camunda-source]', propertiesPanel._container),
        targetInput = domQuery('input[id="camunda-target"]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(businessObject.extensionElements).not.to.be.undefined;

    var sourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(sourceMappings).to.have.length.of(1);
    expect(sourceMappings[0].source).to.equal('');

    expect(selectBox.options).to.have.length.of(1);
    expect(sourceTypeSelect.className).to.contain('pp-hidden');
    expect(sourceInput.parentElement.className).to.contain('pp-hidden');
    expect(targetInput.parentElement.className).to.contain('pp-hidden');

  }));


  it('should fetch invalid source field of a camunda:in mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_3');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extension-elements-in-mapping]', propertiesPanel._container),
        sourceTypeSelect = domQuery('select[id=camunda-source-type]', propertiesPanel._container),
        sourceInput = domQuery('input[id=camunda-source]', propertiesPanel._container),
        targetInput = domQuery('input[id="camunda-target"]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(selectBox.options).to.have.length.of(1);

    expect(businessObject.extensionElements).not.to.be.undefined;

    var sourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(sourceMappings).to.have.length.of(1);
    expect(sourceMappings[0].source).to.equal('');

    // when
    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    // then
    expect(sourceTypeSelect.value).to.equal('source');
    expect(sourceInput.className).to.equal('invalid');

  }));


  it('should change source field of a camunda:in mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_3');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extension-elements-in-mapping]', propertiesPanel._container),
        sourceTypeSelect = domQuery('select[id=camunda-source-type]', propertiesPanel._container),
        sourceInput = domQuery('input[id=camunda-source]', propertiesPanel._container),
        targetInput = domQuery('input[id="camunda-target"]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(selectBox.options).to.have.length.of(1);

    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    expect(sourceTypeSelect.value).to.equal('source');
    expect(sourceInput.className).to.equal('invalid');
    expect(targetInput.value).to.be.empty;

    // when
    TestHelper.triggerValue(sourceInput, 'mySourceVal', 'change');

    // then
    expect(sourceInput.value).to.equal('mySourceVal');
    expect(targetInput.className).to.equal('invalid');

    var sourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(sourceMappings).to.have.length.of(1);
    expect(sourceMappings[0].source).to.equal('mySourceVal');

  }));


  it('should change sourceExpression field of a camunda:in mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_4');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extension-elements-in-mapping]', propertiesPanel._container),
        sourceTypeSelect = domQuery('select[id=camunda-source-type]', propertiesPanel._container),
        sourceInput = domQuery('input[id=camunda-source]', propertiesPanel._container),
        targetInput = domQuery('input[id="camunda-target"]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(selectBox.options).to.have.length.of(1);

    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    expect(sourceTypeSelect.value).to.equal('sourceExpression');
    expect(sourceInput.className).to.equal('invalid');
    expect(targetInput.value).to.be.empty;

    // when
    TestHelper.triggerValue(sourceInput, 'mySourceExpressionVal', 'change');

    // then
    expect(sourceInput.value).to.equal('mySourceExpressionVal');
    expect(targetInput.className).to.equal('invalid');

    var sourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(sourceMappings).to.have.length.of(1);
    expect(sourceMappings[0].sourceExpression).to.equal('mySourceExpressionVal');

  }));


  it('should change target field of a camunda:out mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_3');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extension-elements-out-mapping]', propertiesPanel._container),
        sourceTypeSelect = domQuery('select[id=camunda-source-type]', propertiesPanel._container),
        sourceInput = domQuery('input[id=camunda-source]', propertiesPanel._container),
        targetInput = domQuery('input[id="camunda-target"]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(selectBox.options).to.have.length.of(1);

    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    expect(sourceTypeSelect.value).to.equal('source');
    expect(sourceInput.value).to.equal('mySource');
    expect(targetInput.className).to.equal('invalid');

    // when
    TestHelper.triggerValue(targetInput, 'myTargetVal', 'change');

    // then
    expect(targetInput.value).to.equal('myTargetVal');

    var sourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(sourceMappings).to.have.length.of(1);
    expect(sourceMappings[0].target).to.equal('myTargetVal');

  }));


  it('should clear target field of a camunda:out mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_4');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extension-elements-out-mapping]', propertiesPanel._container),
        sourceTypeSelect = domQuery('select[id=camunda-source-type]', propertiesPanel._container),
        sourceInput = domQuery('input[id=camunda-source]', propertiesPanel._container),
        targetInput = domQuery('input[id="camunda-target"]', propertiesPanel._container),
        clearButton = domQuery('[data-entry=target] [data-action=clear]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(selectBox.options).to.have.length.of(1);

    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    expect(sourceTypeSelect.value).to.equal('sourceExpression');
    expect(sourceInput.value).to.equal('mySource');
    expect(targetInput.value).to.equal('myTarget');

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(targetInput.value).to.be.empty;
    expect(targetInput.className).to.equal('invalid');

    var sourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(sourceMappings).to.have.length.of(1);
    expect(sourceMappings[0].target).to.be.undefined;

  }));


  it('should undo to clear target field of a camunda:out mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    var shape = elementRegistry.get('CallActivity_4');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extension-elements-out-mapping]', propertiesPanel._container),
        sourceTypeSelect = domQuery('select[id=camunda-source-type]', propertiesPanel._container),
        sourceInput = domQuery('input[id=camunda-source]', propertiesPanel._container),
        targetInput = domQuery('input[id="camunda-target"]', propertiesPanel._container),
        clearButton = domQuery('[data-entry=target] [data-action=clear]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(selectBox.options).to.have.length.of(1);

    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    expect(sourceTypeSelect.value).to.equal('sourceExpression');
    expect(sourceInput.value).to.equal('mySource');
    expect(targetInput.value).to.equal('myTarget');

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(targetInput.value).to.be.empty;
    expect(targetInput.className).to.equal('invalid');

    var sourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(sourceMappings).to.have.length.of(1);
    expect(sourceMappings[0].target).to.be.undefined;

    // when undo
    commandStack.undo();

    // then
    expect(selectBox.options).to.have.length.of(1);

    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    expect(sourceTypeSelect.value).to.equal('sourceExpression');
    expect(sourceInput.value).to.equal('mySource');
    expect(targetInput.value).to.equal('myTarget');

  }));


  it('should redo to clear target field of a camunda:out mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    var shape = elementRegistry.get('CallActivity_4');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extension-elements-out-mapping]', propertiesPanel._container),
        sourceTypeSelect = domQuery('select[id=camunda-source-type]', propertiesPanel._container),
        sourceInput = domQuery('input[id=camunda-source]', propertiesPanel._container),
        targetInput = domQuery('input[id="camunda-target"]', propertiesPanel._container),
        clearButton = domQuery('[data-entry=target] [data-action=clear]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(selectBox.options).to.have.length.of(1);

    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    expect(sourceTypeSelect.value).to.equal('sourceExpression');
    expect(sourceInput.value).to.equal('mySource');
    expect(targetInput.value).to.equal('myTarget');

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(targetInput.value).to.be.empty;
    expect(targetInput.className).to.equal('invalid');

    var sourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(sourceMappings).to.have.length.of(1);
    expect(sourceMappings[0].target).to.be.undefined;

    // when undo
    commandStack.undo();
    commandStack.redo();

    // then
    expect(targetInput.value).to.be.empty;
    expect(targetInput.className).to.equal('invalid');

    var sourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(sourceMappings).to.have.length.of(1);
    expect(sourceMappings[0].target).to.be.undefined;

  }));


  it('should switch from sourceExpression to source for a camunda:out mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_4');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extension-elements-out-mapping]', propertiesPanel._container),
        sourceTypeSelect = domQuery('select[id=camunda-source-type]', propertiesPanel._container),
        sourceInput = domQuery('input[id=camunda-source]', propertiesPanel._container),
        targetInput = domQuery('input[id="camunda-target"]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(selectBox.options).to.have.length.of(1);

    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    expect(sourceTypeSelect.value).to.equal('sourceExpression');
    expect(sourceInput.value).to.equal('mySource');
    expect(targetInput.value).to.equal('myTarget');

    var sourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(sourceMappings).to.have.length.of(1);
    expect(sourceMappings[0].sourceExpression).to.equal(sourceInput.value);
    expect(sourceMappings[0].target).to.equal(targetInput.value);

    // when
    sourceTypeSelect.options[0].selected = 'selected';
    TestHelper.triggerEvent(sourceTypeSelect, 'change');

    // then
    expect(sourceTypeSelect.value).to.equal('source');
    expect(sourceInput.className).to.equal('invalid');
    expect(targetInput.value).to.equal('myTarget');

    var sourceMappings = getMappingsWithSourceAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(sourceMappings).to.have.length.of(1);
    expect(sourceMappings[0].source).to.be.empty;
    expect(sourceMappings[0].sourceExpression).to.be.undefined;
    expect(sourceMappings[0].target).to.equal(targetInput.value);

  }));


  it('should fetch the variables attr of a camunda:in mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_5');
    selection.select(shape);

    var checkBox = domQuery('input[id=camunda-in-mapping-variables]', propertiesPanel._container);

    expect(checkBox.checked).to.be.true;
  }));


  it('should remove the variables attr of a camunda:in mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_5');

    selection.select(shape);

    var checkBox = domQuery('input[id=camunda-in-mapping-variables]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(checkBox.checked).to.be.true;

    var variablesMappings = getMappingsWithVariablesAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variablesMappings[0].variables).to.equal('all');

    // when
    TestHelper.triggerEvent(checkBox, 'click');

    // then
    expect(checkBox.checked).to.be.false;

    variablesMappings = getMappingsWithVariablesAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variablesMappings).to.have.length.of(0);

  }));


  it('should set the variables attr of a camunda:in mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_3');

    selection.select(shape);

    var checkBox = domQuery('input[id=camunda-in-mapping-variables]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(checkBox.checked).to.be.false;

    var variablesMappings = getMappingsWithVariablesAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variablesMappings).to.have.length.of(0);

    // when
    TestHelper.triggerEvent(checkBox, 'click');

    // then
    expect(checkBox.checked).to.be.true;

    variablesMappings = getMappingsWithVariablesAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variablesMappings).to.have.length.of(1);
  }));


  it('should undo to remove the variables attr of a camunda:in mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    var shape = elementRegistry.get('CallActivity_5');

    selection.select(shape);

    var checkBox = domQuery('input[id=camunda-in-mapping-variables]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(checkBox.checked).to.be.true;

    var variablesMappings = getMappingsWithVariablesAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variablesMappings[0].variables).to.equal('all');

    // when
    TestHelper.triggerEvent(checkBox, 'click');

    // then
    expect(checkBox.checked).to.be.false;

    variablesMappings = getMappingsWithVariablesAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variablesMappings).to.have.length.of(0);

    // when undo
    commandStack.undo();

    // then
    expect(checkBox.checked).to.be.true;

    variablesMappings = getMappingsWithVariablesAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variablesMappings[0].variables).to.equal('all');

  }));


  it('should redo to remove the variables attr of a camunda:in mapping of a call activity',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    var shape = elementRegistry.get('CallActivity_5');

    selection.select(shape);

    var checkBox = domQuery('input[id=camunda-in-mapping-variables]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(checkBox.checked).to.be.true;

    var variablesMappings = getMappingsWithVariablesAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variablesMappings[0].variables).to.equal('all');

    // when
    TestHelper.triggerEvent(checkBox, 'click');

    // then
    expect(checkBox.checked).to.be.false;

    variablesMappings = getMappingsWithVariablesAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variablesMappings).to.have.length.of(0);

    // when redo
    commandStack.undo();
    commandStack.redo();

    // then
    expect(checkBox.checked).to.be.false;

    variablesMappings = getMappingsWithVariablesAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variablesMappings).to.have.length.of(0);

  }));

});
