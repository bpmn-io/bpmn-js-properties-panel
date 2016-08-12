'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule  = require('../../../../lib'),
    coreModule               = require('bpmn-js/lib/core'),
    selectionModule          = require('diagram-js/lib/features/selection'),
    modelingModule           = require('bpmn-js/lib/features/modeling'),
    propertiesProviderModule = require('../../../../lib/provider/camunda'),
    camundaModdlePackage     = require('camunda-bpmn-moddle/resources/camunda');

var ModelUtil         = require('bpmn-js/lib/util/ModelUtil'),
    is                = ModelUtil.is,
    getBusinessObject = ModelUtil.getBusinessObject;

var extensionElementsHelper = require('../../../../lib/helper/ExtensionElementsHelper');

var domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes');

var find    = require('lodash/collection/find');

// MODEL HELPER

function getElements(bo, type, prop) {
  var elems = extensionElementsHelper.getExtensionElements(bo, type) || [];
  return !prop ? elems : (elems[0] || {})[prop] || [];
}

function getInputOutput(bo) {
  return getElements(bo, 'camunda:InputOutput')[0];
}

function getInputParameters(bo) {
  return getParameters(bo, 'inputParameters');
}

function getOutputParameters(bo) {
  return getParameters(bo, 'outputParameters');
}

function getParameters(bo, prop) {
  return getElements(bo, 'camunda:InputOutput', prop);
}

// DOM HELPER

// input parameter

function getInputParameterSelect(container) {
  return getSelect('inputs', container);
}

function getAddInputParameterButton(container) {
  return getAddButton('inputs', container);
}

function clickAddInputParameterButton(container) {
  var addButton = getAddInputParameterButton(container);
  TestHelper.triggerEvent(addButton, 'click');
}

function getRemoveInputParameterButton(container) {
  return getRemoveButton('inputs', container);
}

function clickRemoveInputParameterButton(container) {
  var removeButton = getRemoveInputParameterButton(container);
  TestHelper.triggerEvent(removeButton, 'click');
}

function selectInputParameter(idx, container) {
  var selectBox = getInputParameterSelect(container);
  selectBox.options[idx].selected = 'selected';
  TestHelper.triggerEvent(selectBox, 'change');
}

// output parameter

function getOutputParameterSelect(container) {
  return getSelect('outputs', container);
}

function getAddOutputParameterButton(container) {
  return getAddButton('outputs', container);
}

function clickAddOutputParameterButton(container) {
  var addButton = getAddOutputParameterButton(container);
  TestHelper.triggerEvent(addButton, 'click');
}

function getRemoveOutputParameterButton(container) {
  return getRemoveButton('outputs', container);
}

function clickRemoveOutputParameterButton(container) {
  var removeButton = getRemoveOutputParameterButton(container);
  TestHelper.triggerEvent(removeButton, 'click');
}

function selectOutputParameter(idx, container) {
  var selectBox = getOutputParameterSelect(container);
  selectBox.options[idx].selected = 'selected';
  TestHelper.triggerEvent(selectBox, 'change');
}

// property controls

function getInputOutputTab(container) {
  return domQuery('div[data-tab="input-output"]', container);
}

function getParameterGroupLabel(container) {
  return domQuery('div[data-group="input-output-parameter"] .group-label', getInputOutputTab(container));
}

function getParameterNameInput(container) {
  return domQuery('input[id="camunda-parameterName"]', getInputOutputTab(container));
}

function getParameterTypeSelect(container) {
  return domQuery('select[id="camunda-parameterType-select"]', getInputOutputTab(container));
}

function getParameterTextValue(container) {
  return domQuery('div[id="camunda-parameterType-text"]', getInputOutputTab(container));
}

function getScriptEntry(container) {
  return domQuery('div[data-entry="parameterType-script"] > div', getInputOutputTab(container));
}

