'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('lib'),
    coreModule = require('bpmn-js/lib/core').default,
    selectionModule = require('diagram-js/lib/features/selection').default,
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    propertiesProviderModule = require('lib/provider/camunda'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var inputOutputHelper = require('lib/helper/InputOutputHelper');

var domQuery = require('min-dom').query,
    domQueryAll = require('min-dom').queryAll,
    domClasses = require('min-dom').classes;

var find = require('lodash/find');


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

      it('should execute', function() {

        // then
        var inputParameters = getInputParameters(bo);
        expect(inputParameters).to.have.lengthOf(3);
        expect(isParameterContainedIn(inputParameters, 'bar1')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'bar2')).to.be.ok;
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        var inputParameters = getInputParameters(bo);
        expect(inputParameters).to.have.lengthOf(2);
        expect(isParameterContainedIn(inputParameters, 'bar1')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'bar2')).to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {

        // when

        commandStack.undo();
        commandStack.redo();

        // then
        var inputParameters = getInputParameters(bo);
        expect(inputParameters).to.have.lengthOf(3);
        expect(isParameterContainedIn(inputParameters, 'bar1')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'bar2')).to.be.ok;
      }));

    });


    describe('in the DOM', function() {

      var collapsibles;

      it('should execute', inject(function(propertiesPanel) {

        // after removing input parameter
        collapsibles = getInputParameterCollapsibles(propertiesPanel._container);

        // then
        expect(collapsibles).to.have.lengthOf(3);
      }));


      it('should undo', inject(function(commandStack, propertiesPanel) {

        // when
        commandStack.undo();
        collapsibles = getInputParameterCollapsibles(propertiesPanel._container);

        // then
        expect(collapsibles).to.have.lengthOf(2);
      }));


      it('should redo', inject(function(commandStack, propertiesPanel) {

        // when
        commandStack.undo();
        commandStack.redo();
        collapsibles = getInputParameterCollapsibles(propertiesPanel._container);

        // then
        expect(collapsibles).to.have.lengthOf(3);
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

      it('should execute', function() {

        // after removing 'dateOfBirth' form field

        // then
        var outputParameters = getOutputParameters(bo);
        expect(outputParameters).to.have.lengthOf(3);
        expect(isParameterContainedIn(outputParameters, 'bar1')).to.be.ok;
        expect(isParameterContainedIn(outputParameters, 'bar2')).to.be.ok;

      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        var outputParameters = getOutputParameters(bo);
        expect(outputParameters).to.have.lengthOf(2);
        expect(isParameterContainedIn(outputParameters, 'bar1')).to.be.ok;
        expect(isParameterContainedIn(outputParameters, 'bar2')).to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {

        // when

        commandStack.undo();
        commandStack.redo();

        // then
        var outputParameters = getOutputParameters(bo);
        expect(outputParameters).to.have.lengthOf(3);
        expect(isParameterContainedIn(outputParameters, 'bar1')).to.be.ok;
        expect(isParameterContainedIn(outputParameters, 'bar2')).to.be.ok;
      }));

    });


    describe('in the DOM', function() {

      var collapsibles;


      it('should execute', inject(function(propertiesPanel) {

        // then
        collapsibles = getOutputParameterCollapsibles(propertiesPanel._container);
        expect(collapsibles).to.have.lengthOf(3);
      }));


      it('should undo', inject(function(commandStack, propertiesPanel) {

        // when
        commandStack.undo();

        // then
        collapsibles = getOutputParameterCollapsibles(propertiesPanel._container);
        expect(collapsibles).to.have.lengthOf(2);
      }));


      it('should redo', inject(function(commandStack, propertiesPanel) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        collapsibles = getOutputParameterCollapsibles(propertiesPanel._container);
        expect(collapsibles).to.have.lengthOf(3);
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
        var inputParameters = getInputParameters(bo);
        expect(inputParameters).to.have.lengthOf(1);
        expect(isParameterContainedIn(inputParameters, 'bar1')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'bar2')).not.to.be.ok;
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        var inputParameters = getInputParameters(bo);
        expect(inputParameters).to.have.lengthOf(2);
        expect(isParameterContainedIn(inputParameters, 'bar1')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'bar2')).to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        var inputParameters = getInputParameters(bo);
        expect(inputParameters).to.have.lengthOf(1);
        expect(isParameterContainedIn(inputParameters, 'bar1')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'bar2')).not.to.be.ok;
      }));

    });


    describe('in the DOM', function() {

      var collapsibles;


      it('should execute', inject(function(propertiesPanel) {

        // after removing input parameter

        // then
        collapsibles = getInputParameterCollapsibles(propertiesPanel._container);

        // then
        expect(collapsibles).to.have.lengthOf(1);
      }));


      it('should undo', inject(function(commandStack, propertiesPanel) {

        // when
        commandStack.undo();

        // then
        collapsibles = getInputParameterCollapsibles(propertiesPanel._container);
        expect(collapsibles).to.have.lengthOf(2);
      }));


      it('should redo', inject(function(commandStack, propertiesPanel) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        collapsibles = getInputParameterCollapsibles(propertiesPanel._container);
        expect(collapsibles).to.have.lengthOf(1);
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

      var collapsibles;


      it('should execute', inject(function(propertiesPanel) {

        // then
        collapsibles = getOutputParameterCollapsibles(propertiesPanel._container);
        expect(collapsibles).to.have.lengthOf(1);
      }));


      it('should undo', inject(function(commandStack, propertiesPanel) {

        // when
        commandStack.undo();

        // then
        collapsibles = getOutputParameterCollapsibles(propertiesPanel._container);
        expect(collapsibles).to.have.lengthOf(2);
      }));


      it('should redo', inject(function(commandStack, propertiesPanel) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        collapsibles = getOutputParameterCollapsibles(propertiesPanel._container);
        expect(collapsibles).to.have.lengthOf(1);
      }));

    });

  });


  describe('change parameter name', function() {

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

      it('should display label', function() {

        // then
        expect(getInputParameterGroupLabel(container).textContent).to.equal('Input Parameters');

      });

    });


    describe('of output parameters', function() {

      it('should display output parameter label', function() {

        // then
        expect(getOutputParameterGroupLabel(container).textContent).to.equal('Output Parameters');

      });

    });

  });

});


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

