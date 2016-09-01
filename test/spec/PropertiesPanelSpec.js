'use strict';

var TestHelper = require('../TestHelper');

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


  describe('description for field entry', function() {

    function getDescriptionField(container, dataEntrySelector) {
      return domQuery(dataEntrySelector + ' .bpp-field-description', container);
    }

    var eventShape;

    beforeEach(inject(function(propertiesPanel, selection, elementRegistry) {
      propertiesPanel.attachTo(container);

      eventShape = elementRegistry.get('StartEvent_1');
      selection.select(eventShape);

    }));


    it('only text', inject(function(propertiesPanel) {
      var descriptionField = getDescriptionField(propertiesPanel._container, '[data-entry=myText]');

      expect(descriptionField.textContent).to.be.equal('This field is for documentation');
    }));


    it('with a link', inject(function(propertiesPanel) {
      var descriptionField = getDescriptionField(propertiesPanel._container, '[data-entry=myLinkText]');

      expect(descriptionField.textContent).to.be.equal('For details see camunda.org');

      var link = domQuery('a', descriptionField);

      expect(link.href).to.be.equal('http://www.camunda.org/');
      expect(link.textContent).to.be.equal('camunda.org');
    }));

  });


  describe('table entry input field selection', function() {

    function getTableEntryInputField(container) {
      return domQuery('input[name=value]', container);
    }

    var input;

    beforeEach(inject(function(propertiesPanel, elementRegistry, selection) {
      propertiesPanel.attachTo(container);

      var eventShape = elementRegistry.get('StartEvent_1');
      selection.select(eventShape);

      input = getTableEntryInputField(propertiesPanel._container);

    }));


    describe('add text to the end, cursor position is at the end', function() {

      beforeEach(function() {

        expect(input.selectionStart).to.equal(input.value.length);
        expect(input.selectionEnd).to.equal(input.value.length);

        TestHelper.triggerValue(input, 'BARabc', 6);
      });

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(input.value).to.equal('BARabc');

          expect(input.selectionStart).to.equal(input.value.length);
          expect(input.selectionEnd).to.equal(input.value.length);
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(input.value).to.equal('BAR');

          expect(input.selectionStart).to.equal(input.value.length);
          expect(input.selectionEnd).to.equal(input.value.length);

        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(input.value).to.equal('BARabc');

          expect(input.selectionStart).to.equal(input.value.length);
          expect(input.selectionEnd).to.equal(input.value.length);

        }));

      });

    });


    describe('add text in the middle, cursor position is after the added text', function() {

      beforeEach(function() {

        expect(input.selectionStart).to.equal(input.value.length);
        expect(input.selectionEnd).to.equal(input.value.length);

        TestHelper.triggerValue(input, 'BAabcR', 5);
      });

      describe('in the DOM', function() {

        it('should execute', function() {
          expect(input.value).to.equal('BAabcR');

          // cursor position after 'BAabc'
          expect(input.selectionStart).to.equal(input.value.length-1);
          expect(input.selectionEnd).to.equal(input.value.length-1);
        });

        it('should undo', inject(function(commandStack) {

          commandStack.undo();

          expect(input.value).to.equal('BAR');

          // cursor position after 'BA'
          expect(input.selectionStart).to.equal(input.value.length-1);
          expect(input.selectionEnd).to.equal(input.value.length-1);

        }));

        it('should redo', inject(function(commandStack) {

          commandStack.undo();
          commandStack.redo();

          expect(input.value).to.equal('BAabcR');

          // cursor position after 'BAabc'
          expect(input.selectionStart).to.equal(input.value.length-1);
          expect(input.selectionEnd).to.equal(input.value.length-1);

        }));

      });

    });

  });


});
