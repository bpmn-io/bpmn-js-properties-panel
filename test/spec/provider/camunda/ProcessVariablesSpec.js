'use strict';

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('lib'),
    propertiesProviderModule = require('lib/provider/camunda'),
    selectionModule = require('diagram-js/lib/features/selection').default,
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    coreModule = require('bpmn-js/lib/core').default;

var camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');

var domQuery = require('min-dom').query;

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


describe('process-variables', function() {
  var diagramXML = require('./ProcessVariables.bpmn');

  var diagramCollabXML = require('./ProcessVariables-collaboration.bpmn');

  var testModules = [
    coreModule,
    selectionModule,
    modelingModule,
    propertiesPanelModule,
    propertiesProviderModule,
  ];

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  describe('on process', function() {
    var propertiesTable, task, process;

    beforeEach(
      bootstrapModeler(diagramXML, {
        modules: testModules,
        moddleExtensions: { camunda: camundaModdlePackage },
      })
    );

    beforeEach(inject(function(propertiesPanel) {
      propertiesPanel.attachTo(container);
    }));

    beforeEach(inject(function(elementRegistry, selection) {

      // given
      process = elementRegistry.get('Process_1');
      task = elementRegistry.get('Task_1');

      // when
      selection.select(process);

      propertiesTable = getProcessVariablesTable(container);
    }));

    it('should show process variables', function() {

      // then
      expect(propertiesTable.childNodes).to.length(2);
    });


    it('should show variable name, origin and scope', function() {

      var tableRow = getVariableRow(0, propertiesTable);

      // then
      // expect the row to contain 3 input fields
      expect(tableRow.childNodes).to.have.length(3);

      expect(tableRow.childNodes[0].name).to.equal('name');
      expect(tableRow.childNodes[0].value).to.equal('variable1');

      expect(tableRow.childNodes[1].name).to.equal('origin');
      expect(tableRow.childNodes[1].value).to.equal('Task 1');

      expect(tableRow.childNodes[2].name).to.equal('scope');
      expect(tableRow.childNodes[2].value).to.equal('Process_1');
    });


    it('should not be editable', function() {
      var tableRow = getVariableRow(0, propertiesTable),
          firstCell = tableRow.childNodes[0];

      // then
      expect(isReadOnly(firstCell)).to.be.true;
    });


    it('should show names instead of ids (if available)', function() {

      var tableRow = getVariableRow(0, propertiesTable);

      // then
      // Task_1 has name
      expect(tableRow.childNodes[1].value).to.equal(getBusinessObject(task).name);

      // Process_1 has no name -> use id
      expect(tableRow.childNodes[2].value).to.equal(process.id);
    });
  });


  describe('on sub process', function() {
    var propertiesTable, task, subProcess, process;

    beforeEach(
      bootstrapModeler(diagramXML, {
        modules: testModules,
        moddleExtensions: { camunda: camundaModdlePackage },
      })
    );

    beforeEach(inject(function(propertiesPanel) {
      propertiesPanel.attachTo(container);
    }));

    beforeEach(inject(function(elementRegistry, selection) {

      // given
      subProcess = elementRegistry.get('SubProcess_1');
      process = elementRegistry.get('Process_1');
      task = elementRegistry.get('Task_1');

      // when
      selection.select(subProcess);

      propertiesTable = getProcessVariablesTable(container);
    }));

    it('should show process variables', function() {

      // then
      expect(propertiesTable.childNodes).to.length(3);
    });


    it('should show variable name, origin and scope', function() {

      var tableRow = getVariableRow(0, propertiesTable);

      // then
      // expect the row to contain 3 input fields
      expect(tableRow.childNodes).to.have.length(3);

      expect(tableRow.childNodes[0].name).to.equal('name');
      expect(tableRow.childNodes[0].value).to.equal('variable1');

      expect(tableRow.childNodes[1].name).to.equal('origin');
      expect(tableRow.childNodes[1].value).to.equal('Task 1');

      expect(tableRow.childNodes[2].name).to.equal('scope');
      expect(tableRow.childNodes[2].value).to.equal('Process_1');
    });


    it('should not be editable', function() {
      var tableRow = getVariableRow(0, propertiesTable),
          firstCell = tableRow.childNodes[0];

      // then
      expect(isReadOnly(firstCell)).to.be.true;
    });


    it('should show names instead of ids (if available)', function() {

      var tableRow = getVariableRow(0, propertiesTable);

      // then
      // Task_1 has name
      expect(tableRow.childNodes[1].value).to.equal(getBusinessObject(task).name);

      // Process_1 has no name -> use id
      expect(tableRow.childNodes[2].value).to.equal(process.id);
    });
  });


  describe('on participant', function() {
    var propertiesTable, task, participant;

    beforeEach(
      bootstrapModeler(diagramCollabXML, {
        modules: testModules,
        moddleExtensions: { camunda: camundaModdlePackage },
      })
    );

    beforeEach(inject(function(propertiesPanel) {
      propertiesPanel.attachTo(container);
    }));

    beforeEach(inject(function(elementRegistry, selection) {

      // given
      participant = elementRegistry.get('Participant_1');
      task = elementRegistry.get('Task_1');

      // when
      selection.select(participant);

      propertiesTable = getProcessVariablesTable(container);
    }));

    it('should show process variables', function() {

      // then
      expect(propertiesTable.childNodes).to.length(2);
    });


    it('should show variable name, origin and scope', function() {

      var tableRow = getVariableRow(0, propertiesTable);

      // then
      // expect the row to contain 3 input fields
      expect(tableRow.childNodes).to.have.length(3);

      expect(tableRow.childNodes[0].name).to.equal('name');
      expect(tableRow.childNodes[0].value).to.equal('variable1');

      expect(tableRow.childNodes[1].name).to.equal('origin');
      expect(tableRow.childNodes[1].value).to.equal('Task 1');

      expect(tableRow.childNodes[2].name).to.equal('scope');
      expect(tableRow.childNodes[2].value).to.equal('Process_1');
    });


    it('should not be editable', function() {
      var tableRow = getVariableRow(0, propertiesTable),
          firstCell = tableRow.childNodes[0];

      // then
      expect(isReadOnly(firstCell)).to.be.true;
    });


    it('should show names instead of ids (if available)', function() {

      var tableRow = getVariableRow(0, propertiesTable);

      // then
      // Task_1 has name
      expect(tableRow.childNodes[1].value).to.equal(getBusinessObject(task).name);

      // Process_1 has no name -> use id
      expect(tableRow.childNodes[2].value)
        .to.equal(getBusinessObject(participant).processRef.id);
    });

  });

});


// helpers //////////

function getProcessVariablesTab(container) {
  return domQuery('div[data-tab="process-variables"]', container);
}

function getProcessVariablesGroup(container) {
  var variablesTab = getProcessVariablesTab(container);
  return domQuery('div[data-group="process-variables"]', variablesTab);
}

function getProcessVariablesEntry(container) {
  var group = getProcessVariablesGroup(container);
  return domQuery('div[data-entry="process-variables-entry"]', group);
}

function getProcessVariablesTable(container) {
  var entry = getProcessVariablesEntry(container);
  return domQuery('div[data-list-entry-container]', entry);
}

function getVariableRow(idx, container) {
  return domQuery('[data-index="' + idx + '"]', container);
}

function isReadOnly(input) {
  return input.hasAttribute('readonly');
}

