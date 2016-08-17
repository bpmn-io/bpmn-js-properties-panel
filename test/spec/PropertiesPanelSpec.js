'use strict';

require('../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */



var propertiesPanelModule = require('../../lib'),
    coreModule = require('bpmn-js/lib/core'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    propertiesProviderModule = require('./properties');


var domQuery = require('min-dom/lib/query'),
    domAttr = require('min-dom/lib/attr');


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


      it('should display element id when selecting label', inject(function(propertiesPanel, selection) {

        // when
        selection.select(eventShape.label);

        // then
        expect(headerText(propertiesPanel)).to.eql(eventShape.id);
      }));


      it('should update on id edit',
        inject(function(propertiesPanel, selection, modeling) {

          // given
          var newId = 'BAR';

          selection.select(eventShape);

          // when
          modeling.updateProperties(eventShape, { id: newId });

          // then
          expect(headerText(propertiesPanel)).to.eql(newId);
        })
      );


      it('should update on id undo', inject(function(propertiesPanel, selection, commandStack, modeling) {

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


  describe('tab selection', function() {

    function getActiveTabId(container) {
      var activeTabNode = domQuery('.bpp-properties-tab.bpp-active', container);
      return domAttr(activeTabNode, 'data-tab');
    }

    it('should keep the selected tab when changing the selected element',
      inject(function(propertiesPanel, selection, elementRegistry) {

        propertiesPanel.attachTo(container);

        // select event
        var shape = elementRegistry.get('StartEvent_1');
        selection.select(shape);

        // first: check selected tab
        expect(getActiveTabId(propertiesPanel._container)).to.equal('tab1');

        // select tab2
        propertiesPanel.activateTab('tab2');

        // check selected tab
        expect(getActiveTabId(propertiesPanel._container)).to.equal('tab2');

        // select task
        shape = elementRegistry.get('Task_1');
        selection.select(shape);

        // check selected tab again
        expect(getActiveTabId(propertiesPanel._container)).to.equal('tab2');

      }));


    it('should select the first tab because the selected tab does not exist',
      inject(function(propertiesPanel, selection, elementRegistry) {

        propertiesPanel.attachTo(container);

        // select task
        var shape = elementRegistry.get('Task_1');
        selection.select(shape);

        // select tab3
        propertiesPanel.activateTab('tab3');

        // check selected tab
        expect(getActiveTabId(propertiesPanel._container)).to.equal('tab3');

        // select event
        shape = elementRegistry.get('StartEvent_1');
        selection.select(shape);

        // check selected tab again
        expect(getActiveTabId(propertiesPanel._container)).to.equal('tab1');

      }));

  });

});
