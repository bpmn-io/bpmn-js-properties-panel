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

var domQuery = require('min-dom').query;


// MODEL HELPER

function getElements(bo, type, prop) {
  var elems = extensionElementsHelper.getExtensionElements(bo, type) || [];
  return !prop ? elems : (elems[0] || {})[prop] || [];
}

function getInputParameters(bo) {
  return getParameters(bo, 'inputParameters');
}

function getParameters(bo, prop) {
  return getElements(bo, 'camunda:InputOutput', prop);
}

// DOM HELPER

// input parameter

function getInputParameterSelect(container) {
  return getSelect('inputs', container);
}

function selectInputParameter(idx, container) {
  var selectBox = getInputParameterSelect(container);
  selectBox.options[idx].selected = 'selected';
  TestHelper.triggerEvent(selectBox, 'change');
}

// property controls

function getInputOutputTab(container) {
  return domQuery('div[data-tab="input-output"]', container);
}

function getParameterTypeSelect(container) {
  return domQuery('select[id="camunda-parameterType-select"]', getInputOutputTab(container));
}

function getParameterVariableValue(container) {
  return domQuery('input[id="camunda-parameterType-variable"]', getInputOutputTab(container));
}

function getParameterExpressionValue(container) {
  return domQuery('textarea[id="camunda-parameterType-expression"]', getInputOutputTab(container));
}

// helper

function getSelect(suffix, container) {
  return domQuery('select[id="cam-extensionElements-' + suffix + '"]', getInputOutputTab(container));
}


