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

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var inputOutputHelper = require('../../../../lib/helper/InputOutputHelper');

var domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes');

var find = require('lodash/collection/find');


function getConnectorTab(container) {
  return domQuery('div[data-tab="connector"]', container);
}

function getGroup(container, groupId) {
  var tab = getConnectorTab(container);
  return domQuery('div[data-group="' + groupId + '"]', tab);
}

function getEntry(container, groupId, entryId) {
  return domQuery('div[data-entry="' + entryId + '"]', getGroup(container, groupId));
}

function getInputField(container, groupId, entryId, inputName) {
  var selector = 'input' + (inputName ? '[name="' + inputName + '"]' : '');
  return domQuery(selector, getEntry(container, groupId, entryId));
}

function getSelectField(container, groupId, entryId, selectName) {
  var selector = 'select' + (selectName ? '[name="' + selectName + '"]' : '');
  return domQuery(selector, getEntry(container, groupId, entryId));
}

function getButton(container, groupId, entryId, buttonAction) {
  var entry = getEntry(container, groupId, entryId);
  var selector = 'button' + (buttonAction ? '[data-action="' + buttonAction + '"]' : '');
  return domQuery(selector, entry);
}

function getConnectorIdInput(container) {
  return getInputField(container, 'connector-details', 'connectorId');
}

function getConnectorInputParameterSelect(container) {
  return getSelectField(container, 'connector-input-output', 'connector-inputs');
}

function selectInputParameter(container, idx) {
  var selectBox = getConnectorInputParameterSelect(container);
  selectBox.options[idx].selected = 'selected';
  TestHelper.triggerEvent(selectBox, 'change');
}

function clickAddInputParameterButton(container) {
  var addButton = getButton(container, 'connector-input-output', 'connector-inputs', 'createElement');
  TestHelper.triggerEvent(addButton, 'click');
}

function clickRemoveInputParameterButton(container) {
  var removeButton = getButton(container, 'connector-input-output', 'connector-inputs', 'removeElement');
  TestHelper.triggerEvent(removeButton, 'click');
}

function getConnectorOutputParameterSelect(container) {
  return getSelectField(container, 'connector-input-output', 'connector-outputs');
}

function selectOutputParameter(container, idx) {
  var selectBox = getConnectorOutputParameterSelect(container);
  selectBox.options[idx].selected = 'selected';
  TestHelper.triggerEvent(selectBox, 'change');
}

function clickAddOutputParameterButton(container) {
  var addButton = getButton(container, 'connector-input-output', 'connector-outputs', 'createElement');
  TestHelper.triggerEvent(addButton, 'click');
}

function clickRemoveOutputParameterButton(container) {
  var removeButton = getButton(container, 'connector-input-output', 'connector-outputs', 'removeElement');
  TestHelper.triggerEvent(removeButton, 'click');
}

function getParameterGroupLabel(container) {
  var group = getGroup(container, 'connector-input-output-parameter');
  return domQuery('.group-label', group);
}

function getParameterNameInput(container) {
  return getInputField(container, 'connector-input-output-parameter', 'connector-parameterName');
}

function getConnector(element) {
  return inputOutputHelper.getConnector(element);
}

function getInputParameters(bo) {
  return getConnector(bo).get('inputOutput').get('inputParameters');
}

function getOutputParameters(bo) {
  return getConnector(bo).get('inputOutput').get('outputParameters');
}

