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

var domClasses = require('min-dom').classes,
    domQuery = require('min-dom').query;


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

function getAutosuggestList(container) {
  return domQuery('.bpp-autosuggest-list', getInputOutputTab(container));
}

function isActive(element) {
  return domClasses(element).has('active');
}

function getCursorPosition() {
  var selection = document.getSelection(),
      range = selection.getRangeAt(0);

  return range.startOffset;
}

// property controls

function getInputOutputTab(container) {
  return domQuery('div[data-tab="input-output"]', container);
}

function getParameterTypeSelect(container) {
  return domQuery('select[id="camunda-parameterType-select"]', getInputOutputTab(container));
}

function getParameterTextValue(container) {
  return domQuery('div[id="camunda-parameterType-text"]', getInputOutputTab(container));
}

// helper

function getSelect(suffix, container) {
  return domQuery('select[id="cam-extensionElements-' + suffix + '"]', getInputOutputTab(container));
}


describe('input-output-parameterType-text', function() {

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


  describe('change parameter type text ', function(propertiesPanel) {

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

    describe('to script', function() {

      beforeEach(function() {

        // when
        parameterTypeSelect.options[1].selected = 'selected';
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
          expect(parameterTypeSelect.value).to.equal('text');
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
          expect(parameter.value).to.equal('hello world!');
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
        parameterTypeSelect.options[2].selected = 'selected';
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
          expect(parameterTypeSelect.value).to.equal('text');
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
          expect(parameter.value).to.equal('hello world!');
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
        parameterTypeSelect.options[3].selected = 'selected';
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
          expect(parameterTypeSelect.value).to.equal('text');
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
          expect(parameter.value).to.equal('hello world!');
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


  describe('change parameter value', function(propertiesPanel) {

    var parameterValueInput,
        parameter;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      var container = propertiesPanel._container;

      var shape = elementRegistry.get('WITH_INPUT_OUTPUT_PARAMS');
      selection.select(shape);

      // select first parameter
      selectInputParameter(0, container);

      parameterValueInput = getParameterTextValue(container);
      parameter = getInputParameters(getBusinessObject(shape))[0];

      // when
      TestHelper.triggerValue(parameterValueInput, 'foo', 'change');

    }));

    describe('in the DOM', function() {

      it('should execute', function() {

        // then
        expect(parameterValueInput.textContent).to.equal('foo');
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        expect(parameterValueInput.textContent).to.equal('hello world!');
      }));


      it('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(parameterValueInput.textContent).to.equal('foo');
      }));

    });


    describe('on the business object', function() {

      it('should execute', function() {

        // then
        expect(parameter.value).to.equal('foo');
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(parameter.value).to.equal('hello world!');
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(parameter.value).to.equal('foo');
      }));

    });

  });


  describe('auto suggest process variables', function() {

    var parameterValueInput,
        autoSuggestList,
        changeInputValue,
        parameter,
        shape;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
      var container = propertiesPanel._container;

      shape = elementRegistry.get('WITH_INPUT_OUTPUT_PARAMS');
      selection.select(shape);

      // select first parameter
      selectInputParameter(0, container);

      parameterValueInput = getParameterTextValue(container);
      autoSuggestList = getAutosuggestList(container);
      parameter = getInputParameters(getBusinessObject(shape))[0];

      changeInputValue = function(value, cursorPosition) {
        cursorPosition = cursorPosition || value.length;
        TestHelper.triggerValue(parameterValueInput, value, 'input', cursorPosition);
      };
    }));


    it('should show list of available process variables', function() {

      // given
      var newInputValue = '${output}';

      // when
      changeInputValue(newInputValue, 6);

      // then
      expect(isActive(autoSuggestList)).to.be.true;
      expect(autoSuggestList.childNodes.length).to.be.above(0);
    });


    it('should NOT show suggestions if no matches', function() {

      // given
      var newInputValue = '${fooBar}';

      // when
      changeInputValue(newInputValue, 6);

      // then
      expect(isActive(autoSuggestList)).to.be.false;
    });


    it('should NOT show suggestions if outside expression clauses', function() {

      // given
      var newInputValue = '${output}';

      // when
      changeInputValue(newInputValue);

      // then
      expect(isActive(autoSuggestList)).to.be.false;
    });


    it('should show suggestions when inside starting expression clause', function() {

      // given
      var newInputValue = '${output';

      // when
      changeInputValue(newInputValue);

      // then
      expect(isActive(autoSuggestList)).to.be.true;
      expect(autoSuggestList.childNodes.length).to.be.above(0);
    });


    it.skip('should hide suggestions on blur', function() {

      // given
      var newInputValue = '${output}';

      changeInputValue(newInputValue, 6);


      // assure
      expect(isActive(autoSuggestList)).to.be.true;

      // when

      // todo(pinussilvestrus): <blur> handler not called
      parameterValueInput.blur();

      // then
      expect(isActive(autoSuggestList)).to.be.false;
    });


    describe('in the DOM', function() {

      beforeEach(function() {

        // given
        var newInputValue = '${output}';
        changeInputValue(newInputValue, 6);

        // assure
        expect(isActive(autoSuggestList)).to.be.true;

        var firstItem = autoSuggestList.childNodes[0];

        // when
        TestHelper.triggerEvent(firstItem, 'click');

        // since the input event is debounced by 300ms, we should
        // not wait and handle this change accordingly
        TestHelper.triggerEvent(parameterValueInput, 'change');
      });

      it('should update value when select variable', function() {

        // then
        expect(parameterValueInput.textContent).to.equal('${output1}');
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        expect(parameterValueInput.textContent).to.equal('hello world!');
      }));


      it('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(parameterValueInput.textContent).to.equal('${output1}');
      }));


      it('should set cursor after inserted suggestion', function() {

        var cursorPosition = getCursorPosition(),
            value = parameterValueInput.textContent;

        // then
        // before closing bracket
        expect(cursorPosition).to.equal(value.length - 1);
      });

    });


    describe('in the business object', function() {

      beforeEach(function() {

        // given
        var newInputValue = '${output}';
        changeInputValue(newInputValue, 6);

        // assure
        expect(isActive(autoSuggestList)).to.be.true;

        var firstItem = autoSuggestList.childNodes[0];

        // when
        TestHelper.triggerEvent(firstItem, 'click');

        // since the input event is debounced by 300ms, we should
        // not wait and handle this change accordingly
        TestHelper.triggerEvent(parameterValueInput, 'change');
      });

      it('should update value when select variable', function() {

        // then
        expect(parameter.value).to.equal('${output1}');
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        expect(parameter.value).to.equal('hello world!');
      }));


      it('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(parameter.value).to.equal('${output1}');
      }));

    });

  });

});