describe('input-output-parameterType-variable', function() {

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


  describe('change parameter type variable', function() {

    var parameter,
        parameterTypeSelect;


    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      var container = propertiesPanel._container;

      var shape = elementRegistry.get('WITH_INPUT_OUTPUT_PARAMS');
      selection.select(shape);

      // select first parameter
      selectInputParameter(0, container);

      parameter = getInputParameters(getBusinessObject(shape))[0];
      parameterTypeSelect = getParameterTypeSelect(container);

    }));


    describe('to constant value', function() {

      beforeEach(function() {

        // when
        parameterTypeSelect.options[1].selected = 'selected';
        TestHelper.triggerEvent(parameterTypeSelect, 'change');

      });

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(parameterTypeSelect.value).to.equal('constant-value');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(parameterTypeSelect.value).to.equal('variable');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(parameterTypeSelect.value).to.equal('constant-value');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          expect(parameter.value).to.be.undefined;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(parameter.value).to.equal('${foo}');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(parameter.value).to.be.undefined;
        }));

      });

    });


    describe('to expression', function() {

      beforeEach(function() {

        // when
        parameterTypeSelect.options[2].selected = 'selected';
        TestHelper.triggerEvent(parameterTypeSelect, 'change');

      });

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(parameterTypeSelect.value).to.equal('expression');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(parameterTypeSelect.value).to.equal('variable');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(parameterTypeSelect.value).to.equal('expression');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          expect(parameter.value).to.be.undefined;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(parameter.value).to.equal('${foo}');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(parameter.value).to.be.undefined;
        }));

      });

    });


    describe('to script', function() {

      beforeEach(function() {

        // when
        parameterTypeSelect.options[3].selected = 'selected';
        TestHelper.triggerEvent(parameterTypeSelect, 'change');

      });

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(parameterTypeSelect.value).to.equal('script');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(parameterTypeSelect.value).to.equal('variable');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(parameterTypeSelect.value).to.equal('script');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          expect(parameter.value).to.be.undefined;
          expect(is(parameter.definition, 'camunda:Script')).to.be.true;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(parameter.value).to.equal('${foo}');
          expect(parameter.definition).to.be.undefined;
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(parameter.value).to.be.undefined;
          expect(is(parameter.definition, 'camunda:Script')).to.be.true;
        }));

      });

    });


    describe('to list', function() {

      beforeEach(function() {

        // when
        parameterTypeSelect.options[4].selected = 'selected';
        TestHelper.triggerEvent(parameterTypeSelect, 'change');

      });

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(parameterTypeSelect.value).to.equal('list');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(parameterTypeSelect.value).to.equal('variable');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(parameterTypeSelect.value).to.equal('list');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {

          // then
          expect(parameter.value).to.be.undefined;
          expect(is(parameter.definition, 'camunda:List')).to.be.true;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(parameter.value).to.equal('${foo}');
          expect(parameter.definition).to.be.undefined;
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(parameter.value).to.be.undefined;
          expect(is(parameter.definition, 'camunda:List')).to.be.true;
        }));

      });

    });


    describe('to map', function() {

      beforeEach(function() {

        // when
        parameterTypeSelect.options[5].selected = 'selected';
        TestHelper.triggerEvent(parameterTypeSelect, 'change');

      });

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(parameterTypeSelect.value).to.equal('map');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(parameterTypeSelect.value).to.equal('variable');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(parameterTypeSelect.value).to.equal('map');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {

          // then
          expect(parameter.value).to.be.undefined;
          expect(is(parameter.definition, 'camunda:Map')).to.be.true;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(parameter.value).to.equal('${foo}');
          expect(parameter.definition).to.be.undefined;
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(parameter.value).to.be.undefined;
          expect(is(parameter.definition, 'camunda:Map')).to.be.true;
        }));

      });

    });

  });


  describe('change parameter value', function() {

    var parameterVariableInput,
        parameterExpressionInput,
        parameter,
        parameterTypeSelect;

    describe('keep as variable', function() {

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

        // given
        var container = propertiesPanel._container;

        var shape = elementRegistry.get('WITH_INPUT_OUTPUT_PARAMS');
        selection.select(shape);

        // select first parameter
        selectInputParameter(0, container);

        parameterVariableInput = getParameterVariableValue(container);
        parameter = getInputParameters(getBusinessObject(shape))[0];
        parameterTypeSelect = getParameterTypeSelect(container);

        // when
        TestHelper.triggerValue(parameterVariableInput, 'bar', 'change');

      }));

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(parameterVariableInput.value).to.equal('bar');
          expect(parameterTypeSelect.value).to.equal('variable');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(parameterVariableInput.value).to.equal('foo');
          expect(parameterTypeSelect.value).to.equal('variable');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(parameterVariableInput.value).to.equal('bar');
          expect(parameterTypeSelect.value).to.equal('variable');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          expect(parameter.value).to.equal('${bar}');
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(parameter.value).to.equal('${foo}');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(parameter.value).to.equal('${bar}');
        }));

      });

    });


    describe('to expression', function() {

      beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

        // given
        var container = propertiesPanel._container;

        var shape = elementRegistry.get('WITH_INPUT_OUTPUT_PARAMS');
        selection.select(shape);

        // select first parameter
        selectInputParameter(0, container);

        parameterVariableInput = getParameterVariableValue(container);
        parameter = getInputParameters(getBusinessObject(shape))[0];
        parameterTypeSelect = getParameterTypeSelect(container);
        parameterExpressionInput = getParameterExpressionValue(container);

        // when
        TestHelper.triggerValue(parameterVariableInput, '${foo.bar()}', 'change');

      }));

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          // automatically change to parameter type <expression>
          expect(parameterTypeSelect.value).to.equal('expression');
          expect(parameterExpressionInput.value).to.equal('${foo.bar()}');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(parameterVariableInput.value).to.equal('foo');
          expect(parameterTypeSelect.value).to.equal('variable');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(parameterTypeSelect.value).to.equal('expression');
          expect(parameterExpressionInput.value).to.equal('${foo.bar()}');
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {

          // then
          expect(parameter.value).to.equal('${foo.bar()}');
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(parameter.value).to.equal('${foo}');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(parameter.value).to.equal('${foo.bar()}');
        }));

      });

    });

  });

});
