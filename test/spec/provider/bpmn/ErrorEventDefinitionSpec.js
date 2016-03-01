'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
    domQuery = require('min-dom/lib/query'),
    domClasses = require('min-dom/lib/classes'),
    coreModule = require('bpmn-js/lib/core'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    propertiesProviderModule = require('../../../../lib/provider/bpmn'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    find = require('lodash/collection/find'),
    eventDefinitionHelper = require('../../../../lib/helper/EventDefinitionHelper');

function getGeneralTab(container) {
  return domQuery('div[data-tab="general"]', container);
}

function getDetailsGroup(container) {
  var tab = getGeneralTab(container);
  return domQuery('div[data-group="details"]', tab);
}

function getEntry(container, entryId) {
  return domQuery('div[data-entry="' + entryId + '"]', getDetailsGroup(container));
}

function getInputField(container, entryId, inputName) {
  var selector = 'input' + (inputName ? '[name="' + inputName + '"]' : '');
  return domQuery(selector, getEntry(container, entryId));
}

function getSelectField(container, entryId, selectName) {
  var selector = 'select' + (selectName ? '[name="' + selectName + '"]' : '');
  return domQuery(selector, getEntry(container, entryId));
}

function getErrorDefinitionsField(container) {
  return getSelectField(container, 'event-definitions-error', 'selectedElement');
}

function selectErrorDefinition(id, container) {
  var selectBox = getErrorDefinitionsField(container);
  var option = find(selectBox.options, function(o) {
    return o.value === id;
  });
  option.selected  = 'selected';
  TestHelper.triggerEvent(selectBox, 'change');
}

function getErrorNameField(container) {
  return getInputField(container, 'error-element-name', 'name');
}

function getErrorCodeField(container) {
  return getInputField(container, 'error-element-code', 'errorCode');
}

function isHidden(node) {
  return domClasses(node).has('pp-hidden');
}

function isInputHidden(node) {
  return isHidden(node.parentNode);
}

describe('error-event-properties', function() {

  var diagramXML = require('./ErrorEventDefinition.bpmn');

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
    modules: testModules
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


  describe('change error reference', function() {

    var container, errorEventDefinition;

    beforeEach(inject(function(elementRegistry, propertiesPanel, selection) {

      // given
      container = propertiesPanel._container;

      var shape = elementRegistry.get('WITH_ERROR_REF');
      selection.select(shape);

      var bo = getBusinessObject(shape);
      errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(bo);
    }));


    describe('to another error element', function() {

      var select;

      beforeEach(function() {
        select = getErrorDefinitionsField(container);

        // when
        selectErrorDefinition('Error_2', container);
      });


      describe('in the DOM', function() {

        it('should execute', function() {
          // then
          expect(select.value).to.equal('Error_2');

          expect(isInputHidden(getErrorNameField(container))).to.be.false;
          expect(isInputHidden(getErrorCodeField(container))).to.be.false;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(select.value).to.equal('Error_4');

          expect(isInputHidden(getErrorNameField(container))).to.be.false;
          expect(isInputHidden(getErrorCodeField(container))).to.be.false;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(select.value).to.equal('Error_2');

          expect(isInputHidden(getErrorNameField(container))).to.be.false;
          expect(isInputHidden(getErrorCodeField(container))).to.be.false;
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {
          // then
          expect(errorEventDefinition.errorRef).to.be.ok;
          expect(errorEventDefinition.errorRef.id).to.equal('Error_2');
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(errorEventDefinition.errorRef).to.be.ok;
          expect(errorEventDefinition.errorRef.id).to.equal('Error_4');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(errorEventDefinition.errorRef).to.be.ok;
          expect(errorEventDefinition.errorRef.id).to.equal('Error_2');
        }));

      });

    });


    describe('to undefined', function() {

      var select;

      beforeEach(function() {
        select = getErrorDefinitionsField(container);

        // when
        selectErrorDefinition('', container);
      });

      describe('in the DOM', function() {

        it('should execute', function() {
          // then
          expect(select.value).to.equal('');

          expect(isInputHidden(getErrorNameField(container))).to.be.true;
          expect(isInputHidden(getErrorCodeField(container))).to.be.true;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(select.value).to.equal('Error_4');

          expect(isInputHidden(getErrorNameField(container))).to.be.false;
          expect(isInputHidden(getErrorCodeField(container))).to.be.false;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(select.value).to.equal('');

          expect(isInputHidden(getErrorNameField(container))).to.be.true;
          expect(isInputHidden(getErrorCodeField(container))).to.be.true;
        }));

      });


      describe('on the business object', function() {

        it('should execute', function() {
          // then
          expect(errorEventDefinition.errorRef).not.to.be.ok;
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(errorEventDefinition.errorRef).to.be.ok;
          expect(errorEventDefinition.errorRef.id).to.equal('Error_4');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(errorEventDefinition.errorRef).not.to.be.ok;
        }));

      });

    });

  });

});