function getListAddRowDiv(container) {
  return domQuery('div[data-entry="parameterType-list"] > div.bpp-table-add-row', getInputOutputTab(container));
}

function getListTable(container) {
  return domQuery('div[data-entry="parameterType-list"] > div.bpp-table', getInputOutputTab(container));
}

function getListRows(container) {
  var table = getListTable(container);
  return domQuery.all('div[data-list-entry-container] > div', table);
}

function getListInput(idx, container) {
  var table = getListTable(container);
  return domQuery('div[data-index="' + idx + '"] > input', table);
}

function getMapAddRowDiv(container) {
  return domQuery('div[data-entry="parameterType-map"] > div', getInputOutputTab(container));
}

function getMapTable(container) {
  return domQuery('div[data-entry="parameterType-map"] > div.bpp-table', getInputOutputTab(container));
}

function getMapRows(container) {
  var table = getMapTable(container);
  return domQuery.all('div[data-list-entry-container] > div', table);
}

function getMapInput(idx, column, container) {
  var table = getMapTable(container);
  return domQuery('div[data-index="' + idx + '"] > input[name="' + column + '"]', table);
}

// helper

function getSelect(suffix, container) {
  return domQuery('select[id="cam-extensionElements-' + suffix + '"]', getInputOutputTab(container));
}

function getAddButton(suffix, container) {
  return domQuery('button[id="cam-extensionElements-create-' + suffix + '"]', getInputOutputTab(container));
}

function getRemoveButton(suffix, container) {
  return domQuery('button[id="cam-extensionElements-remove-' + suffix + '"]', getInputOutputTab(container));
}

function isParameterContainedIn(params, value) {
  return find(params, function(param) {
    return param.name === value;
  });
}

