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

describe('CallActivity - variable mapping', function() {

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

  function getVariableMappings(extensionElements, type) {
    var mappings = [];

    if (extensionElements && extensionElements.values) {
      forEach(extensionElements.values, function(value) {
        if (is(value, type) &&
            (typeof value.source !== 'undefined' ||
             typeof value.sourceExpression !== 'undefined' ||
             value.variables === 'all')) {
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


  it('should fetch camunda:in mapping of a call activity', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_2');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(selectBox.options).to.have.length(3);

    expect(businessObject.extensionElements).not.to.be.undefined;

    var variableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variableMappings).to.have.length(3);
  }));


  it('should fetch camunda:out mapping of a call activity', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_6');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-out]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(selectBox.options).to.have.length(3);

    expect(businessObject.extensionElements).not.to.be.undefined;

    var variableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(variableMappings).to.have.length(3);
  }));


  it('should fetch camunda:in/camunda:out mapping of a call activity', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_5');
    selection.select(shape);

    var inSelectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
        outSelectBox = domQuery('select[id=cam-extensionElements-variableMapping-out]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(inSelectBox.options).to.have.length(4);
    expect(outSelectBox.options).to.have.length(2);

    expect(businessObject.extensionElements).not.to.be.undefined;

    var invariableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(invariableMappings).to.have.length(4);

    var outvariableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(outvariableMappings).to.have.length(2);
  }));


  it('should remove camunda:in mapping of a call activity', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_5');
    selection.select(shape);

    var inSelectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
        removeButton = domQuery('button[id=cam-extensionElements-remove-variableMapping-in]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(inSelectBox.options).to.have.length(4);

    inSelectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(inSelectBox, 'change');

    expect(businessObject.extensionElements).not.to.be.undefined;

    var invariableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(invariableMappings).to.have.length(4);

    // when
    TestHelper.triggerEvent(removeButton, 'click');

    // then
    expect(inSelectBox.options).to.have.length(3);
    expect(inSelectBox.options[0].value).not.to.equal('0 : myVar');

    expect(businessObject.extensionElements).not.to.be.undefined;

    invariableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(invariableMappings).to.have.length(3);

  }));


  describe('should remove camunda:out mapping of a call activity', function() {

    var outSelectBox,
        businessObject,
        outVariableMappings;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
      var shape = elementRegistry.get('CallActivity_5');
      selection.select(shape);

      outSelectBox = domQuery('select[id=cam-extensionElements-variableMapping-out]', propertiesPanel._container);
      businessObject = getBusinessObject(shape);
      var removeButton = domQuery('button[id=cam-extensionElements-remove-variableMapping-out]', propertiesPanel._container);

      // given
      expect(outSelectBox.options).to.have.length(2);

      outSelectBox.options[1].selected = 'selected';
      TestHelper.triggerEvent(outSelectBox, 'change');

      expect(businessObject.extensionElements).not.to.be.undefined;

      outVariableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
      expect(outVariableMappings).to.have.length(2);

      // when
      TestHelper.triggerEvent(removeButton, 'click');
    }));

    it('should execute', inject(function() {

      expect(outSelectBox.options).to.have.length(1);
      expect(outSelectBox.options[0].value).not.to.equal('0 : #{foo}');

      expect(businessObject.extensionElements).not.to.be.undefined;

      outVariableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
      expect(outVariableMappings).to.have.length(1);
    }));

    it('should undo', inject(function(commandStack) {

      commandStack.undo();

      expect(outSelectBox.options).to.have.length(2);

      outSelectBox.options[1].selected = 'selected';
      TestHelper.triggerEvent(outSelectBox, 'change');

      expect(businessObject.extensionElements).not.to.be.undefined;

      outVariableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
      expect(outVariableMappings).to.have.length(2);

    }));

    it('should redo', inject(function(commandStack) {

      commandStack.undo();
      commandStack.redo();

      expect(outSelectBox.options).to.have.length(1);
      expect(outSelectBox.options[0].value).not.to.equal('0 : #{foo}');

      expect(businessObject.extensionElements).not.to.be.undefined;

      outVariableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
      expect(outVariableMappings).to.have.length(1);

    }));
  });


  describe('should add camunda:in mapping to a call activity', function() {

    var inSelectBox,
        businessObject,
        inVariableMappings;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
      var shape = elementRegistry.get('CallActivity_5');
      selection.select(shape);

      inSelectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container);
      businessObject = getBusinessObject(shape);
      var addButton = domQuery('button[id=cam-extensionElements-create-variableMapping-in]', propertiesPanel._container);

      expect(inSelectBox.options).to.have.length(4);

      expect(businessObject.extensionElements).not.to.be.undefined;

      inVariableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
      expect(inVariableMappings).to.have.length(4);

      TestHelper.triggerEvent(addButton, 'click');
    }));


    it('should execute', inject(function() {

      expect(inSelectBox.options).to.have.length(5);
      expect(inSelectBox.textContent).to.contain('4 : <empty>');

      expect(businessObject.extensionElements).not.to.be.undefined;

      inVariableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
      expect(inVariableMappings).to.have.length(5);

    }));

    it('should undo', inject(function(commandStack) {

      commandStack.undo();

      expect(inSelectBox.options).to.have.length(4);

      expect(businessObject.extensionElements).not.to.be.undefined;

      inVariableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
      expect(inVariableMappings).to.have.length(4);
    }));

    it('should redo', inject(function(commandStack) {

      commandStack.undo();
      commandStack.redo();

      expect(inSelectBox.options).to.have.length(5);
      expect(inSelectBox.textContent).to.contain('4 : <empty>');

      expect(businessObject.extensionElements).not.to.be.undefined;

      inVariableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
      expect(inVariableMappings).to.have.length(5);

    }));
  });


  it('should add camunda:out mapping to call activity', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_5');
    selection.select(shape);

    var outSelectBox = domQuery('select[id=cam-extensionElements-variableMapping-out]', propertiesPanel._container),
        addButton = domQuery('button[id=cam-extensionElements-create-variableMapping-out]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(outSelectBox.options).to.have.length(2);

    expect(businessObject.extensionElements).not.to.be.undefined;

    var outvariableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(outvariableMappings).to.have.length(2);

    // when
    TestHelper.triggerEvent(addButton, 'click');

    // then
    expect(outSelectBox.options).to.have.length(3);
    expect(outSelectBox.textContent).to.contain('2 : <empty>');

    expect(businessObject.extensionElements).not.to.be.undefined;

    outvariableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(outvariableMappings).to.have.length(3);

  }));

  it('should hide camunda:in details', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_3');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
        typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container),
        sourceInput = domQuery('input[id=camunda-variableMapping-source]', propertiesPanel._container),
        targetInput = domQuery('input[id=camunda-variableMapping-target]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(businessObject.extensionElements).not.to.be.undefined;

    var variableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variableMappings).to.have.length(1);
    expect(variableMappings[0].source).to.equal('');

    expect(selectBox.options).to.have.length(1);
    expect(typeSelectBox.className).to.contain('bpp-hidden');
    expect(sourceInput.parentElement.className).to.contain('bpp-hidden');
    expect(targetInput.parentElement.className).to.contain('bpp-hidden');

  }));


  it('should fetch invalid source field of a camunda:in mapping of a call activity', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_3');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
        typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container),
        sourceInput = domQuery('input[id=camunda-variableMapping-source]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(selectBox.options).to.have.length(1);

    expect(businessObject.extensionElements).not.to.be.undefined;

    var variableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variableMappings).to.have.length(1);
    expect(variableMappings[0].source).to.equal('');

    // when
    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    // then
    expect(typeSelectBox.value).to.equal('source');
    expect(sourceInput.className).to.equal('invalid');

  }));


  it('should change source field of a camunda:in mapping of a call activity', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_3');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
        typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container),
        sourceInput = domQuery('input[id=camunda-variableMapping-source]', propertiesPanel._container),
        targetInput = domQuery('input[id="camunda-variableMapping-target"]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(selectBox.options).to.have.length(1);

    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    expect(typeSelectBox.value).to.equal('source');
    expect(sourceInput.className).to.equal('invalid');
    expect(targetInput.value).to.be.empty;

    // when
    TestHelper.triggerValue(sourceInput, 'mySourceVal', 'change');

    // then
    expect(sourceInput.value).to.equal('mySourceVal');
    expect(targetInput.className).to.equal('invalid');

    var variableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variableMappings).to.have.length(1);
    expect(variableMappings[0].source).to.equal('mySourceVal');
  }));


  it('should change sourceExpression field of a camunda:in mapping of a call activity', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_4');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
        typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container),
        sourceInput = domQuery('input[id=camunda-variableMapping-source]', propertiesPanel._container),
        targetInput = domQuery('input[id="camunda-variableMapping-target"]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(selectBox.options).to.have.length(1);

    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    expect(typeSelectBox.value).to.equal('sourceExpression');
    expect(sourceInput.className).to.equal('invalid');
    expect(targetInput.value).to.be.empty;

    // when
    TestHelper.triggerValue(sourceInput, 'mySourceExpressionVal', 'change');

    // then
    expect(sourceInput.value).to.equal('mySourceExpressionVal');
    expect(targetInput.className).to.equal('invalid');

    var variableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variableMappings).to.have.length(1);
    expect(variableMappings[0].sourceExpression).to.equal('mySourceExpressionVal');
  }));


  it('should change target field of a camunda:out mapping of a call activity', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_3');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-out]', propertiesPanel._container),
        typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container),
        sourceInput = domQuery('input[id=camunda-variableMapping-source]', propertiesPanel._container),
        targetInput = domQuery('input[id="camunda-variableMapping-target"]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(selectBox.options).to.have.length(1);

    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    expect(typeSelectBox.value).to.equal('source');
    expect(sourceInput.value).to.equal('mySource');
    expect(targetInput.className).to.equal('invalid');

    // when
    TestHelper.triggerValue(targetInput, 'myTargetVal', 'change');

    // then
    expect(targetInput.value).to.equal('myTargetVal');

    var variableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(variableMappings).to.have.length(1);
    expect(variableMappings[0].target).to.equal('myTargetVal');

  }));


  describe('should clear target field of a camunda:out mapping of a call activity', function() {

    var targetInput,
        selectBox,
        typeSelectBox,
        sourceInput,
        businessObject;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
      var shape = elementRegistry.get('CallActivity_4');
      selection.select(shape);

      selectBox = domQuery('select[id=cam-extensionElements-variableMapping-out]', propertiesPanel._container);
      typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container);
      sourceInput = domQuery('input[id=camunda-variableMapping-source]', propertiesPanel._container);
      targetInput = domQuery('input[id="camunda-variableMapping-target"]', propertiesPanel._container);
      businessObject = getBusinessObject(shape);
      var clearButton = domQuery('[data-entry=variableMapping-target] [data-action=clear]', propertiesPanel._container);

      expect(selectBox.options).to.have.length(1);

      selectBox.options[0].selected = 'selected';
      TestHelper.triggerEvent(selectBox, 'change');

      expect(typeSelectBox.value).to.equal('sourceExpression');
      expect(sourceInput.value).to.equal('mySource');
      expect(targetInput.value).to.equal('myTarget');

      TestHelper.triggerEvent(clearButton, 'click');
    }));

    it('should execute', inject(function() {

      expect(targetInput.value).to.be.empty;
      expect(targetInput.className).to.equal('invalid');

      var variableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
      expect(variableMappings).to.have.length(1);
      expect(variableMappings[0].target).to.be.undefined;

    }));

    it('should undo', inject(function(commandStack) {

      commandStack.undo();

      expect(selectBox.options).to.have.length(1);

      selectBox.options[0].selected = 'selected';
      TestHelper.triggerEvent(selectBox, 'change');

      expect(typeSelectBox.value).to.equal('sourceExpression');
      expect(sourceInput.value).to.equal('mySource');
      expect(targetInput.value).to.equal('myTarget');

      var variableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
      expect(variableMappings[0].target).to.equal('myTarget');

    }));

    it('should redo', inject(function(commandStack) {

      commandStack.undo();
      commandStack.redo();

      expect(targetInput.value).to.be.empty;
      expect(targetInput.className).to.equal('invalid');

      var variableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
      expect(variableMappings[0].target).to.be.undefined;

    }));
  });


  it('should switch from sourceExpression to source for a camunda:out mapping of a call activity', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_4');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-out]', propertiesPanel._container),
        typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container),
        sourceInput = domQuery('input[id=camunda-variableMapping-source]', propertiesPanel._container),
        targetInput = domQuery('input[id="camunda-variableMapping-target"]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(selectBox.options).to.have.length(1);

    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    expect(typeSelectBox.value).to.equal('sourceExpression');
    expect(sourceInput.value).to.equal('mySource');
    expect(targetInput.value).to.equal('myTarget');

    var variableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(variableMappings).to.have.length(1);
    expect(variableMappings[0].sourceExpression).to.equal(sourceInput.value);
    expect(variableMappings[0].target).to.equal(targetInput.value);

    // when
    typeSelectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(typeSelectBox, 'change');

    // then
    expect(typeSelectBox.value).to.equal('source');
    expect(sourceInput.className).to.equal('invalid');
    expect(targetInput.value).to.equal('myTarget');

    var updatedVariableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
    expect(updatedVariableMappings).to.have.length(1);
    expect(updatedVariableMappings[0].source).to.be.empty;
    expect(updatedVariableMappings[0].sourceExpression).to.be.undefined;
    expect(updatedVariableMappings[0].target).to.equal(targetInput.value);
  }));


  it('should fetch the variables attr of a camunda:in mapping of a call activity', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_5');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
        typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container);

    expect(selectBox.options).to.have.length(4);

    selectBox.options[3].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    expect(typeSelectBox.value).to.equal('variables');
  }));


  it('should hide camunda:in details when inOutType have value "All"', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_5');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
        typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container),
        sourceInput = domQuery('input[id=camunda-variableMapping-source]', propertiesPanel._container),
        targetInput = domQuery('input[id="camunda-variableMapping-target"]', propertiesPanel._container);

    expect(selectBox.options).to.have.length(4);

    selectBox.options[3].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    expect(typeSelectBox.value).to.equal('variables');
    expect(sourceInput.parentElement.className).to.contain('bpp-hidden');
    expect(targetInput.parentElement.className).to.contain('bpp-hidden');
  }));


  it('should remove the variables attr of a camunda:in mapping of a call activity', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_5');

    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
        typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container),
        removeButton = domQuery('button[id=cam-extensionElements-remove-variableMapping-in]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    var variablesMappings = getMappingsWithVariablesAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variablesMappings[0].variables).to.equal('all');

    selectBox.options[3].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    expect(typeSelectBox.value).to.equal('variables');

    // when
    TestHelper.triggerEvent(removeButton, 'click');

    // then
    variablesMappings = getMappingsWithVariablesAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variablesMappings).to.have.length(0);
  }));


  it('should set the variables attr of a camunda:in mapping of a call activity', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CallActivity_3');

    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
        typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container),
        addButton = domQuery('button[id=cam-extensionElements-create-variableMapping-in]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(selectBox).to.have.length(1);

    var variablesMappings = getMappingsWithVariablesAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variablesMappings).to.have.length(0);

    // when
    TestHelper.triggerEvent(addButton, 'click');

    // then
    expect(selectBox).to.have.length(2);

    // when
    typeSelectBox.options[2].selected = 'selected';
    TestHelper.triggerEvent(typeSelectBox, 'change');

    // then
    expect(selectBox.textContent).to.contain('1 : all');

    variablesMappings = getMappingsWithVariablesAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variablesMappings).to.have.length(1);
  }));


  it('should fetch local variable attribute of camunda:in mapping', inject(function(propertiesPanel, elementRegistry, selection) {

    var shape = elementRegistry.get('CallActivity_1');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
        checkBox = domQuery('input[id=camunda-variableMapping-local]', propertiesPanel._container);

    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    expect(checkBox.checked).to.be.true;
  }));


  it('should add local attribute to camunda:in source mapping', inject(function(propertiesPanel, elementRegistry, selection) {

    var shape = elementRegistry.get('CallActivity_2');
    selection.select(shape);

    var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
        checkBox = domQuery('input[id=camunda-variableMapping-local]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

      // given
    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    expect(checkBox.checked).to.be.false;

      // when
    TestHelper.triggerEvent(checkBox, 'click');

      // then
    expect(checkBox.checked).to.be.true;

    var variableMappings = getVariableMappings(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    expect(variableMappings).to.have.length(3);
    expect(variableMappings[0].local).to.be.true;
  }));


  describe('remove local variable attribute of camunda:in mapping', function() {

    var checkBox,
        variablesMappings;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

      var shape = elementRegistry.get('CallActivity_1');
      selection.select(shape);

      var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
          businessObject = getBusinessObject(shape);
      checkBox = domQuery('input[id=camunda-variableMapping-local]', propertiesPanel._container);

      // select mapping
      selectBox.options[0].selected = 'selected';
      TestHelper.triggerEvent(selectBox, 'change');

      // remove local attribute
      TestHelper.triggerEvent(checkBox, 'click');

      variablesMappings = getMappingsWithVariablesAttr(businessObject.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
    }));


    it('should execute', inject(function() {

      expect(checkBox.checked).to.be.false;

      expect(variablesMappings[0].local).to.be.false;
    }));


    it('should undo', inject(function(commandStack) {

      commandStack.undo();

      expect(checkBox.checked).to.be.true;

      expect(variablesMappings[0].local).to.be.true;
    }));


    it('should redo', inject(function(commandStack) {

      commandStack.undo();
      commandStack.redo();

      expect(checkBox.checked).to.be.false;

      expect(variablesMappings[0].local).to.be.false;
    }));

  });


  describe('set local variable attribute of camunda:out mapping', function() {

    var checkBox,
        variablesMappings;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

      var shape = elementRegistry.get('CallActivity_1');
      selection.select(shape);

      var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-out]', propertiesPanel._container),
          businessObject = getBusinessObject(shape);
      checkBox = domQuery('input[id=camunda-variableMapping-local]', propertiesPanel._container);

      // select mapping
      selectBox.options[0].selected = 'selected';
      TestHelper.triggerEvent(selectBox, 'change');

      // set local attribute
      TestHelper.triggerEvent(checkBox, 'click');

      variablesMappings = getMappingsWithVariablesAttr(businessObject.extensionElements, CAMUNDA_OUT_EXTENSION_ELEMENT);
      expect(variablesMappings).to.have.length(1);
    }));


    it('should execute', inject(function() {

      expect(checkBox.checked).to.be.true;

      expect(variablesMappings[0].local).to.be.true;
    }));


    it('should undo', inject(function(commandStack) {

      commandStack.undo();

      expect(checkBox.checked).to.be.false;

      expect(variablesMappings[0].local).to.be.false;
    }));


    it('should redo', inject(function(commandStack) {

      commandStack.undo();
      commandStack.redo();

      expect(checkBox.checked).to.be.true;

      expect(variablesMappings[0].local).to.be.true;
    }));

  });

});
