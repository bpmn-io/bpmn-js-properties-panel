'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
    domQuery = require('min-dom/lib/query'),
    coreModule = require('bpmn-js/lib/core'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    propertiesProviderModule = require('../../../../lib/provider/bpmn'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

function getEntry(container, entryId) {
  return domQuery('div[data-entry="' + entryId + '"]', container);
}

function getNameField(container) {
  var selector = 'div[name=name]';
  return domQuery(selector, getEntry(container, 'name'));
}

function getTextBoxRows(field) {
  var innerText = field.innerText || '';
  var lines = innerText.split(/\r?\n/g);
  var rows = lines.length;

  return rows;
}

describe('element-name-properties', function() {

  var diagramXML = require('./ElementName.bpmn');

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

  describe('change name', function() {

    var container, element, nameField;

    beforeEach(inject(function(propertiesPanel) {
      container = propertiesPanel._container;
    }));

    describe('of an event', function() {

      beforeEach(inject(function(elementRegistry, selection) {
        // given
        var shape = elementRegistry.get('START_WITHOUT_NAME');
        selection.select(shape);

        element = getBusinessObject(shape);

        nameField = getNameField(container);

        // when
        TestHelper.triggerValue(nameField, 'foo', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          // then
          expect(nameField.textContent).to.equal('foo');
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(nameField.textContent).to.equal('');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(nameField.textContent).to.equal('foo');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          // then
          expect(element.name).to.equal('foo');
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(element.name).to.be.undefined;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(element.name).to.equal('foo');
        }));

      });

    });

    describe('of an task', function() {

      beforeEach(inject(function(elementRegistry, selection) {
        // given
        var shape = elementRegistry.get('TASK_WITHOUT_NAME');
        selection.select(shape);

        element = getBusinessObject(shape);

        nameField = getNameField(container);

        // when
        TestHelper.triggerValue(nameField, 'foo', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          // then
          expect(nameField.textContent).to.equal('foo');
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(nameField.textContent).to.equal('');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(nameField.textContent).to.equal('foo');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          // then
          expect(element.name).to.equal('foo');
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(element.name).to.be.undefined;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(element.name).to.equal('foo');
        }));

      });

    });

    describe('of a sequence flow', function() {

      beforeEach(inject(function(elementRegistry, selection) {
        // given
        var shape = elementRegistry.get('FLOW_WITHOUT_NAME_1');
        selection.select(shape);

        element = getBusinessObject(shape);

        nameField = getNameField(container);

        // when
        TestHelper.triggerValue(nameField, 'foo', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          // then
          expect(nameField.textContent).to.equal('foo');
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(nameField.textContent).to.equal('');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(nameField.textContent).to.equal('foo');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          // then
          expect(element.name).to.equal('foo');
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(element.name).to.be.undefined;
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(element.name).to.equal('foo');
        }));

      });

    });

    describe('of a text annotation', function() {

      beforeEach(inject(function(elementRegistry, selection) {
        // given
        var shape = elementRegistry.get('TEXTANNOTATION_WITH_NAME');
        selection.select(shape);

        element = getBusinessObject(shape);

        nameField = domQuery('div[name=text]', getEntry(container, 'name'));

        expect(element.text).to.equal('text for name');
        expect(nameField.textContent).to.equal('text for name');

        // when
        TestHelper.triggerValue(nameField, 'foo', 'change');
      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          // then
          expect(nameField.textContent).to.equal('foo');
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(nameField.textContent).to.equal('text for name');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(nameField.textContent).to.equal('foo');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          // then
          expect(element.text).to.equal('foo');
        });


        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(element.text).to.equal('text for name');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(element.text).to.equal('foo');
        }));

      });

    });

  });


  describe('textbox rows', function() {

    it('should initialize textbox with one rows', inject(function(elementRegistry, selection, propertiesPanel) {

      // given
      var shape = elementRegistry.get('ONE_LINE');

      // when
      selection.select(shape);

      // then
      var field = getNameField(propertiesPanel._container);
      expect(getTextBoxRows(field)).to.equal(1);
    }));


    it('should initialize textbox with three rows', inject(function(elementRegistry, selection, propertiesPanel) {

      // given
      var shape = elementRegistry.get('FOUR_LINES');

      // when
      selection.select(shape);

      // then
      var field = getNameField(propertiesPanel._container);
      expect(getTextBoxRows(field)).to.equal(4);
    }));


    it('should grow', inject(function(elementRegistry, selection, propertiesPanel) {

      // given
      var shape = elementRegistry.get('ONE_LINE');
      selection.select(shape);

      var field = getNameField(propertiesPanel._container);

      // when
      TestHelper.triggerValue(field, 'a\nb', 'change');

      // then
      expect(getTextBoxRows(field)).to.equal(2);
    }));


    it('should reduce', inject(function(elementRegistry, selection, propertiesPanel) {

      // given
      var shape = elementRegistry.get('FOUR_LINES');
      selection.select(shape);

      var field = getNameField(propertiesPanel._container);

      // when
      TestHelper.triggerValue(field, 'a\nb', 'change');

      // then
      expect(getTextBoxRows(field)).to.equal(2);
    }));


    it('should set textbox rows to more than three', inject(function(elementRegistry, selection, propertiesPanel) {

      // given
      var shape = elementRegistry.get('ONE_LINE');
      selection.select(shape);

      var field = getNameField(propertiesPanel._container);

      // when
      TestHelper.triggerValue(field, 'a\nb\nc\nd\ne', 'change');

      // then
      expect(getTextBoxRows(field)).to.equal(5);
    }));


    it('should set textbox rows to minimum value of one', inject(function(elementRegistry, selection, propertiesPanel) {

      // given
      var shape = elementRegistry.get('FOUR_LINES');
      selection.select(shape);

      var field = getNameField(propertiesPanel._container);

      // when
      TestHelper.triggerValue(field, 'a', 'change');

      // then
      expect(getTextBoxRows(field)).to.equal(1);
    }));

  });

});
