'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('lib'),
    domQuery = require('min-dom').query,
    coreModule = require('bpmn-js/lib/core').default,
    selectionModule = require('diagram-js/lib/features/selection').default,
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    propertiesProviderModule = require('lib/provider/camunda'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


describe('historyTimeToLive', function() {
  var testModules = [
    coreModule, selectionModule, modelingModule,
    propertiesPanelModule,
    propertiesProviderModule
  ];

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  describe('process', function() {
    var diagramXML = require('./HistoryTimeToLiveProcess.bpmn');

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


    it('should get a history time to live for a process', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('Process_1'),
          inputEl = 'input[name=historyTimeToLive]';

      // when
      selection.select(shape);

      var bo = getBusinessObject(shape),
          inputValue = domQuery(inputEl, propertiesPanel._container).value;

      // then
      expect(bo.get('historyTimeToLive')).to.equal(inputValue);
    }));


    it('should set a history time to live on a process', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('Process_1'),
          inputEl = 'input[name=historyTimeToLive]';

      // given
      selection.select(shape);

      var inputElement = domQuery(inputEl, propertiesPanel._container),
          bo = getBusinessObject(shape);

      // when
      TestHelper.triggerValue(inputElement, 'bar', 'change');

      // then
      expect(bo.get('historyTimeToLive')).to.equal('bar');
    }));

  });


  describe('Participant', function() {
    var diagramXML = require('./HistoryTimeToLiveParticipant.bpmn');

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


    it('should get the history time to live of a process in a participant', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('Participant_1'),
          inputEl = 'input[name=historyTimeToLive]';

      // when
      selection.select(shape);

      var inputValue = domQuery(inputEl, propertiesPanel._container).value,
          shapeBo = getBusinessObject(shape).get('processRef');

      // then
      expect(shapeBo.get('historyTimeToLive')).to.equal(inputValue);
    }));


    it('should set the history time to live of a process in a participant', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('Participant_1'),
          inputEl = 'input[name=historyTimeToLive]';

      selection.select(shape);

      var inputElement = domQuery(inputEl, propertiesPanel._container),
          shapeBo = getBusinessObject(shape).get('processRef');

      // when
      TestHelper.triggerValue(inputElement, 'bar', 'change');

      // then
      expect(shapeBo.get('historyTimeToLive')).to.equal('bar');
    }));

  });

});
