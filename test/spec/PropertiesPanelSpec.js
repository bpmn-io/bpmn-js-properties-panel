'use strict';

var TestHelper = require('../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */



var propertiesPanelModule = require('../../lib'),
    coreModule = require('bpmn-js/lib/core'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    propertiesProviderModule = require('./properties');


var domQuery = require('min-dom/lib/query');


describe('properties-panel', function() {

  var diagramXML = require('./test.bpmn');

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


  beforeEach(inject(function(commandStack) {

    var button = document.createElement('button');
    button.textContent = 'UNDO';

    button.addEventListener('click', function() {
      commandStack.undo();
    });

    container.appendChild(button);
  }));


  it('should attach to element', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

  }));


  describe('helpers', function() {

    describe('inject element id into [data-label-id] element', function() {

      function headerText(propertiesPanel) {
        return domQuery('[data-label-id]', propertiesPanel._container).textContent;
      }

      var eventShape;

      beforeEach(inject(function(propertiesPanel, elementRegistry) {
        propertiesPanel.attachTo(container);

        eventShape = elementRegistry.get('StartEvent_1');
      }));


      it('should display initially', inject(function(propertiesPanel, selection) {

        // when
        selection.select(eventShape);

        // then
        expect(headerText(propertiesPanel)).to.eql(eventShape.id);
      }));


      it('should update on id edit', inject(function(propertiesPanel, selection, modeling) {

        // given
        var newId = 'BAR';

        selection.select(eventShape);

        // when
        modeling.updateProperties(eventShape, { id: newId });

        // then
        expect(headerText(propertiesPanel)).to.eql(newId);
      }));


      it('should update on id undo',
        inject(function(propertiesPanel, selection, commandStack, modeling) {

        // given
        var oldId = eventShape.id;

        selection.select(eventShape);
        modeling.updateProperties(eventShape, { id: 'BAR' });

        // when
        commandStack.undo();

        // then
        expect(headerText(propertiesPanel)).to.eql(oldId);
      }));

    });

  });

});
