'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('lib'),
    domQuery = require('min-dom').query,
    is = require('bpmn-js/lib/util/ModelUtil').is,
    forEach = require('lodash/forEach'),
    coreModule = require('bpmn-js/lib/core').default,
    selectionModule = require('diagram-js/lib/features/selection').default,
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    propertiesProviderModule = require('lib/provider/camunda'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    eventDefinitionHelper = require('lib/helper/EventDefinitionHelper');

describe('SignalEvent - variable mapping', function() {

  var diagramXML = require('./SignalEventVariableMapping.bpmn');

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

  var CAMUNDA_IN_EXTENSION_ELEMENT = 'camunda:In';


  describe('IntermediateThrowEvent', function() {

    it('should fetch camunda:in mapping of a signal intermediate throw event', inject(function(propertiesPanel, selection, elementRegistry) {
      var shape = elementRegistry.get('IntermediateThrowEvent_1');
      selection.select(shape);

      var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
          businessObject = getBusinessObject(shape),
          signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(businessObject);

      expect(selectBox.options).to.have.length(3);

      expect(signalEventDefinition.extensionElements).not.to.be.undefined;

      var variableMappings = getVariableMappings(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
      expect(variableMappings).to.have.length(3);
    }));


    it('should remove camunda:in mapping of a signal intermediate throw event', inject(function(propertiesPanel, selection, elementRegistry) {
      var shape = elementRegistry.get('IntermediateThrowEvent_1');
      selection.select(shape);

      var inSelectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
          removeButton = domQuery('button[id=cam-extensionElements-remove-variableMapping-in]', propertiesPanel._container),
          businessObject = getBusinessObject(shape),
          signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(businessObject);

      // given
      expect(inSelectBox.options).to.have.length(3);

      inSelectBox.options[0].selected = 'selected';
      TestHelper.triggerEvent(inSelectBox, 'change');

      expect(signalEventDefinition.extensionElements).not.to.be.undefined;

      var invariableMappings = getVariableMappings(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
      expect(invariableMappings).to.have.length(3);

      // when
      TestHelper.triggerEvent(removeButton, 'click');

      // then
      expect(inSelectBox.options).to.have.length(2);
      expect(inSelectBox.options[0].value).not.to.equal('0 : source1');

      expect(signalEventDefinition.extensionElements).not.to.be.undefined;

      invariableMappings = getVariableMappings(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
      expect(invariableMappings).to.have.length(2);
    }));


    describe('should add camunda:in mapping to a signal intermediate throw event', function() {

      var inSelectBox,
          businessObject,
          inVariableMappings,
          signalEventDefinition;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        var shape = elementRegistry.get('IntermediateThrowEvent_1');
        selection.select(shape);

        inSelectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container);
        businessObject = getBusinessObject(shape);
        signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(businessObject);

        var addButton = domQuery('button[id=cam-extensionElements-create-variableMapping-in]', propertiesPanel._container);

        expect(inSelectBox.options).to.have.length(3);

        expect(signalEventDefinition.extensionElements).not.to.be.undefined;

        inVariableMappings = getVariableMappings(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
        expect(inVariableMappings).to.have.length(3);

        TestHelper.triggerEvent(addButton, 'click');
      }));


      it('should execute', inject(function() {
        expect(inSelectBox.options).to.have.length(4);
        expect(inSelectBox.textContent).to.contain('<undefined> := <empty>');

        expect(signalEventDefinition.extensionElements).not.to.be.undefined;

        inVariableMappings = getVariableMappings(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
        expect(inVariableMappings).to.have.length(4);

      }));

      it('should undo', inject(function(commandStack) {

        commandStack.undo();

        expect(inSelectBox.options).to.have.length(3);

        expect(signalEventDefinition.extensionElements).not.to.be.undefined;

        inVariableMappings = getVariableMappings(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
        expect(inVariableMappings).to.have.length(3);
      }));

      it('should redo', inject(function(commandStack) {

        commandStack.undo();
        commandStack.redo();

        expect(inSelectBox.options).to.have.length(4);
        expect(inSelectBox.textContent).to.contain('<undefined> := <empty>');

        expect(signalEventDefinition.extensionElements).not.to.be.undefined;

        inVariableMappings = getVariableMappings(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
        expect(inVariableMappings).to.have.length(4);

      }));
    });


    it('should hide camunda:in details', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('IntermediateThrowEvent_1');
      selection.select(shape);

      var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
          typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container),
          sourceInput = domQuery('input[id=camunda-variableMapping-source]', propertiesPanel._container),
          targetInput = domQuery('input[id=camunda-variableMapping-target]', propertiesPanel._container),
          businessObject = getBusinessObject(shape),
          signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(businessObject);

      // given
      expect(signalEventDefinition.extensionElements).not.to.be.undefined;

      var variableMappings = getVariableMappings(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
      expect(variableMappings).to.have.length(3);
      expect(variableMappings[0].source).to.equal('source1');

      expect(selectBox.options).to.have.length(3);
      expect(typeSelectBox.className).to.contain('bpp-hidden');
      expect(sourceInput.parentElement.className).to.contain('bpp-hidden');
      expect(targetInput.parentElement.className).to.contain('bpp-hidden');

    }));


    it('should fetch invalid source field of a camunda:in mapping of a signal intermediate throw event', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('IntermediateThrowEvent_2');
      selection.select(shape);

      var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
          typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container),
          sourceInput = domQuery('input[id=camunda-variableMapping-source]', propertiesPanel._container),
          businessObject = getBusinessObject(shape),
          signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(businessObject);

      // given
      expect(selectBox.options).to.have.length(1);

      expect(signalEventDefinition.extensionElements).not.to.be.undefined;

      var variableMappings = getVariableMappings(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
      expect(variableMappings).to.have.length(1);
      expect(variableMappings[0].source).to.equal('');

      // when
      selectBox.options[0].selected = 'selected';
      TestHelper.triggerEvent(selectBox, 'change');

      // then
      expect(typeSelectBox.value).to.equal('source');
      expect(sourceInput.className).to.equal('invalid');

    }));


    it('should change source field of a camunda:in mapping of a signal intermediate throw event', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('IntermediateThrowEvent_2');
      selection.select(shape);

      var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
          typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container),
          sourceInput = domQuery('input[id=camunda-variableMapping-source]', propertiesPanel._container),
          targetInput = domQuery('input[id="camunda-variableMapping-target"]', propertiesPanel._container),
          businessObject = getBusinessObject(shape),
          signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(businessObject);

      // given
      expect(selectBox.options).to.have.length(1);

      selectBox.options[0].selected = 'selected';
      TestHelper.triggerEvent(selectBox, 'change');

      expect(typeSelectBox.value).to.equal('source');
      expect(sourceInput.className).to.equal('invalid');
      expect(targetInput.value).to.be.empty;

      // when
      TestHelper.triggerValue(sourceInput, 'foo', 'change');

      // then
      expect(sourceInput.value).to.equal('foo');
      expect(targetInput.className).to.equal('invalid');

      var variableMappings = getVariableMappings(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
      expect(variableMappings).to.have.length(1);
      expect(variableMappings[0].source).to.equal('foo');
    }));


    it('should mark source field of a camunda:in mapping of a signal intermediate throw event as invalid', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('IntermediateThrowEvent_2');
      selection.select(shape);

      var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
          typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container),
          sourceInput = domQuery('input[id=camunda-variableMapping-source]', propertiesPanel._container),
          targetInput = domQuery('input[id="camunda-variableMapping-target"]', propertiesPanel._container),
          businessObject = getBusinessObject(shape),
          signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(businessObject);

      // given
      expect(selectBox.options).to.have.length(1);

      selectBox.options[0].selected = 'selected';
      TestHelper.triggerEvent(selectBox, 'change');

      expect(typeSelectBox.value).to.equal('source');
      expect(sourceInput.className).to.equal('invalid');
      expect(targetInput.value).to.be.empty;

      // when
      TestHelper.triggerValue(sourceInput, 'foo ', 'change');

      // then
      expect(sourceInput.value).to.equal('foo ');
      expect(sourceInput.className).to.equal('invalid');

      var variableMappings = getVariableMappings(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
      expect(variableMappings).to.have.length(1);
      expect(variableMappings[0].source).to.equal('foo ');
    }));


    it('should change sourceExpression field of a camunda:in mapping of a signal intermediate throw event', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('IntermediateThrowEvent_3');
      selection.select(shape);

      var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
          typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container),
          sourceInput = domQuery('input[id=camunda-variableMapping-source]', propertiesPanel._container),
          targetInput = domQuery('input[id="camunda-variableMapping-target"]', propertiesPanel._container),
          businessObject = getBusinessObject(shape),
          signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(businessObject);

      // given
      expect(selectBox.options).to.have.length(1);

      selectBox.options[0].selected = 'selected';
      TestHelper.triggerEvent(selectBox, 'change');

      expect(typeSelectBox.value).to.equal('sourceExpression');
      expect(sourceInput.className).to.equal('invalid');
      expect(targetInput.value).to.be.empty;

      // when
      TestHelper.triggerValue(sourceInput, 'foo', 'change');

      // then
      expect(sourceInput.value).to.equal('foo');
      expect(targetInput.className).to.equal('invalid');

      var variableMappings = getVariableMappings(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
      expect(variableMappings).to.have.length(1);
      expect(variableMappings[0].sourceExpression).to.equal('foo');
    }));


    it('should fetch the variables attr of a camunda:in mapping of a signal intermediate throw event', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('IntermediateThrowEvent_4');
      selection.select(shape);

      var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
          typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container);

      expect(selectBox.options).to.have.length(1);

      selectBox.options[0].selected = 'selected';
      TestHelper.triggerEvent(selectBox, 'change');

      expect(typeSelectBox.value).to.equal('variables');
    }));


    it('should hide camunda:in details when inOutType have value "All"', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('IntermediateThrowEvent_4');
      selection.select(shape);

      var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
          typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container),
          sourceInput = domQuery('input[id=camunda-variableMapping-source]', propertiesPanel._container),
          targetInput = domQuery('input[id="camunda-variableMapping-target"]', propertiesPanel._container);

      expect(selectBox.options).to.have.length(1);

      selectBox.options[0].selected = 'selected';
      TestHelper.triggerEvent(selectBox, 'change');

      expect(typeSelectBox.value).to.equal('variables');
      expect(sourceInput.parentElement.className).to.contain('bpp-hidden');
      expect(targetInput.parentElement.className).to.contain('bpp-hidden');
    }));


    it('should remove target attribute when inOutType have value "All"', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('IntermediateThrowEvent_1');
      selection.select(shape);

      var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
          typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container),
          businessObject = getBusinessObject(shape),
          signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(businessObject);

      expect(selectBox.options).to.have.length(3);

      selectBox.options[0].selected = 'selected';
      TestHelper.triggerEvent(selectBox, 'change');

      // when
      typeSelectBox.options[2].selected = 'selected';
      TestHelper.triggerEvent(typeSelectBox, 'change');

      // then
      var variablesMappings = getMappingsWithVariablesAttr(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
      expect(variablesMappings[0].target).not.to.exist;
    }));


    it('should remove the variables attr of a camunda:in mapping of a signal intermediate throw event', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('IntermediateThrowEvent_4');

      selection.select(shape);

      var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
          typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container),
          removeButton = domQuery('button[id=cam-extensionElements-remove-variableMapping-in]', propertiesPanel._container),
          businessObject = getBusinessObject(shape),
          signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(businessObject);

      // given
      var variablesMappings = getMappingsWithVariablesAttr(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
      expect(variablesMappings[0].variables).to.equal('all');

      selectBox.options[0].selected = 'selected';
      TestHelper.triggerEvent(selectBox, 'change');

      expect(typeSelectBox.value).to.equal('variables');

      // when
      TestHelper.triggerEvent(removeButton, 'click');

      // then
      variablesMappings = getMappingsWithVariablesAttr(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
      expect(variablesMappings).to.have.length(0);
    }));


    it('should set the variables attr of a camunda:in mapping of a signal intermediate throw event', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('IntermediateThrowEvent_4');

      selection.select(shape);

      var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
          typeSelectBox = domQuery('select[id=camunda-variableMapping-inOutType-select]', propertiesPanel._container),
          addButton = domQuery('button[id=cam-extensionElements-create-variableMapping-in]', propertiesPanel._container),
          businessObject = getBusinessObject(shape),
          signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(businessObject);

      // given
      expect(selectBox).to.have.length(1);

      var variablesMappings = getMappingsWithVariablesAttr(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
      expect(variablesMappings).to.have.length(1);

      // when
      TestHelper.triggerEvent(addButton, 'click');

      // then
      expect(selectBox).to.have.length(2);

      // when
      typeSelectBox.options[2].selected = 'selected';
      TestHelper.triggerEvent(typeSelectBox, 'change');

      // then
      expect(selectBox.textContent).to.contain('all');
      variablesMappings = getMappingsWithVariablesAttr(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
      expect(variablesMappings).to.have.length(2);
    }));


    it('should fetch local variable attribute of camunda:in mapping', inject(function(propertiesPanel, elementRegistry, selection) {

      var shape = elementRegistry.get('IntermediateThrowEvent_5');
      selection.select(shape);

      var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
          checkBox = domQuery('input[id=camunda-variableMapping-local]', propertiesPanel._container);

      selectBox.options[0].selected = 'selected';
      TestHelper.triggerEvent(selectBox, 'change');

      expect(checkBox.checked).to.be.true;
    }));


    it('should add local attribute to camunda:in source mapping', inject(function(propertiesPanel, elementRegistry, selection) {

      var shape = elementRegistry.get('IntermediateThrowEvent_4');
      selection.select(shape);

      var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
          checkBox = domQuery('input[id=camunda-variableMapping-local]', propertiesPanel._container),
          businessObject = getBusinessObject(shape),
          signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(businessObject);

      // given
      selectBox.options[0].selected = 'selected';
      TestHelper.triggerEvent(selectBox, 'change');

      expect(checkBox.checked).to.be.false;

      // when
      TestHelper.triggerEvent(checkBox, 'click');

      // then
      expect(checkBox.checked).to.be.true;

      var variableMappings = getVariableMappings(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
      expect(variableMappings).to.have.length(1);
      expect(variableMappings[0].local).to.be.true;
    }));


    describe('remove local variable attribute of camunda:in mapping', function() {

      var checkBox,
          variablesMappings;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

        var shape = elementRegistry.get('IntermediateThrowEvent_5');
        selection.select(shape);

        var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
            businessObject = getBusinessObject(shape),
            signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(businessObject);

        checkBox = domQuery('input[id=camunda-variableMapping-local]', propertiesPanel._container);

        // select mapping
        selectBox.options[0].selected = 'selected';
        TestHelper.triggerEvent(selectBox, 'change');

        // remove local attribute
        TestHelper.triggerEvent(checkBox, 'click');

        variablesMappings = getMappingsWithVariablesAttr(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
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

  });


  describe('EndEvent', function() {

    it('should fetch camunda:in mapping of a signal end event', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('EndEvent_1');
      selection.select(shape);

      var selectBox = domQuery('select[id=cam-extensionElements-variableMapping-in]', propertiesPanel._container),
          businessObject = getBusinessObject(shape),
          signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(businessObject);

      expect(selectBox.options).to.have.length(3);

      expect(signalEventDefinition.extensionElements).not.to.be.undefined;

      var variableMappings = getVariableMappings(signalEventDefinition.extensionElements, CAMUNDA_IN_EXTENSION_ELEMENT);
      expect(variableMappings).to.have.length(3);
    }));

  });

});
