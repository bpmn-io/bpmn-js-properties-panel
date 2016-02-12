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

var domQuery = require('min-dom/lib/query');

var find    = require('lodash/collection/find'),
    forEach = require('lodash/collection/forEach');

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

function getParameterLabel(container) {
  return domQuery('label[data-value="label"]', container);
}

function getParameterNameInput(container) {
  return domQuery('input[id="camunda-parameter-name"]', container);
}

function getParameterTypeSelect(container) {
  return domQuery('select[id="camunda-parameter-type"]', container);
}

function getParameterTextValue(container) {
  return domQuery('textarea[id="camunda-parameter-type-text"]', container);
}

function getScriptEntry(container) {
  return domQuery('div[data-entry="parameter-type-script"] > div', container);
}

function getListAddRowDiv(container) {
  return domQuery('div[data-entry="parameter-type-list"] > div.pp-table-add-row', container);
}

function getListTable(container) {
  return domQuery('div[data-entry="parameter-type-list"] > div.pp-table', container);
}

function getListRows(container) {
  var table = getListTable(container);
  return domQuery.all('div[data-list-entry-container] > div', table);
}

function getListInput(idx, container) {
  var table = getListTable(container);
  return domQuery('div[data-index="' + idx + '"] > input', table);
}

function clickAddValueButton(container) {
  var addButton = domQuery('button.add', getListAddRowDiv(container));
  TestHelper.triggerEvent(addButton, 'click');
}

function clickRemoveValueButton(idx, container) {
  var removeButton = domQuery('div[data-index="' + idx + '"] > button', getListTable(container));
  TestHelper.triggerEvent(removeButton, 'click');
}

function getMapAddRowDiv(container) {
  return domQuery('div[data-entry="parameter-type-map"] > div', container);
}

function getMapTable(container) {
  return domQuery('div[data-entry="parameter-type-map"] > div.pp-table', container);
}

function getMapRows(container) {
  var table = getMapTable(container);
  return domQuery.all('div[data-list-entry-container] > div', table);
}

function getMapInput(idx, column, container) {
  var table = getMapTable(container);
  return domQuery('div[data-index="' + idx + '"] > input[name="' + column + '"]', table);
}

function clickAddEntryButton(container) {
  var addButton = domQuery('button', getMapAddRowDiv(container));
  TestHelper.triggerEvent(addButton, 'click');
}

function clickRemoveEntryButton(idx, container) {
  var removeButton = domQuery('div[data-index="' + idx + '"] > button', getMapTable(container));
  TestHelper.triggerEvent(removeButton, 'click');
}

// helper

function getSelect(suffix, container) {
  return domQuery('select[id="cam-extension-elements-' + suffix + '"]', container);
}

function getAddButton(suffix, container) {
  return domQuery('button[id="cam-extension-elements-create-' + suffix + '"]', container);
}

