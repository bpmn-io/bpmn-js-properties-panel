'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
    domQuery = require('min-dom/lib/query'),
    coreModule = require('bpmn-js/lib/core'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    propertiesProviderModule = require('../../../../lib/provider/camunda'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

describe('user-task-properties', function() {

  var diagramXML = require('./UserTask.bpmn');

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


  it('should fill an assignee property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    // when
    selection.select(taskShape);

    var assigneeInput = domQuery('input[name=assignee]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(assigneeInput, 'foo');

    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get('assignee')).to.equal('foo');
  }));


  it('should not fill an empty assignee property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    // when
    selection.select(taskShape);

    var assigneeInput = domQuery('input[name=assignee]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(assigneeInput, '');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get('assignee')).to.be.undefined;
  }));


  it('should fill a canidate users property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    // when
    selection.select(taskShape);

    var candidateUserInput = domQuery('input[name=candidateUsers]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(candidateUserInput, 'Kermit, Piggy');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get('candidateUsers')).to.equal('Kermit, Piggy');
  }));


  it('should not fill an empty candidate users property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    // when
    selection.select(taskShape);

    var candidateUserInput = domQuery('input[name=candidateUsers]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(candidateUserInput, '');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get('candidateUsers')).to.be.undefined;
  }));


  it('should fill a canidate groups property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    // when
    selection.select(taskShape);

    var candidateGroups = domQuery('input[name=candidateGroups]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(candidateGroups, 'Administration, IT');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get('candidateGroups')).to.equal('Administration, IT');
  }));


  it('should not fill an empty candidate groups property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    // when
    selection.select(taskShape);

    var candidateGroups = domQuery('input[name=candidateGroups]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(candidateGroups, '');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get('candidateGroups')).to.be.undefined;
  }));


  it('should fill a due date property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    // when
    selection.select(taskShape);

    var dueDateInput = domQuery('input[name=dueDate]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(dueDateInput, '2015-06-26T09:57:00');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get('dueDate')).to.equal('2015-06-26T09:57:00');
  }));


  it('should not fill an empty due date property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    // when
    selection.select(taskShape);

    var dueDateInput = domQuery('input[name=dueDate]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(dueDateInput, '');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get('dueDate')).to.be.undefined;
  }));


  it('should fill a follow up date property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    // when
    selection.select(taskShape);

    var followUpDateInput = domQuery('input[name=followUpDate]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(followUpDateInput, '2015-06-26T09:57:00');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get('followUpDate')).to.equal('2015-06-26T09:57:00');
  }));


  it('should not fill an empty follow up date property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    // when
    selection.select(taskShape);

    var followUpDateInput = domQuery('input[name=followUpDate]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(followUpDateInput, '');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get('followUpDate')).to.be.undefined;
  }));


  it('should fill a priority property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    // when
    selection.select(taskShape);

    var priority = domQuery('input[name=priority]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(priority, '100');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get('priority')).to.equal('100');
  }));


  it('should not fill an empty follow up date property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    // when
    selection.select(taskShape);

    var priority = domQuery('input[name=priority]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(priority, '');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get('priority')).to.be.undefined;
  }));

});
