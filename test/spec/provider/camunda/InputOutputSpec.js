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
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  find = require('lodash/collection/find'),
  forEach = require('lodash/collection/forEach');

describe('input-output-parameter-properties', function() {

  var diagramXML = require('./InputOutput.bpmn');

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

  function getInputParameters(extensionElements) {
    var parameters = [];
    if (!!extensionElements && !!extensionElements.values) {
      var inputOutput = find(extensionElements.values, function(value) {
        return is(value, 'camunda:InputOutput');
      });
      if (inputOutput) {
        forEach(inputOutput.inputParameters, function(param) {
          parameters.push(param);
        });        
      }
    }
    return parameters;
  }

  function getOutputParameters(extensionElements) {
    var parameters = [];
    if (!!extensionElements && !!extensionElements.values) {
      var inputOutput = find(extensionElements.values, function(value) {
        return is(value, 'camunda:InputOutput');
      });
      if (inputOutput) {
        forEach(inputOutput.outputParameters, function(param) {
          parameters.push(param);
        });        
      }
    }
    return parameters;
  }


  it('should display an empty input parameters selection box',
    inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('Without_Input_Output');

    // when
    selection.select(shape);

    // then
    var inputsSelection = domQuery('select[id=cam-extension-elements-inputs]', propertiesPanel._container);

    expect(inputsSelection.options.length).to.equal(0);
  }));


  it('should display an empty output parameters selection box',
    inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('Without_Input_Output');

    // when
    selection.select(shape);

    // then
    var outputsSelection = domQuery('select[id=cam-extension-elements-outputs]', propertiesPanel._container);

    expect(outputsSelection.options.length).to.equal(0);
  }));


  it('should add a new input parameter',
      inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('Without_Input_Output');
    selection.select(shape);

    var bo = getBusinessObject(shape);

    var addInputParameterButton = domQuery('div[id=cam-extension-elements-inputs] button[id=newElementAction]', propertiesPanel._container);

    // when
    TestHelper.triggerEvent(addInputParameterButton, 'click');

    // then
    var inputsSelection     = domQuery('select[id=cam-extension-elements-inputs]', propertiesPanel._container),
        parameterNameInput  = domQuery('input[id=camunda-parameter-name]', propertiesPanel._container),
        parameterTypeSelect = domQuery('select[id=camunda-parameter-type]', propertiesPanel._container),
        parameterTextValue  = domQuery('textarea[id=camunda-parameter-value]', propertiesPanel._container);

    expect(inputsSelection.options.length).to.equal(1);
    expect(inputsSelection.options[0].selected).to.equal(true);
    expect(parameterNameInput.value).to.equal(inputsSelection.value);
    expect(parameterTypeSelect.value).to.equal('text');
    expect(parameterTextValue.value).to.equal('');

    var parameters = getInputParameters(bo.extensionElements);
    expect(parameters.length).to.equal(1);
  }));


  it('should undo adding an input parameter',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    // given
    var shape = elementRegistry.get('Without_Input_Output');
    selection.select(shape);

    var addInputParameterButton = domQuery('div[id=cam-extension-elements-inputs] button[id=newElementAction]', propertiesPanel._container);
    TestHelper.triggerEvent(addInputParameterButton, 'click');

    var bo = getBusinessObject(shape);
    var parameters = getInputParameters(bo.extensionElements);

    // assume
    var inputsSelection = domQuery('select[id=cam-extension-elements-inputs]', propertiesPanel._container);
    expect(inputsSelection.options.length).to.equal(1);
    expect(parameters.length).to.equal(1);

    // when
    commandStack.undo();

    // then
    expect(inputsSelection.options.length).to.equal(0);

    parameters = getInputParameters(bo.extensionElements);
    expect(parameters.length).to.equal(0);
  }));


  it('should add a new output parameter',
      inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('Without_Input_Output');
    selection.select(shape);

    var bo = getBusinessObject(shape);

    var addOutputParameterButton = domQuery('div[id=cam-extension-elements-outputs] button[id=newElementAction]', propertiesPanel._container);

    // when
    TestHelper.triggerEvent(addOutputParameterButton, 'click');

    // then
    var outputsSelection    = domQuery('select[id=cam-extension-elements-outputs]', propertiesPanel._container),
        parameterNameInput  = domQuery('input[id=camunda-parameter-name]', propertiesPanel._container),
        parameterTypeSelect = domQuery('select[id=camunda-parameter-type]', propertiesPanel._container),
        parameterTextValue  = domQuery('textarea[id=camunda-parameter-value]', propertiesPanel._container);

    expect(outputsSelection.options.length).to.equal(1);
    expect(outputsSelection.options[0].selected).to.equal(true);
    expect(parameterNameInput.value).to.equal(outputsSelection.value);
    expect(parameterTypeSelect.value).to.equal('text');
    expect(parameterTextValue.value).to.equal('');

    var parameters = getOutputParameters(bo.extensionElements);
    expect(parameters.length).to.equal(1);
  }));


  it('should undo adding an output parameter',
      inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    // given
    var shape = elementRegistry.get('Without_Input_Output');
    selection.select(shape);

    var addOutputParameterButton = domQuery('div[id=cam-extension-elements-outputs] button[id=newElementAction]', propertiesPanel._container);
    TestHelper.triggerEvent(addOutputParameterButton, 'click');

    var bo = getBusinessObject(shape);
    var parameters = getOutputParameters(bo.extensionElements);

    // assume
    var outputsSelection = domQuery('select[id=cam-extension-elements-outputs]', propertiesPanel._container);
    expect(outputsSelection.options.length).to.equal(1);
    expect(parameters.length).to.equal(1);

    // when
    commandStack.undo();

    // then
    expect(outputsSelection.options.length).to.equal(0);

    parameters = getOutputParameters(bo.extensionElements);
    expect(parameters.length).to.equal(0);
  }));

});