function isOptionContainedIn(selectBox, value) {
  return find(selectBox, function(node) {
    return node.value === value;
  });
}

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


  it('should fetch empty list of input and output parameters', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('WITHOUT_INPUT_OUTPUT');
    var bo = getBusinessObject(shape);

    // assume
    expect(getInputParameters(bo).length).to.equal(0);
    expect(getOutputParameters(bo).length).to.equal(0);

    // when
    selection.select(shape);

    // then
    var inputsSelection = getInputParameterSelect(propertiesPanel._container);
    expect(inputsSelection.options.length).to.equal(0);

    var outputsSelection = getOutputParameterSelect(propertiesPanel._container);
    expect(outputsSelection.options.length).to.equal(0);
  }));


  it('should fetch list of input parameters', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('WITH_INPUT_PARAMS');
    var bo = getBusinessObject(shape);

    // assume
    expect(getInputParameters(bo).length).to.equal(4);

    // when
    selection.select(shape);

    // then
    var inputsSelection = getInputParameterSelect(propertiesPanel._container);
    expect(inputsSelection.options.length).to.equal(4);
  }));


  it('should fetch list of output parameters', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('WITH_OUTPUT_PARAMS');
    var bo = getBusinessObject(shape);

    // assume
    expect(getOutputParameters(bo).length).to.equal(4);

    // when
    selection.select(shape);

    // then
    var outputsSelection = getOutputParameterSelect(propertiesPanel._container);
    expect(outputsSelection.options.length).to.equal(4);
  }));


  it('should fetch list of input and output parameters', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('WITH_INPUT_OUTPUT_PARAMS');
    var bo = getBusinessObject(shape);

    // assume
    expect(getInputParameters(bo).length).to.equal(4);
    expect(getOutputParameters(bo).length).to.equal(4);

    // when
    selection.select(shape);

    // then
    var inputsSelection = getInputParameterSelect(propertiesPanel._container);
    expect(inputsSelection.options.length).to.equal(4);

    var outputsSelection = getOutputParameterSelect(propertiesPanel._container);
    expect(outputsSelection.options.length).to.equal(4);
  }));


  it('should display type info in select box', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('WITH_INPUT_OUTPUT_PARAMS');

    // when
    selection.select(shape);

    // then
    var inputOptions = getInputParameterSelect(propertiesPanel._container).options;
    expect(inputOptions[0].text).to.equal('input1 : Text');
    expect(inputOptions[1].text).to.equal('input2 : Script');
    expect(inputOptions[2].text).to.equal('input3 : List');
    expect(inputOptions[3].text).to.equal('input4 : Map');

    var outputOptions = getOutputParameterSelect(propertiesPanel._container).options;
    expect(outputOptions[0].text).to.equal('output1 : Text');
    expect(outputOptions[1].text).to.equal('output2 : Script');
    expect(outputOptions[2].text).to.equal('output3 : List');
    expect(outputOptions[3].text).to.equal('output4 : Map');
  }));

  describe('property controls', function() {

    var container;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      container = propertiesPanel._container;
      var shape = elementRegistry.get('WITH_INPUT_OUTPUT_PARAMS');
      selection.select(shape);

    }));

    describe('of input parameters', function() {

      it('should display input parameter label', function() {

        // when
        selectInputParameter(0, container);

        // then
        expect(getParameterGroupLabel(container).textContent).to.equal('Input Parameter');

      });


      it('should fetch text properties', function() {

        // when
        selectInputParameter(0, container);

        // then
        expect(getParameterNameInput(container).value).to.equal('input1');
        expect(getParameterTypeSelect(container).value).to.equal('text');
        expect(getParameterTextValue(container).textContent).to.equal('hello world!');

        // hidden entries

        expect(getScriptEntry(container).className).to.contains('bpp-hidden');

        expect(getListAddRowDiv(container).className).to.contains('bpp-hidden');
        expect(getListTable(container).className).to.contains('bpp-hidden');

        expect(getMapAddRowDiv(container).className).to.contains('bpp-hidden');
        expect(getMapTable(container).className).to.contains('bpp-hidden');

      });


      it('should fetch script properties', function() {

        // when
        selectInputParameter(1, container);

        // then
        expect(getParameterNameInput(container).value).to.equal('input2');
        expect(getParameterTypeSelect(container).value).to.equal('script');

        var scriptFormat = domQuery('div[data-tab="input-output"] input[name=scriptFormat]', container),
            scriptType   = domQuery('div[data-tab="input-output"] select[name="scriptType"]', container),
            scriptValue  = domQuery('div[data-tab="input-output"] textarea[name="scriptValue"]', container);

        expect(scriptFormat.value).to.equal('javascript');
        expect(scriptType.value).to.equal('script');
        expect(scriptValue.value).to.equal('var foo = \'bar\';');

        // hidden entries

        expect(getParameterTextValue(container).parentNode.className).to.contains('bpp-hidden');

        expect(getListAddRowDiv(container).className).to.contains('bpp-hidden');
        expect(getListTable(container).className).to.contains('bpp-hidden');

        expect(getMapAddRowDiv(container).className).to.contains('bpp-hidden');
        expect(getMapTable(container).className).to.contains('bpp-hidden');

      });


      it('should fetch list properties', function() {

        // when
        selectInputParameter(2, container);

        // then
        expect(getParameterNameInput(container).value).to.equal('input3');
        expect(getParameterTypeSelect(container).value).to.equal('list');

        expect(getListAddRowDiv(container).className).not.to.contains('bpp-hidden');
        expect(getListTable(container).className).not.to.contains('bpp-hidden');

        expect(getListRows(container).length).to.equal(1);
        expect(getListInput(0, container).value).to.equal('item1');

        // hidden entries

        expect(getParameterTextValue(container).parentNode.className).to.contains('bpp-hidden');

        expect(getScriptEntry(container).className).to.contains('bpp-hidden');

        expect(getMapAddRowDiv(container).className).to.contains('bpp-hidden');
        expect(getMapTable(container).className).to.contains('bpp-hidden');

      });


      it('should fetch map properties', function() {

        // when
        selectInputParameter(3, container);

        // then
        expect(getParameterNameInput(container).value).to.equal('input4');
        expect(getParameterTypeSelect(container).value).to.equal('map');

        expect(getMapAddRowDiv(container).className).not.to.contains('bpp-hidden');
        expect(getMapTable(container).className).not.to.contains('bpp-hidden');

        expect(getMapRows(container).length).to.equal(1);
        expect(getMapInput(0, 'key', container).value).to.equal('entryKey1');
        expect(getMapInput(0, 'value', container).value).to.equal('entryValue1');

        // hidden entries

        expect(getParameterTextValue(container).parentNode.className).to.contains('bpp-hidden');

        expect(getScriptEntry(container).className).to.contains('bpp-hidden');

        expect(getListAddRowDiv(container).className).to.contains('bpp-hidden');
        expect(getListTable(container).className).to.contains('bpp-hidden');

      });

    });


    describe('of output parameters', function() {

      it('should display output parameter label', function() {

        // when
        selectOutputParameter(0, container);

        // then
        expect(getParameterGroupLabel(container).textContent).to.equal('Output Parameter');

      });


      it('should fetch text properties', function() {

        // when
        selectOutputParameter(0, container);

        // then
        expect(getParameterNameInput(container).value).to.equal('output1');
        expect(getParameterTypeSelect(container).value).to.equal('text');
        expect(getParameterTextValue(container).textContent).to.equal('hello world!');

        // hidden entries

        expect(getScriptEntry(container).className).to.contains('bpp-hidden');

        expect(getListAddRowDiv(container).className).to.contains('bpp-hidden');
        expect(getListTable(container).className).to.contains('bpp-hidden');

        expect(getMapAddRowDiv(container).className).to.contains('bpp-hidden');
        expect(getMapTable(container).className).to.contains('bpp-hidden');

      });


      it('should fetch script properties', function() {

        // when
        selectOutputParameter(1, container);

        // then
        expect(getParameterNameInput(container).value).to.equal('output2');
        expect(getParameterTypeSelect(container).value).to.equal('script');

        var scriptFormat = domQuery('div[data-tab="input-output"] input[name=scriptFormat]', container),
            scriptType   = domQuery('div[data-tab="input-output"] select[name="scriptType"]', container),
            scriptValue  = domQuery('div[data-tab="input-output"] textarea[name="scriptValue"]', container);

        expect(scriptFormat.value).to.equal('javascript');
        expect(scriptType.value).to.equal('script');
        expect(scriptValue.value).to.equal('var foo = \'bar\';');

        // hidden entries

        expect(getParameterTextValue(container).parentNode.className).to.contains('bpp-hidden');

        expect(getListAddRowDiv(container).className).to.contains('bpp-hidden');
        expect(getListTable(container).className).to.contains('bpp-hidden');

        expect(getMapAddRowDiv(container).className).to.contains('bpp-hidden');
        expect(getMapTable(container).className).to.contains('bpp-hidden');

      });


      it('should fetch list properties', function() {

        // when
        selectOutputParameter(2, container);

        // then
        expect(getParameterNameInput(container).value).to.equal('output3');
        expect(getParameterTypeSelect(container).value).to.equal('list');

        expect(getListAddRowDiv(container).className).not.to.contains('bpp-hidden');
        expect(getListTable(container).className).not.to.contains('bpp-hidden');

        expect(getListRows(container).length).to.equal(1);
        expect(getListInput(0, container).value).to.equal('item1');

        // hidden entries

        expect(getParameterTextValue(container).parentNode.className).to.contains('bpp-hidden');

        expect(getScriptEntry(container).className).to.contains('bpp-hidden');

        expect(getMapAddRowDiv(container).className).to.contains('bpp-hidden');
        expect(getMapTable(container).className).to.contains('bpp-hidden');

      });


      it('should fetch map properties', function() {

        // when
        selectOutputParameter(3, container);

        // then
        expect(getParameterNameInput(container).value).to.equal('output4');
        expect(getParameterTypeSelect(container).value).to.equal('map');

        expect(getMapAddRowDiv(container).className).not.to.contains('bpp-hidden');
        expect(getMapTable(container).className).not.to.contains('bpp-hidden');

        expect(getMapRows(container).length).to.equal(1);
        expect(getMapInput(0, 'key', container).value).to.equal('entryKey1');
        expect(getMapInput(0, 'value', container).value).to.equal('entryValue1');

        // hidden entries

        expect(getParameterTextValue(container).parentNode.className).to.contains('bpp-hidden');

        expect(getScriptEntry(container).className).to.contains('bpp-hidden');

        expect(getListAddRowDiv(container).className).to.contains('bpp-hidden');
        expect(getListTable(container).className).to.contains('bpp-hidden');

      });

    });

  });

  describe('selection', function() {

    var container;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      container = propertiesPanel._container;

      var shape = elementRegistry.get('WITH_INPUT_OUTPUT_PARAMS');
      selection.select(shape);
    }));


    it('should nothing be selected', function() {

      // then
      expect(getInputParameterSelect(container).selectedIndex).to.equal(-1);
      expect(getOutputParameterSelect(container).selectedIndex).to.equal(-1);
    });


    describe('input parameter', function() {

      beforeEach(function() {

        // given
        selectInputParameter(2, container);

        // assume
        expect(getInputParameterSelect(container).selectedIndex).to.equal(2);
      });


      it('should deselect input parameter', function() {

        // when
        selectOutputParameter(2, container);

        // then
        expect(getInputParameterSelect(container).selectedIndex).to.equal(-1);
        expect(getOutputParameterSelect(container).selectedIndex).to.equal(2);
      });


      it('should deselect input parameter when adding an output parameter', function() {

        // when
        clickAddOutputParameterButton(container);

        // then
        expect(getInputParameterSelect(container).selectedIndex).to.equal(-1);
        expect(getOutputParameterSelect(container).selectedIndex).to.equal(4);
      });

    });


    describe('output parameter', function() {

      beforeEach(function() {

        // given
        selectOutputParameter(2, container);

        // assume
        expect(getOutputParameterSelect(container).selectedIndex).to.equal(2);
      });


      it('should deselect output parameter', function() {

        // when
        selectInputParameter(2, container);

        // then
        expect(getInputParameterSelect(container).selectedIndex).to.equal(2);
        expect(getOutputParameterSelect(container).selectedIndex).to.equal(-1);
      });


      it('should deselect output parameter when adding an input parameter', function() {

        // when
        clickAddInputParameterButton(container);

        // then
        expect(getInputParameterSelect(container).selectedIndex).to.equal(4);
        expect(getOutputParameterSelect(container).selectedIndex).to.equal(-1);
      });

    });

  });


  describe('add input parameter', function() {

    var bo;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      var container = propertiesPanel._container;

      var shape = elementRegistry.get('WITH_INPUT_OUTPUT_PARAMS');
      selection.select(shape);

      bo = getBusinessObject(shape);

      // when
      clickAddInputParameterButton(container);

    }));


    describe('on the business object', function() {

      var newParameterName;

      beforeEach(inject(function(propertiesPanel) {
        newParameterName = getInputParameterSelect(propertiesPanel._container).value;
      }));


      it('should execute', function() {
        // after removing 'dateOfBirth' form field

        // then
        expect(getInputParameters(bo).length).to.equal(5);
        expect(isParameterContainedIn(getInputParameters(bo), 'input1')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'input2')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'input3')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'input4')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), newParameterName)).to.be.ok;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(getInputParameters(bo).length).to.equal(4);
        expect(isParameterContainedIn(getInputParameters(bo), 'input1')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'input2')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'input3')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'input4')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), newParameterName)).not.to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(getInputParameters(bo).length).to.equal(5);
        expect(isParameterContainedIn(getInputParameters(bo), 'input1')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'input2')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'input3')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'input4')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), newParameterName)).to.be.ok;
      }));

    });


    describe('in the DOM', function() {

      var inputSelectBox,
          newParameterName;

      beforeEach(inject(function(propertiesPanel) {
        inputSelectBox = getInputParameterSelect(propertiesPanel._container);
        newParameterName = getInputParameters(bo)[4].name;
      }));


      it('should execute', function() {
        // after removing input parameter

        // then
        expect(inputSelectBox.options.length).to.equal(5);
        expect(isOptionContainedIn(inputSelectBox, 'input1')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'input2')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'input3')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'input4')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, newParameterName)).to.be.ok;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(inputSelectBox.options.length).to.equal(4);
        expect(isOptionContainedIn(inputSelectBox, 'input1')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'input2')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'input3')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'input4')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, newParameterName)).not.to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(inputSelectBox.options.length).to.equal(5);
        expect(isOptionContainedIn(inputSelectBox, 'input1')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'input2')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'input3')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'input4')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, newParameterName)).to.be.ok;
      }));

    });

  });


  describe('add output parameter', function() {

    var bo;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      var container = propertiesPanel._container;

      var shape = elementRegistry.get('WITH_INPUT_OUTPUT_PARAMS');
      selection.select(shape);

      bo = getBusinessObject(shape);

      // when
      clickAddOutputParameterButton(container);
    }));


    describe('on the business object', function() {

      var newParameterName;

      beforeEach(inject(function(propertiesPanel) {
        newParameterName = getOutputParameterSelect(propertiesPanel._container).value;
      }));


      it('should execute', function() {
        // after removing 'dateOfBirth' form field

        // then
        expect(getOutputParameters(bo).length).to.equal(5);
        expect(isParameterContainedIn(getOutputParameters(bo), 'output1')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'output2')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'output3')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'output4')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), newParameterName)).to.be.ok;

      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(getOutputParameters(bo).length).to.equal(4);
        expect(isParameterContainedIn(getOutputParameters(bo), 'output1')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'output2')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'output3')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'output4')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), newParameterName)).not.to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when

        commandStack.undo();
        commandStack.redo();

        // then
        expect(getOutputParameters(bo).length).to.equal(5);
        expect(isParameterContainedIn(getOutputParameters(bo), 'output1')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'output2')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'output3')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'output4')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), newParameterName)).to.be.ok;
      }));

    });


    describe('in the DOM', function() {

      var newParameterName,
          outputSelectBox;

      beforeEach(inject(function(propertiesPanel) {
        outputSelectBox = getOutputParameterSelect(propertiesPanel._container);
        newParameterName = getOutputParameters(bo)[4].name;
      }));


      it('should execute', function() {
        // after removing input parameter

        // then
        expect(outputSelectBox.options.length).to.equal(5);
        expect(isOptionContainedIn(outputSelectBox, 'output1')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'output2')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'output3')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'output4')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, newParameterName)).to.be.ok;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(outputSelectBox.options.length).to.equal(4);
        expect(isOptionContainedIn(outputSelectBox, 'output1')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'output2')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'output3')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'output4')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, newParameterName)).not.to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(outputSelectBox.options.length).to.equal(5);
        expect(isOptionContainedIn(outputSelectBox, 'output1')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'output2')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'output3')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'output4')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, newParameterName)).to.be.ok;
      }));

    });

  });


  describe('delete input parameter', function() {

    var bo;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      var container = propertiesPanel._container;

      var shape = elementRegistry.get('WITH_INPUT_OUTPUT_PARAMS');
      selection.select(shape);

      bo = getBusinessObject(shape);

      selectInputParameter(3, container);

      // when
      clickRemoveInputParameterButton(container);

    }));


    describe('on the business object', function() {

      it('should execute', function() {
        // after removing 'dateOfBirth' form field

        // then
        expect(getInputParameters(bo).length).to.equal(3);
        expect(isParameterContainedIn(getInputParameters(bo), 'input1')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'input2')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'input3')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'input4')).not.to.be.ok;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(getInputParameters(bo).length).to.equal(4);
        expect(isParameterContainedIn(getInputParameters(bo), 'input1')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'input2')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'input3')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'input4')).to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when

        commandStack.undo();
        commandStack.redo();

        // then
        expect(getInputParameters(bo).length).to.equal(3);
        expect(isParameterContainedIn(getInputParameters(bo), 'input1')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'input2')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'input3')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'input4')).not.to.be.ok;
      }));

    });


    describe('in the DOM', function() {

      var inputSelectBox;

      beforeEach(inject(function(propertiesPanel) {
        inputSelectBox = getInputParameterSelect(propertiesPanel._container);
      }));


      it('should execute', function() {
        // after removing input parameter

        // then
        expect(inputSelectBox.options.length).to.equal(3);
        expect(isOptionContainedIn(inputSelectBox, 'input1')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'input2')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'input3')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'input4')).not.to.be.ok;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(inputSelectBox.options.length).to.equal(4);
        expect(isOptionContainedIn(inputSelectBox, 'input1')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'input2')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'input3')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'input4')).to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(inputSelectBox.options.length).to.equal(3);
        expect(isOptionContainedIn(inputSelectBox, 'input1')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'input2')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'input3')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'input4')).not.to.be.ok;
      }));

    });

  });


  describe('delete output parameter', function() {

    var bo;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      var container = propertiesPanel._container;

      var shape = elementRegistry.get('WITH_INPUT_OUTPUT_PARAMS');
      selection.select(shape);

      bo = getBusinessObject(shape);

      selectOutputParameter(3, container);

      // when
      clickRemoveOutputParameterButton(container);

    }));


    describe('on the business object', function() {

      it('should execute', function() {
        // after removing 'dateOfBirth' form field

        // then
        expect(getOutputParameters(bo).length).to.equal(3);
        expect(isParameterContainedIn(getOutputParameters(bo), 'output1')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'output2')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'output3')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'output4')).not.to.be.ok;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(getOutputParameters(bo).length).to.equal(4);
        expect(isParameterContainedIn(getOutputParameters(bo), 'output1')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'output2')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'output3')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'output4')).to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when

        commandStack.undo();
        commandStack.redo();

        // then
        expect(getOutputParameters(bo).length).to.equal(3);
        expect(isParameterContainedIn(getOutputParameters(bo), 'output1')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'output2')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'output3')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'output4')).not.to.be.ok;
      }));

    });


    describe('in the DOM', function() {

      var outputSelectBox;

      beforeEach(inject(function(propertiesPanel) {
        outputSelectBox = getOutputParameterSelect(propertiesPanel._container);
      }));


      it('should execute', function() {
        // after removing input parameter

        // then
        expect(outputSelectBox.options.length).to.equal(3);
        expect(isOptionContainedIn(outputSelectBox, 'output1')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'output2')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'output3')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'output4')).not.to.be.ok;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(outputSelectBox.options.length).to.equal(4);
        expect(isOptionContainedIn(outputSelectBox, 'output1')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'output2')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'output3')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'output4')).to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(outputSelectBox.options.length).to.equal(3);
        expect(isOptionContainedIn(outputSelectBox, 'output1')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'output2')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'output3')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'output4')).not.to.be.ok;
      }));

    });

  });


  describe('set invalid parameter name', function(propertiesPanel) {

    var parameterNameInput,
        parameter;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      var container = propertiesPanel._container;

      var shape = elementRegistry.get('WITH_INPUT_OUTPUT_PARAMS');
      selection.select(shape);

      // select first parameter
      selectInputParameter(0, container);

      parameterNameInput = getParameterNameInput(container);
      parameter = getInputParameters(getBusinessObject(shape))[0];

      // when
      TestHelper.triggerValue(parameterNameInput, 'invalid id', 'change');

    }));


    describe('in the DOM', function() {

      it('should execute', function() {

        // then

        // should show the invalid id in the text field
        expect(parameterNameInput.value).to.equal('invalid id');

        // should show an invalid error
        expect(domClasses(parameterNameInput).has('invalid')).to.be.true;
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then

        // should show the previous id in the text field
        expect(parameterNameInput.value).to.equal('input1');

        // should not show an invalid error
        expect(domClasses(parameterNameInput).has('invalid')).to.be.false;
      }));


      it.skip('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        // cannot redo to invalid state
        expect(parameterNameInput.value).to.equal('input1');
        expect(domClasses(parameterNameInput).has('invalid')).to.be.false;
      }));

    });


    describe('on the business object', function() {

      it('should not execute', function() {

        // then
        // should not set an invalid id on the business object
        expect(parameter.name).to.equal('input1');
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        // should not set an invalid id on the business object
        expect(parameter.name).to.equal('input1');
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        // should not set an invalid id on the business object
        expect(parameter.name).to.equal('input1');
      }));

    });

  });


  describe('change parameter name', function(propertiesPanel) {

    var parameterNameInput,
        parameter;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      var container = propertiesPanel._container;

      var shape = elementRegistry.get('WITH_INPUT_OUTPUT_PARAMS');
      selection.select(shape);

      // select first parameter
      selectInputParameter(0, container);

      parameterNameInput = getParameterNameInput(container);
      parameter = getInputParameters(getBusinessObject(shape))[0];

      // when
      TestHelper.triggerValue(parameterNameInput, 'foo', 'change');
    }));


    describe('in the DOM', function() {

      it('should execute', function() {

        // then
        expect(parameterNameInput.value).to.equal('foo');
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        expect(parameterNameInput.value).to.equal('input1');
      }));


      it('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(parameterNameInput.value).to.equal('foo');
      }));

    });

    describe('on the business object', function() {

      it('should execute', function() {

        // then
        expect(parameter.name).to.equal('foo');
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(parameter.name).to.equal('input1');
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(parameter.name).to.equal('foo');
      }));

    });

  });


  describe('input output element', function() {

    describe('create', function(elementRegistry, selection) {

      var bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

        // given
        var shape = elementRegistry.get('WITHOUT_INPUT_OUTPUT');
        selection.select(shape);

        bo = getBusinessObject(shape);

        // assume
        expect(getInputOutput(bo)).to.be.undefined;

        // when
        clickAddInputParameterButton(propertiesPanel._container);
      }));

      it('should execute', function() {

        // then
        expect(getInputOutput(bo)).to.exist;

      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        expect(getInputOutput(bo)).to.be.undefined;

      }));

      it('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(getInputOutput(bo)).to.exist;

      }));

    });

    describe('remove', function(elementRegistry, selection) {

      var bo;

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

        // given
        var container = propertiesPanel._container;

        var shape = elementRegistry.get('WITH_INPUT_PARAMS');
        selection.select(shape);

        bo = getBusinessObject(shape);

        // assume
        expect(getInputOutput(bo)).to.exist;

        // when
        selectInputParameter(0, container);
        clickRemoveInputParameterButton(container);
        selectInputParameter(0, container);
        clickRemoveInputParameterButton(container);
        selectInputParameter(0, container);
        clickRemoveInputParameterButton(container);
        selectInputParameter(0, container);
        clickRemoveInputParameterButton(container);
      }));


      it('should execute', function() {

        // then
        expect(getInputOutput(bo)).to.be.undefined;

      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        expect(getInputOutput(bo)).to.exist;

      }));

      it('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(getInputOutput(bo)).to.be.undefined;

      }));


      it('should retain other extension elements', function() {

        // then
        expect(bo.extensionElements).to.exist;
        expect(is(bo.extensionElements.values[0], 'camunda:ExecutionListener')).to.be.true;

      });

    });

  });

});