function getRemoveButton(suffix, container) {
  return domQuery('button[id="cam-extension-elements-remove-' + suffix + '"]', container);
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

describe('input-output-parameter-type-list', function() {

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


  describe('change parameter type list ', function(propertiesPanel) {

    var parameter,
        parameterTypeSelect;


    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      var container = propertiesPanel._container;

      var shape = elementRegistry.get('WITH_INPUT_OUTPUT_PARAMS');
      selection.select(shape);

      // select first parameter
      selectInputParameter(2, container);

      parameter = getInputParameters(getBusinessObject(shape))[2];
      parameterTypeSelect = getParameterTypeSelect(container);

    }));

    describe('to text', function() {

      beforeEach(function() {

        // when
        parameterTypeSelect.options[0].selected  = 'selected';
        TestHelper.triggerEvent(parameterTypeSelect, 'change');

      });

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(parameterTypeSelect.value).to.equal('text');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(parameterTypeSelect.value).to.equal('list');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(parameterTypeSelect.value).to.equal('text');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {

          // then
          expect(parameter.value).to.be.undefined;
          expect(parameter.definition).to.be.undefined;
        });


        it('should undo', inject(function(commandStack) {
          
          // when
          commandStack.undo();

          // then
          expect(parameter.value).to.be.undefined;
          expect(is(parameter.definition, 'camunda:List')).to.be.true;
        }));


        it('should redo', inject(function(commandStack) {
          
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(parameter.value).to.be.undefined;
          expect(parameter.definition).to.be.undefined;
        }));

      });

    });

    describe('to script', function() {

      beforeEach(function() {

        // when
        parameterTypeSelect.options[1].selected  = 'selected';
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
          expect(parameterTypeSelect.value).to.equal('list');
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
          expect(parameter.value).to.be.undefined;
          expect(is(parameter.definition, 'camunda:List')).to.be.true;
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

    describe('to map', function() {

      beforeEach(function() {

        // when
        parameterTypeSelect.options[3].selected  = 'selected';
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
          expect(parameterTypeSelect.value).to.equal('list');
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
          expect(parameter.value).to.be.undefined;
          expect(is(parameter.definition, 'camunda:List')).to.be.true;
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


  describe('change parameter list', function(propertiesPanel) {

    var parameter,
        definition;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      var container = propertiesPanel._container;

      var shape = elementRegistry.get('WITH_INPUT_OUTPUT_PARAMS');
      selection.select(shape);

      selectInputParameter(2, container);

      parameter = getInputParameters(getBusinessObject(shape))[2];
      definition = parameter.definition;

    }));

    describe('add value', function() {

      var container;

      beforeEach(inject(function(propertiesPanel) {

        container = propertiesPanel._container;

        // when
        clickAddValueButton(container);
      }));

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(getListRows(container).length).to.equal(2);
          expect(getListInput(0, container).value).to.equal('item1');
          expect(getListInput(1, container).value).to.equal('');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(getListRows(container).length).to.equal(1);
          expect(getListInput(0, container).value).to.equal('item1');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(getListRows(container).length).to.equal(2);
          expect(getListInput(0, container).value).to.equal('item1');
          expect(getListInput(1, container).value).to.equal('');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {

          // then
          expect(definition.items.length).to.equal(2);
          expect(definition.items[0].value).to.equal('item1');
          expect(definition.items[1].value).to.be.undefined;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(definition.items.length).to.equal(1);
          expect(definition.items[0].value).to.equal('item1');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(definition.items.length).to.equal(2);
          expect(definition.items[0].value).to.equal('item1');
          expect(definition.items[1].value).to.be.undefined;
        }));

      });

    });


    describe('remove value', function() {

      var container;

      beforeEach(inject(function(propertiesPanel) {

        container = propertiesPanel._container;

        // when
        clickRemoveValueButton(0, propertiesPanel._container);
      }));

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(getListRows(container).length).to.equal(0);
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(getListRows(container).length).to.equal(1);
          expect(getListInput(0, container).value).to.equal('item1');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(getListRows(container).length).to.equal(0);
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {

          // then
          expect(definition.items.length).to.equal(0);
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(definition.items.length).to.equal(1);
          expect(definition.items[0].value).to.equal('item1');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(definition.items.length).to.equal(0);
        }));

      });

    });


    describe('change value', function() {

      var container,
          input;

      beforeEach(inject(function(propertiesPanel) {

        container = propertiesPanel._container;
        input = getListInput(0, container);

        // when
        TestHelper.triggerValue(input, 'foo', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(input.value).to.equal('foo');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(input.value).to.equal('item1');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(input.value).to.equal('foo');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {

          // then
          expect(definition.items[0].value).to.equal('foo');
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(definition.items[0].value).to.equal('item1');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(definition.items[0].value).to.equal('foo');
        }));

      });

    });

  });

  describe('not editible values', function() {

    var container;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {

      // given
      container = propertiesPanel._container;

      var shape = elementRegistry.get('MAP_LIST_INPUT');
      selection.select(shape);

      // when
      selectInputParameter(0, container);

    }));

    it('should not be possible to edit a script value', function() {

      // then
      expect(getListInput(0, container).value).to.equal('Script');
      expect(getListInput(0, container).hasAttribute('disabled')).to.be.ok;
      expect(getListInput(0, container).hasAttribute('readonly')).to.be.ok;
    });


    it('should not be possible to edit a map value', function() {

      // then
      expect(getListInput(1, container).value).to.equal('List');
      expect(getListInput(1, container).hasAttribute('disabled')).to.be.ok;
      expect(getListInput(1, container).hasAttribute('readonly')).to.be.ok;
    });


    it('should not be possible to edit a list value', function() {

      // then
      expect(getListInput(2, container).value).to.equal('Map');
      expect(getListInput(2, container).hasAttribute('disabled')).to.be.ok;
      expect(getListInput(2, container).hasAttribute('readonly')).to.be.ok;
    });

  });

});