function getConnectorIdInput(container) {
  return getInputField(container, 'connector-details', 'connectorId');
}

function selectInputParameter(container, index) {
  var collapsibles = getInputParameterCollapsibles(container);
  TestHelper.triggerEvent(collapsibles[index].firstChild, 'click');
}

function getInputParameterCollapsibles(container) {
  return domQueryAll('.bpp-collapsible[data-entry*="input-parameter"]', getInputParametersGroup(container));
}

function clickAddInputParameterButton(container) {
  var addButton = getAddInputParameterButton(container);
  TestHelper.triggerEvent(addButton, 'click');
}

function getAddInputParameterButton(container) {
  return domQuery('[data-entry*="Input-heading"] [data-action="createElement"]', getInputParametersGroup(container));
}

function getInputParametersGroup(container) {
  return domQuery('[data-group*="input"]', getConnectorTab(container));
}

function clickRemoveInputParameterButton(container) {
  var removeButton = getRemoveInputParameterButton(container);
  TestHelper.triggerEvent(removeButton, 'click');
}

function getRemoveInputParameterButton(container) {
  return domQuery('.bpp-collapsible:not(.bpp-collapsible--collapsed) [data-action="onRemove"]', getInputParametersGroup(container));
}

function selectOutputParameter(container, index) {
  var collapsibles = getOutputParameterCollapsibles(container);
  TestHelper.triggerEvent(collapsibles[index].firstChild, 'click');
}

function getOutputParameterCollapsibles(container) {
  return domQueryAll('.bpp-collapsible[data-entry*="output-parameter"]', getOutputParametersGroup(container));
}

function getOutputParametersGroup(container) {
  return domQuery('[data-group*="output"]', getConnectorTab(container));
}

function clickAddOutputParameterButton(container) {
  var addButton = getAddOutputParameterButton(container);
  TestHelper.triggerEvent(addButton, 'click');
}

function getAddOutputParameterButton(container) {
  return domQuery('[data-entry*="Output-heading"] [data-action="createElement"]', getOutputParametersGroup(container));
}

function clickRemoveOutputParameterButton(container) {
  var removeButton = getRemoveOutputParameterButton(container);
  TestHelper.triggerEvent(removeButton, 'click');
}

function getRemoveOutputParameterButton(container) {
  return domQuery('.bpp-collapsible:not(.bpp-collapsible--collapsed) [data-action="onRemove"]', getOutputParametersGroup(container));
}

function getInputParameterGroupLabel(container) {
  var group = getGroup(container, 'connector-input-parameters');
  return domQuery('.group-label', group);
}

function getOutputParameterGroupLabel(container) {
  var group = getGroup(container, 'connector-output-parameters');
  return domQuery('.group-label', group);
}

function getParameterNameInput(container) {
  return domQuery('input[id*="parameterName"]', getInputParametersGroup(container));
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
