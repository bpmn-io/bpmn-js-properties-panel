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
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


describe('process-participant-properties', function() {

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


  it('should set the isExecutable property of a process', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('Participant_1');

    selection.select(shape);

    var isExecutable = domQuery('input[name=isExecutable]', propertiesPanel._container),
        taskBo        = getBusinessObject(shape).get('processRef');

    // when
    TestHelper.triggerEvent(isExecutable, 'click');

    // then
    expect(taskBo.get('isExecutable')).to.be.ok;
  }));


  it('should get the name of a process in a participant', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('_Participant_2');

    // when
    selection.select(shape);

    var name = domQuery('div[data-entry=process-name] div[name=name]', propertiesPanel._container),
        shapeBo = getBusinessObject(shape).get('processRef');

    // then
    expect(shapeBo.get('name')).to.equal(name.textContent);
  }));


  it('should set the name of a process in a participant', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('_Participant_2');

    selection.select(shape);

    var name = domQuery('div[data-entry=process-name] div[name=name]', propertiesPanel._container),
        shapeBo = getBusinessObject(shape).get('processRef');

    // when
    TestHelper.triggerValue(name, 'Foo', 'change');

    // then
    expect(shapeBo.get('name')).to.equal('Foo');
  }));


  it('should get the id of a process in a participant', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('_Participant_2');

    // when
    selection.select(shape);

    var id = domQuery('input[name=processId]', propertiesPanel._container),
        shapeBo = getBusinessObject(shape).get('processRef');

    // then
    expect(shapeBo.get('id')).to.equal(id.value);
  }));


  it('should set the id of a process in a participant', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('_Participant_2');

    selection.select(shape);

    var name = domQuery('input[name=processId]', propertiesPanel._container),
        shapeBo = getBusinessObject(shape).get('processRef');

    // when
    TestHelper.triggerValue(name, 'Foo', 'change');

    // then
    expect(shapeBo.get('id')).to.equal('Foo');
  }));


  it('should get the id of the participant', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('_Participant_2');
    var participant = getBusinessObject(shape);

    // when
    selection.select(shape);


    // then
    var input = domQuery('div[data-entry=id] input[name=id]', propertiesPanel._container);
    expect(input.value).to.equal(participant.get('id'));
  }));


  it('should get the name of the participant', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('_Participant_2');
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
      var shape = elementRegistry.get('_Participant_2');
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
        expect(textbox.textContent).to.equal('Pool');
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
        expect(participant.get('name')).to.equal('Pool');
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


  describe('validation errors', function() {

    var shape, textField, getTextField;

    beforeEach(inject(function(elementRegistry, propertiesPanel, selection) {

      shape = elementRegistry.get('_Participant_2');
      selection.select(shape);

      getTextField = function() {
        return domQuery('input[name=processId]', propertiesPanel._container);
      };

      textField = getTextField();

    }));


    it('should not be shown if id is valid', function() {

      // when
      TestHelper.triggerValue(textField, 'Foo', 'change');

      // then
      expect(domClasses(getTextField()).has('invalid')).to.be.false;
    });


    it('should be shown if id is invalid', function() {

      // when
      TestHelper.triggerValue(textField, 'StartEvent_1', 'change');

      // then
      expect(domClasses(getTextField()).has('invalid')).to.be.true;
    });

  });

});
