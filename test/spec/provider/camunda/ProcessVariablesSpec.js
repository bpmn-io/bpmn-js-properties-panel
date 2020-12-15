'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('lib'),
    propertiesProviderModule = require('lib/provider/camunda'),
    selectionModule = require('diagram-js/lib/features/selection').default,
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    coreModule = require('bpmn-js/lib/core').default;

var camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');

var classes = require('min-dom').classes,
    domQuery = require('min-dom').query,
    domQueryAll = require('min-dom').queryAll;

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


describe('process-variables', function() {
  var diagramXML = require('./ProcessVariables.bpmn');

  var diagramCollabXML = require('./ProcessVariables-collaboration.bpmn');

  var diagramEmptyXML = require('./ProcessVariables-no-variables.bpmn');

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


  describe('no variables', function() {
    beforeEach(
      bootstrapModeler(diagramEmptyXML, {
        modules: testModules,
        moddleExtensions: { camunda: camundaModdlePackage },
      })
    );

    beforeEach(inject(function(propertiesPanel) {
      propertiesPanel.attachTo(container);
    }));

    beforeEach(inject(function(elementRegistry, selection) {

      // given
      var process = elementRegistry.get('Process_1');

      // when
      selection.select(process);
    }));


    it('should show placeholder', function() {

      // then
      expect(getPlaceholder(container)).to.exist;
    });
  });


  describe('on process', function() {
    var task, process;

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
    }));

    it('should list process variables', function() {
      var processVariables = getProcessVariableItems(container);

      // then
      expect(processVariables).to.length(2);
    });


    it('should show variable name and origin', function() {
      var variable = getProcessVariable(container, 0);

      // then
      expect(getProcessVariableField(variable, 'title').innerText).to.equal('variable1');
      expect(getProcessVariableField(variable, 'description').innerText)
        .to.equal(getBusinessObject(task).name);
    });


    it('should show origin in uncollapsed state', function() {

      // when
      selectProcessVariable(container, 0);

      var createdInNode = getCreatedIn(container, 0),
          originItem = domQuery('.bpp-process-variables__created-in-item', createdInNode);

      // then
      expect(createdInNode).to.exist;
      expect(isHidden(createdInNode)).to.be.false;

      expect(originItem.innerText).to.equal(getBusinessObject(task).name);
    });

  });


  describe('on sub process', function() {
    var task, subProcess, process;

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
      task = elementRegistry.get('Task_2');

      // when
      selection.select(subProcess);
    }));

    it('should list process variables', function() {
      var processVariables = getProcessVariableItems(container);

      // then
      expect(processVariables).to.length(3);
    });


    it('should group by scope', function() {
      var scopes = getScopeHeaders(container);

      // then
      expect(scopes).to.length(2);
      expect(scopes[0].firstChild.innerText).to.equal('Scope: ' + subProcess.id);
      expect(scopes[1].firstChild.innerText).to.equal('Scope: ' + process.id);
    });


    it('should show variable name and origin', function() {
      var variable = getProcessVariable(container, 0);

      // then
      expect(getProcessVariableField(variable, 'title').innerText).to.equal('variable3');
      expect(getProcessVariableField(variable, 'description').innerText)
        .to.equal(getBusinessObject(task).name);
    });


    it('should show origin in uncollapsed state', function() {

      // when
      selectProcessVariable(container, 0);

      var createdInNode = getCreatedIn(container, 0, 'SubProcess_1-'),
          originItem = domQuery('.bpp-process-variables__created-in-item', createdInNode);

      // then
      expect(createdInNode).to.exist;
      expect(isHidden(createdInNode)).to.be.false;

      expect(originItem.innerText).to.equal(getBusinessObject(task).name);
    });
  });


  describe('on participant', function() {
    var task, participant;

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
    }));

    it('should list process variables', function() {
      var processVariables = getProcessVariableItems(container);

      // then
      expect(processVariables).to.length(2);
    });


    it('should show variable name and origin', function() {
      var variable = getProcessVariable(container, 0);

      // then
      expect(getProcessVariableField(variable, 'title').innerText).to.equal('variable1');
      expect(getProcessVariableField(variable, 'description').innerText)
        .to.equal(getBusinessObject(task).name);
    });


    it('should show origin in uncollapsed state', function() {

      // when
      selectProcessVariable(container, 0);

      var createdInNode = getCreatedIn(container, 0),
          originItem = domQuery('.bpp-process-variables__created-in-item', createdInNode);

      // then
      expect(createdInNode).to.exist;
      expect(isHidden(createdInNode)).to.be.false;

      expect(originItem.innerText).to.equal(getBusinessObject(task).name);
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

function getProcessVariableItems(container) {
  var group = getProcessVariablesGroup(container);
  return domQueryAll('.bpp-collapsible', group);
}

function getProcessVariable(container, idx) {
  var items = getProcessVariableItems(container);
  return items[idx];
}

function getProcessVariableField(variable, prop) {
  return domQuery('[data-value="' + prop + '"]', variable);
}

function selectProcessVariable(container, idx) {
  var item = getProcessVariable(container, idx);
  TestHelper.triggerEvent(item.firstChild, 'click');
}

function getCreatedIn(container, idx, scopePrefix) {
  if (!scopePrefix) {
    scopePrefix = '';
  }

  var group = getProcessVariablesGroup(container);
  return domQuery('div[data-entry="' + scopePrefix + 'variable- ' + idx + '-created-in"]', group);
}

function getScopeHeaders(container) {
  var group = getProcessVariablesGroup(container);
  return domQueryAll('.bpp-process-variables__scope-title', group);
}

function getPlaceholder(container) {
  var group = getProcessVariablesGroup(container);
  return domQuery('div[data-entry="process-variables-placeholder"]', group);
}

function isHidden(entryNode) {
  return classes(domQuery('[data-show]', entryNode)).has('bpp-hidden');
}

