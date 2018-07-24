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


describe('candidateStarterGroups/Users', function() {
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
    var diagramXML = require('./CandidateStarterProcess.bpmn');

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


    it('should get candidate starter groups for a process', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('Process_1'),
          inputEl = 'input[name=candidateStarterGroups]';

      // when
      selection.select(shape);

      var bo = getBusinessObject(shape),
          inputValue = domQuery(inputEl, propertiesPanel._container).value;

      // then
      expect(bo.get('candidateStarterGroups')).to.equal(inputValue);
    }));


    it('should get candidate starter users for a process', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('Process_1'),
          inputEl = 'input[name=candidateStarterUsers]';

      // when
      selection.select(shape);

      var bo = getBusinessObject(shape),
          inputValue = domQuery(inputEl, propertiesPanel._container).value;

      // then
      expect(bo.get('candidateStarterUsers')).to.equal(inputValue);
    }));


    it('should set candidate starter groups on a process', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('Process_1'),
          inputEl = 'input[name=candidateStarterGroups]';

      // given
      selection.select(shape);

      var inputElement = domQuery(inputEl, propertiesPanel._container),
          bo = getBusinessObject(shape);

      // when
      TestHelper.triggerValue(inputElement, 'bar', 'change');

      // then
      expect(bo.get('candidateStarterGroups')).to.equal('bar');
    }));


    it('should set candidate starter users on a process', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('Process_1'),
          inputEl = 'input[name=candidateStarterUsers]';

      // given
      selection.select(shape);

      var inputElement = domQuery(inputEl, propertiesPanel._container),
          bo = getBusinessObject(shape);

      // when
      TestHelper.triggerValue(inputElement, 'bar', 'change');

      // then
      expect(bo.get('candidateStarterUsers')).to.equal('bar');
    }));

  });


  describe('Participant', function() {
    var diagramXML = require('./CandidateStarterParticipant.bpmn');

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


    it('should get candidate starter groups for a participant', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('Participant_1'),
          inputEl = 'input[name=candidateStarterGroups]';

      // when
      selection.select(shape);

      var bo = getBusinessObject(shape).get('processRef'),
          inputValue = domQuery(inputEl, propertiesPanel._container).value;

      // then
      expect(bo.get('candidateStarterGroups')).to.equal(inputValue);
    }));


    it('should get candidate starter users for a participant', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('Participant_1'),
          inputEl = 'input[name=candidateStarterUsers]';

      // when
      selection.select(shape);

      var bo = getBusinessObject(shape).get('processRef'),
          inputValue = domQuery(inputEl, propertiesPanel._container).value;

      // then
      expect(bo.get('candidateStarterUsers')).to.equal(inputValue);
    }));


    it('should set candidate starter groups on a participant', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('Participant_1'),
          inputEl = 'input[name=candidateStarterGroups]';

      // given
      selection.select(shape);

      var inputElement = domQuery(inputEl, propertiesPanel._container),
          bo = getBusinessObject(shape).get('processRef');

      // when
      TestHelper.triggerValue(inputElement, 'bar', 'change');

      // then
      expect(bo.get('candidateStarterGroups')).to.equal('bar');
    }));


    it('should set candidate starter users on a participant', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('Participant_1'),
          inputEl = 'input[name=candidateStarterUsers]';

      // given
      selection.select(shape);

      var inputElement = domQuery(inputEl, propertiesPanel._container),
          bo = getBusinessObject(shape).get('processRef');

      // when
      TestHelper.triggerValue(inputElement, 'bar', 'change');

      // then
      expect(bo.get('candidateStarterUsers')).to.equal('bar');
    }));

  });

});
