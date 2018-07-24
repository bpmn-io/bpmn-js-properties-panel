'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('lib'),
    domQuery = require('min-dom').query,
    coreModule = require('bpmn-js/lib/core').default,
    selectionModule = require('diagram-js/lib/features/selection').default,
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    propertiesProviderModule = require('lib/provider/bpmn'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

describe('event-properties', function() {

  var diagramXML = require('./ConditionalEventDefinition.bpmn');

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


  describe('visibility', function() {

    it('should show variableName for start events (parent: root)',
      inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        var shape = elementRegistry.get('StartEvent_4');

        // when
        selection.select(shape);

        var textField = domQuery('input[name=variableName]', propertiesPanel._container);

        // then
        expect(textField).to.exist;
      }
      ));


    it('should not show variableEvent for start events (parent: root)',
      inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        var shape = elementRegistry.get('StartEvent_4');

        // when
        selection.select(shape);

        var textField = domQuery('input[name=variableEvent]', propertiesPanel._container);

        // then
        expect(textField).not.to.exist;
      }
      ));


    it('should show variableName for boundary events',
      inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        var shape = elementRegistry.get('BoundaryEvent_1');

        // when
        selection.select(shape);

        var textField = domQuery('input[name=variableName]', propertiesPanel._container);

        // then
        expect(textField).to.exist;
      }
      ));


    it('should show variableEvent for boundary events',
      inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        var shape = elementRegistry.get('BoundaryEvent_1');

        // when
        selection.select(shape);

        var textField = domQuery('input[name=variableEvent]', propertiesPanel._container);

        // then
        expect(textField).to.exist;
      }
      ));


    it('should show variableName for start events (parent: sub process)',
      inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        var shape = elementRegistry.get('StartEvent_1');

        // when
        selection.select(shape);

        var textField = domQuery('input[name=variableName]', propertiesPanel._container);

        // then
        expect(textField).to.exist;
      }
      ));


    it('should not show variableEvent for start events (parent: sub process)',
      inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        var shape = elementRegistry.get('StartEvent_1');

        // when
        selection.select(shape);

        var textField = domQuery('input[name=variableEvent]', propertiesPanel._container);

        // then
        expect(textField).not.to.exist;
      }
      ));

  });


  describe('value', function() {


    it('should get existing variableName (parent: event sub process)', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('StartEvent_3');
      var bo = getBusinessObject(shape);

      // when
      selection.select(shape);

      var textField = domQuery('input[name=variableName]', propertiesPanel._container);

      // then
      expect(textField.value).to.equal(bo.eventDefinitions[0].get('camunda:variableName'));

    }));


    it('should get existing variableEvent (parent: event sub process)', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('StartEvent_3');
      var bo = getBusinessObject(shape);

      // when
      selection.select(shape);

      var textField = domQuery('input[name=variableEvent]', propertiesPanel._container);

      // then
      expect(textField.value).to.equal(bo.eventDefinitions[0].get('camunda:variableEvent'));

    }));


    describe('should change variableName (parent: event sub process)', function() {

      var bo, textField;

      beforeEach(inject(function(elementRegistry, selection, propertiesPanel) {

        // given
        var shape = elementRegistry.get('StartEvent_3');
        bo = getBusinessObject(shape);

        selection.select(shape);

        textField = domQuery('input[name=variableName]', propertiesPanel._container);

        // when
        TestHelper.triggerValue(textField, 'FOO', 'change');

      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(textField.value).to.equal('FOO');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(textField.value).to.equal('myVar');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(textField.value).to.equal('FOO');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(bo.eventDefinitions[0].get('camunda:variableName')).to.equal('FOO');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(bo.eventDefinitions[0].get('camunda:variableName')).to.equal('myVar');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(bo.eventDefinitions[0].get('camunda:variableName')).to.equal('FOO');
        }));

      });

    });


    describe('should change variableEvent', function() {

      var bo, textField;

      beforeEach(inject(function(elementRegistry, selection, propertiesPanel) {

        // given
        var shape = elementRegistry.get('StartEvent_3');
        bo = getBusinessObject(shape);

        selection.select(shape);

        textField = domQuery('input[name=variableEvent]', propertiesPanel._container);

        // when
        TestHelper.triggerValue(textField, 'delete', 'change');

      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(textField.value).to.equal('delete');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(textField.value).to.equal('create, update');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(textField.value).to.equal('delete');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(bo.eventDefinitions[0].get('camunda:variableEvent')).to.equal('delete');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(bo.eventDefinitions[0].get('camunda:variableEvent')).to.equal('create, update');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(bo.eventDefinitions[0].get('camunda:variableEvent')).to.equal('delete');
        }));

      });

    });


    it('should set new variableName', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('StartEvent_2');
      var bo = getBusinessObject(shape);

      selection.select(shape);

      var textField = domQuery('input[name=variableName]', propertiesPanel._container);

      // when
      TestHelper.triggerValue(textField, 'myVar', 'change');

      // then
      expect(textField.value).to.equal(bo.eventDefinitions[0].get('camunda:variableName'));

    }));


    it('should set new variableEvent', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('StartEvent_2');
      var bo = getBusinessObject(shape);

      selection.select(shape);

      var textField = domQuery('input[name=variableEvent]', propertiesPanel._container);

      // when
      TestHelper.triggerValue(textField, 'create, update', 'change');

      // then
      expect(textField.value).to.equal(bo.eventDefinitions[0].get('camunda:variableEvent'));

    }));


    it('should remove variableName', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('StartEvent_3');
      var bo = getBusinessObject(shape);

      selection.select(shape);

      var textField = domQuery('input[name=variableName]', propertiesPanel._container);

      // when
      TestHelper.triggerValue(textField, '', 'change');

      // then
      expect(textField.value).to.equal('');
      expect(bo.eventDefinitions[0].get('camunda:variableName')).to.be.undefined;

    }));


    it('should remove variableEvent', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('StartEvent_3');
      var bo = getBusinessObject(shape);

      selection.select(shape);

      var textField = domQuery('input[name=variableEvent]', propertiesPanel._container);

      // when
      TestHelper.triggerValue(textField, '', 'change');

      // then
      expect(textField.value).to.equal('');
      expect(bo.eventDefinitions[0].get('camunda:variableEvent')).to.be.undefined;

    }));

  });

});
