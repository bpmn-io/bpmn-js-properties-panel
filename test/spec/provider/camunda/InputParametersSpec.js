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

var ModelUtil = require('bpmn-js/lib/util/ModelUtil'),
    is = ModelUtil.is,
    getBusinessObject = ModelUtil.getBusinessObject;

var extensionElementsHelper = require('lib/helper/ExtensionElementsHelper');

var domQuery = require('min-dom').query,
    domQueryAll = require('min-dom').queryAll,
    domClasses = require('min-dom').classes;

var find = require('lodash/find'),
    filter = require('lodash/filter');


describe('input-parameters', function() {

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


  beforeEach(inject(function(propertiesPanel) {
    propertiesPanel.attachTo(container);
  }));


  describe('rendering', function() {

    it('should fetch empty list of input parameters', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('WITHOUT_INPUT_OUTPUT');
      var bo = getBusinessObject(shape);

      // assume
      expect(getInputParameters(bo).length).to.equal(0);

      // when
      selection.select(shape);

      // then
      var collapsibles = getInputParameterCollapsibles(propertiesPanel._container);
      expect(collapsibles).to.have.lengthOf(0);
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
      var collapsibles = getInputParameterCollapsibles(propertiesPanel._container);
      expect(collapsibles).to.have.lengthOf(4);
    }));


    it('should close input parameter if another is opened', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('WITH_INPUT_PARAMS');
      selection.select(shape);

      // when
      var collapsibles = getInputParameterCollapsibles(propertiesPanel._container);
      selectInputParameter(container, 0);
      selectInputParameter(container, 1);

      // then
      var open = filter(collapsibles, function(collapsible) {
        return !collapsible.classList.contains('bpp-collapsible--collapsed');
      });
      expect(open).to.have.lengthOf(1);
    }));
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

        // after removing 'dateOfBirth' form field

        // then
        var inputParameters = getInputParameters(bo);
        expect(inputParameters).to.have.lengthOf(5);
        expect(isParameterContainedIn(inputParameters, 'input1')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'input2')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'input3')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'input4')).to.be.ok;
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        var inputParameters = getInputParameters(bo);
        expect(inputParameters).to.have.lengthOf(4);
        expect(isParameterContainedIn(inputParameters, 'input1')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'input2')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'input3')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'input4')).to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        var inputParameters = getInputParameters(bo);
        expect(inputParameters).to.have.lengthOf(5);
        expect(isParameterContainedIn(inputParameters, 'input1')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'input2')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'input3')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'input4')).to.be.ok;
      }));


      it('should add parameter on top', function() {

        // then
        var inputParameters = getInputParameters(bo);
        expect(inputParameters).to.have.lengthOf(5);
        expect(inputParameters[1].name).to.eql('input1');
      });

    });


    describe('in the DOM', function() {

      var collapsibles;


      it('should execute', inject(function(propertiesPanel) {

        // after removing input parameter
        collapsibles = getInputParameterCollapsibles(propertiesPanel._container);

        // then
        expect(collapsibles).to.have.lengthOf(5);
      }));


      it('should undo', inject(function(commandStack, propertiesPanel) {

        // when
        commandStack.undo();
        collapsibles = getInputParameterCollapsibles(propertiesPanel._container);

        // then
        expect(collapsibles).to.have.lengthOf(4);
      }));


      it('should redo', inject(function(commandStack, propertiesPanel) {

        // when
        commandStack.undo();
        commandStack.redo();
        collapsibles = getInputParameterCollapsibles(propertiesPanel._container);

        // then
        expect(collapsibles).to.have.lengthOf(5);
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

      selectInputParameter(container, 3);

      // when
      clickRemoveInputParameterButton(container);

    }));


    describe('on the business object', function() {

      it('should execute', function() {

        // after removing 'dateOfBirth' form field

        // then
        var inputParameters = getInputParameters(bo);
        expect(inputParameters).to.have.lengthOf(3);
        expect(isParameterContainedIn(inputParameters, 'input1')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'input2')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'input3')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'input4')).not.to.be.ok;
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        var inputParameters = getInputParameters(bo);
        expect(inputParameters).to.have.lengthOf(4);
        expect(isParameterContainedIn(inputParameters, 'input1')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'input2')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'input3')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'input4')).to.be.ok;
      }));


      it('should redo', inject(function(commandStack) {

        // when

        commandStack.undo();
        commandStack.redo();

        // then
        var inputParameters = getInputParameters(bo);
        expect(inputParameters).to.have.lengthOf(3);
        expect(isParameterContainedIn(inputParameters, 'input1')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'input2')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'input3')).to.be.ok;
        expect(isParameterContainedIn(inputParameters, 'input4')).not.to.be.ok;
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
        expect(collapsibles).to.have.lengthOf(4);
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


  describe('set invalid parameter name', function() {

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


      it('should redo', inject(function(commandStack) {

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

    describe('create', function() {

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

    describe('remove', function() {

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
        selectInputParameter(container, 0);
        clickRemoveInputParameterButton(container);
        selectInputParameter(container, 0);
        clickRemoveInputParameterButton(container);
        selectInputParameter(container, 0);
        clickRemoveInputParameterButton(container);
        selectInputParameter(container, 0);
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


// MODEL HELPER

function getElements(bo, type, prop) {
  var elems = extensionElementsHelper.getExtensionElements(bo, type);
  return !prop ? elems : (elems[0] || {})[prop] || [];
}

function getInputOutput(bo) {
  return getElements(bo, 'camunda:InputOutput')[0];
}

function getInputParameters(bo) {
  return getParameters(bo, 'inputParameters');
}

function getParameters(bo, prop) {
  return getElements(bo, 'camunda:InputOutput', prop);
}

// DOM HELPER

// input parameter

function getInputParameterCollapsibles(container) {
  return domQueryAll('.bpp-collapsible[data-entry*="input-parameter"]', getInputParametersGroup(container));
}

function getAddInputParameterButton(container) {
  return domQuery('[data-entry*="Input-heading"] [data-action="createElement"]', getInputParametersGroup(container));
}

function clickAddInputParameterButton(container) {
  var addButton = getAddInputParameterButton(container);
  TestHelper.triggerEvent(addButton, 'click');
}

function clickRemoveInputParameterButton(container) {
  var removeButton = getRemoveInputParameterButton(container);
  TestHelper.triggerEvent(removeButton, 'click');
}

function getRemoveInputParameterButton(container) {
  return domQuery('.bpp-collapsible:not(.bpp-collapsible--collapsed) [data-action="onRemove"]', getInputParametersGroup(container));
}

function selectInputParameter(container, index) {
  var collapsibles = getInputParameterCollapsibles(container);
  TestHelper.triggerEvent(collapsibles[index].firstChild, 'click');
}


// property controls
function getInputParametersGroup(container) {
  return domQuery('[data-group*="input"]', getInputOutputTab(container));
}

function getInputOutputTab(container) {
  return domQuery('div[data-tab="input-output"]', container);
}

function getParameterNameInput(container) {
  return domQuery('input[id*="parameterName"]', getInputParametersGroup(container));
}

// helper

function isParameterContainedIn(params, value) {
  return find(params, function(param) {
    return param.name === value;
  });
}
