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

var PARTICIPANT_ID = 'Participant_collapsed';

describe('process-participant-collapsed-properties', function() {

  var diagramXML = require('./ProcessParticipant.bpmn');

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


  it('should get the id of the participant', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get(PARTICIPANT_ID);
    var participant = getBusinessObject(shape);

    // when
    selection.select(shape);


    // then
    var input = domQuery('div[data-entry=id] input[name=id]', propertiesPanel._container);
    expect(input.value).to.equal(participant.get('id'));
  }));


  it('should get the name of the participant', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get(PARTICIPANT_ID);
    var participant = getBusinessObject(shape);

    // when
    selection.select(shape);


    // then
    var input = domQuery('div[data-entry=name] div[name=name]', propertiesPanel._container);
    expect(input.textContent).to.equal(participant.get('name'));
  }));


  describe('change name of participant', function() {

    var participant, textbox;

    beforeEach(inject(function(elementRegistry, selection, propertiesPanel) {

      // given
      var shape = elementRegistry.get(PARTICIPANT_ID);
      selection.select(shape);

      participant = getBusinessObject(shape);
      textbox = domQuery('div[data-entry=name] div[name=name]');

      // when
      TestHelper.triggerValue(textbox, 'foo', 'change');
    }));

    describe('in the DOM', function() {

      it('should execute', function() {
        // then
        expect(textbox.textContent).to.equal('foo');
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(textbox.textContent).to.equal('Collapsed Pool');
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(textbox.textContent).to.equal('foo');
      }));
    });


    describe('on the business object', function() {

      it('should execute', function() {
        // then
        expect(participant.get('name')).to.equal('foo');
      });


      it('should undo', inject(function(commandStack) {
        // when
        commandStack.undo();

        // then
        expect(participant.get('name')).to.equal('Collapsed Pool');
      }));


      it('should redo', inject(function(commandStack) {
        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(participant.get('name')).to.equal('foo');
      }));
    });

  });

});