function isInputInvalid(node) {
  return domClasses(node).has('invalid');
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

describe('connector', function() {

  var diagramXML = require('./Connector.bpmn');

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

  describe('change connector id', function() {

    var container, connectorIdInput, connector;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
      // given
      container = propertiesPanel._container;

      var shape = elementRegistry.get('WITHOUT_CONNECTOR_ID');

      selection.select(shape);
      connector = getConnector(shape);
      connectorIdInput = getConnectorIdInput(container);

      // assume
      expect(isInputInvalid(connectorIdInput)).to.be.true;

      // when
      TestHelper.triggerValue(connectorIdInput, 'foo', 'change');
    }));


    describe('in the DOM', function() {

      it('should execute', function() {

        // then
        expect(connectorIdInput.value).to.equal('foo');
        expect(isInputInvalid(connectorIdInput)).to.be.false;
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        expect(connectorIdInput.value).to.equal('');
        expect(isInputInvalid(connectorIdInput)).to.be.true;
      }));


      it('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(connectorIdInput.value).to.equal('foo');
        expect(isInputInvalid(connectorIdInput)).to.be.false;
      }));

    });


    describe('on the business object', function() {

      it('should not execute', function() {
        // then
        expect(connector.get('connectorId')).to.equal('foo');
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();
        // then
        expect(connector.get('connectorId')).to.be.undefined;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(connector.get('connectorId')).to.equal('foo');
      }));

    });

  });


  describe('add input/output', function() {

    var container, connector;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
      // given
      container = propertiesPanel._container;
      var shape = elementRegistry.get('WITHOUT_INPUT_OUTPUT');
      selection.select(shape);
      connector = getConnector(shape);

      // assume
      expect(connector.get('inputOutput')).to.be.undefined;

    }));

    describe('when adding an input parameter', function() {

      beforeEach(function() {
        // when
        clickAddInputParameterButton(container);
      });


      it('should execute', function() {

        // then
        var inputOutput = connector.get('inputOutput');
        expect(connector.get('inputOutput')).not.to.be.undefined;
        expect(inputOutput.get('inputParameters')).not.to.be.empty;
        expect(inputOutput.get('outputParameters')).to.be.empty;
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        expect(connector.get('inputOutput')).to.be.undefined;
      }));


      it('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        var inputOutput = connector.get('inputOutput');
        expect(connector.get('inputOutput')).not.to.be.undefined;
        expect(inputOutput.get('inputParameters')).not.to.be.empty;
        expect(inputOutput.get('outputParameters')).to.be.empty;
      }));

    });


    describe('when adding an output parameter', function() {

      beforeEach(function() {
        // when
        clickAddOutputParameterButton(container);
      });

      it('should execute', function() {

        // then
        var inputOutput = connector.get('inputOutput');
        expect(connector.get('inputOutput')).not.to.be.undefined;
        expect(inputOutput.get('inputParameters')).to.be.empty;
        expect(inputOutput.get('outputParameters')).not.to.be.empty;

      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        expect(connector.get('inputOutput')).to.be.undefined;
      }));


      it('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        var inputOutput = connector.get('inputOutput');
        expect(connector.get('inputOutput')).not.to.be.undefined;
        expect(inputOutput.get('inputParameters')).to.be.empty;
        expect(inputOutput.get('outputParameters')).not.to.be.empty;
      }));

    });
  });


  describe('keep input/output', function() {

    var container, connector;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
      // given
      container = propertiesPanel._container;
      var shape = elementRegistry.get('WITH_INPUT_OUTPUT');
      selection.select(shape);
      connector = getConnector(shape);

      // assume
      var inputOutput = connector.get('inputOutput');
      expect(inputOutput).not.to.be.undefined;
      expect(inputOutput.get('inputParameters')).to.be.empty;
      expect(inputOutput.get('outputParameters')).to.be.empty;
    }));


    describe('when adding an input parameter', function() {

      beforeEach(function() {
        // when
        clickAddInputParameterButton(container);
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        var inputOutput = connector.get('inputOutput');
        expect(inputOutput).not.to.be.undefined;
        expect(inputOutput.get('inputParameters')).to.be.empty;
        expect(inputOutput.get('outputParameters')).to.be.empty;
      }));

    });


    describe('when adding an output parameter', function() {

      beforeEach(function() {
        // when
        clickAddOutputParameterButton(container);
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        var inputOutput = connector.get('inputOutput');
        expect(inputOutput).not.to.be.undefined;
        expect(inputOutput.get('inputParameters')).to.be.empty;
        expect(inputOutput.get('outputParameters')).to.be.empty;
      }));

    });

  });


  describe('remove input/output', function() {

    var container, connector;

    describe('when removing an input parameter', function() {

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('WITH_INPUT_PARAMS');
        selection.select(shape);
        connector = getConnector(shape);

        // assume
        var inputOutput = connector.get('inputOutput');
        expect(inputOutput).not.to.be.undefined;
        expect(inputOutput.get('inputParameters')).not.to.be.empty;
        expect(inputOutput.get('outputParameters')).to.be.empty;

        // when
        selectInputParameter(container, 0);
        clickRemoveInputParameterButton(container);
      }));


      it('should execute', function() {
        // then
        expect(connector.get('inputOutput')).to.be.undefined;
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        var inputOutput = connector.get('inputOutput');
        expect(inputOutput).not.to.be.undefined;
        expect(inputOutput.get('inputParameters')).not.to.be.empty;
        expect(inputOutput.get('outputParameters')).to.be.empty;
      }));


      it('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(connector.get('inputOutput')).to.be.undefined;
      }));

    });


    describe('when removing an output parameter', function() {

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
        // given
        container = propertiesPanel._container;
        var shape = elementRegistry.get('WITH_OUTPUT_PARAMS');
        selection.select(shape);
        connector = getConnector(shape);

        // assume
        var inputOutput = connector.get('inputOutput');
        expect(inputOutput).not.to.be.undefined;
        expect(inputOutput.get('inputParameters')).to.be.empty;
        expect(inputOutput.get('outputParameters')).not.to.be.empty;

        // when
        selectOutputParameter(container, 0);
        clickRemoveOutputParameterButton(container);
      }));


      it('should execute', function() {
        // then
        expect(connector.get('inputOutput')).to.be.undefined;
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        var inputOutput = connector.get('inputOutput');
        expect(inputOutput).not.to.be.undefined;
        expect(inputOutput.get('inputParameters')).to.be.empty;
        expect(inputOutput.get('outputParameters')).not.to.be.empty;
      }));


      it('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(connector.get('inputOutput')).to.be.undefined;
      }));

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
        newParameterName = getConnectorInputParameterSelect(propertiesPanel._container).value;
      }));


      it('should execute', function() {
        // after removing 'dateOfBirth' form field

        // then
        expect(getInputParameters(bo).length).to.equal(3);
        expect(isParameterContainedIn(getInputParameters(bo), 'bar1')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'bar2')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), newParameterName)).to.be.ok;

      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(getInputParameters(bo).length).to.equal(2);
        expect(isParameterContainedIn(getInputParameters(bo), 'bar1')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'bar2')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), newParameterName)).not.to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when

        commandStack.undo();
        commandStack.redo();

        // then
        expect(getInputParameters(bo).length).to.equal(3);
        expect(isParameterContainedIn(getInputParameters(bo), 'bar1')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'bar2')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), newParameterName)).to.be.ok;
      }));

    });


    describe('in the DOM', function() {

      var inputSelectBox,
          newParameterName;

      beforeEach(inject(function(propertiesPanel) {
        inputSelectBox = getConnectorInputParameterSelect(propertiesPanel._container);
        newParameterName = getInputParameters(bo)[2].name;
      }));


      it('should execute', function() {
        // after removing input parameter

        // then
        expect(inputSelectBox.options.length).to.equal(3);
        expect(isOptionContainedIn(inputSelectBox, 'bar1')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'bar2')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, newParameterName)).to.be.ok;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(inputSelectBox.options.length).to.equal(2);
        expect(isOptionContainedIn(inputSelectBox, 'bar1')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'bar2')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, newParameterName)).not.to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(inputSelectBox.options.length).to.equal(3);
        expect(isOptionContainedIn(inputSelectBox, 'bar1')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'bar2')).to.be.ok;
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
        newParameterName = getConnectorOutputParameterSelect(propertiesPanel._container).value;
      }));


      it('should execute', function() {
        // after removing 'dateOfBirth' form field

        // then
        expect(getOutputParameters(bo).length).to.equal(3);
        expect(isParameterContainedIn(getOutputParameters(bo), 'bar1')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'bar2')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), newParameterName)).to.be.ok;

      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(getOutputParameters(bo).length).to.equal(2);
        expect(isParameterContainedIn(getOutputParameters(bo), 'bar1')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'bar2')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), newParameterName)).not.to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when

        commandStack.undo();
        commandStack.redo();

        // then
        expect(getOutputParameters(bo).length).to.equal(3);
        expect(isParameterContainedIn(getOutputParameters(bo), 'bar1')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'bar2')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), newParameterName)).to.be.ok;
      }));

    });


    describe('in the DOM', function() {

      var newParameterName,
          outputSelectBox;

      beforeEach(inject(function(propertiesPanel) {
        outputSelectBox = getConnectorOutputParameterSelect(propertiesPanel._container);
        newParameterName = getOutputParameters(bo)[2].name;
      }));


      it('should execute', function() {
        // after removing input parameter

        // then
        expect(outputSelectBox.options.length).to.equal(3);
        expect(isOptionContainedIn(outputSelectBox, 'bar1')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'bar2')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, newParameterName)).to.be.ok;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(outputSelectBox.options.length).to.equal(2);
        expect(isOptionContainedIn(outputSelectBox, 'bar1')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'bar2')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, newParameterName)).not.to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(outputSelectBox.options.length).to.equal(3);
        expect(isOptionContainedIn(outputSelectBox, 'bar1')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'bar2')).to.be.ok;
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

      selectInputParameter(container, 1);

      // when
      clickRemoveInputParameterButton(container);

    }));


    describe('on the business object', function() {

      it('should execute', function() {
        // after removing 'dateOfBirth' form field

        // then
        expect(getInputParameters(bo).length).to.equal(1);
        expect(isParameterContainedIn(getInputParameters(bo), 'bar1')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'bar2')).not.to.be.ok;

      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(getInputParameters(bo).length).to.equal(2);
        expect(isParameterContainedIn(getInputParameters(bo), 'bar1')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'bar2')).to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when

        commandStack.undo();
        commandStack.redo();

        // then
        expect(getInputParameters(bo).length).to.equal(1);
        expect(isParameterContainedIn(getInputParameters(bo), 'bar1')).to.be.ok;
        expect(isParameterContainedIn(getInputParameters(bo), 'bar2')).not.to.be.ok;
      }));

    });


    describe('in the DOM', function() {

      var inputSelectBox;

      beforeEach(inject(function(propertiesPanel) {
        inputSelectBox = getConnectorInputParameterSelect(propertiesPanel._container);
      }));


      it('should execute', function() {
        // after removing input parameter

        // then
        expect(inputSelectBox.options.length).to.equal(1);
        expect(isOptionContainedIn(inputSelectBox, 'bar1')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'bar2')).not.to.be.ok;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(inputSelectBox.options.length).to.equal(2);
        expect(isOptionContainedIn(inputSelectBox, 'bar1')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'bar2')).to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(inputSelectBox.options.length).to.equal(1);
        expect(isOptionContainedIn(inputSelectBox, 'bar1')).to.be.ok;
        expect(isOptionContainedIn(inputSelectBox, 'bar2')).not.to.be.ok;
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

      selectOutputParameter(container, 1);

      // when
      clickRemoveOutputParameterButton(container);

    }));


    describe('on the business object', function() {

      it('should execute', function() {
        // after removing 'dateOfBirth' form field

        // then
        expect(getOutputParameters(bo).length).to.equal(1);
        expect(isParameterContainedIn(getOutputParameters(bo), 'bar1')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'bar2')).not.to.be.ok;

      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(getOutputParameters(bo).length).to.equal(2);
        expect(isParameterContainedIn(getOutputParameters(bo), 'bar1')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'bar2')).to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when

        commandStack.undo();
        commandStack.redo();

        // then
        expect(getOutputParameters(bo).length).to.equal(1);
        expect(isParameterContainedIn(getOutputParameters(bo), 'bar1')).to.be.ok;
        expect(isParameterContainedIn(getOutputParameters(bo), 'bar2')).not.to.be.ok;
      }));

    });


    describe('in the DOM', function() {

      var outputSelectBox;

      beforeEach(inject(function(propertiesPanel) {
        outputSelectBox = getConnectorOutputParameterSelect(propertiesPanel._container);
      }));


      it('should execute', function() {
        // after removing input parameter

        // then
        expect(outputSelectBox.options.length).to.equal(1);
        expect(isOptionContainedIn(outputSelectBox, 'bar1')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'bar2')).not.to.be.ok;
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(outputSelectBox.options.length).to.equal(2);
        expect(isOptionContainedIn(outputSelectBox, 'bar1')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'bar2')).to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(outputSelectBox.options.length).to.equal(1);
        expect(isOptionContainedIn(outputSelectBox, 'bar1')).to.be.ok;
        expect(isOptionContainedIn(outputSelectBox, 'bar2')).not.to.be.ok;
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
      selectInputParameter(container, 0);

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
        expect(parameterNameInput.value).to.equal('bar1');
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
        expect(parameter.name).to.equal('bar1');
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
        selectInputParameter(container, 0);

        // then
        expect(getParameterGroupLabel(container).textContent).to.equal('Input Parameter');

      });

    });


    describe('of output parameters', function() {

      it('should display output parameter label', function() {

        // when
        selectOutputParameter(container, 0);

        // then
        expect(getParameterGroupLabel(container).textContent).to.equal('Output Parameter');

      });

    });

  });

});