'use strict';

var TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../../lib'),
  domQuery = domQuery = require('min-dom/lib/query'),
  coreModule = require('bpmn-js/lib/core'),
  selectionModule = require('diagram-js/lib/features/selection'),
  modelingModule = require('bpmn-js/lib/features/modeling'),
  propertiesProviderModule = require('../../../../../lib/provider/camunda'),
  camundaModdlePackage = require('../../../../../lib/provider/camunda/camunda-moddle'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

describe('user-task-properties', function() {

  var diagramXML = require('../diagrams/UserTaskPropertiesTest.bpmn');

  var testModules = [
    coreModule, selectionModule, modelingModule,
    propertiesPanelModule,
    propertiesProviderModule
  ];

  var container;

  beforeEach(function() {
    container = jasmine.getEnv().getTestContainer();
  });

  beforeEach(bootstrapModeler(diagramXML, {
    modules: testModules,
    moddleExtensions: {camunda: camundaModdlePackage}
  }));


  beforeEach(inject(function(commandStack) {

    var undoButton = document.createElement('button');
    undoButton.textContent = 'UNDO';

    undoButton.addEventListener('click', function() {
      commandStack.undo();
    });

    container.appendChild(undoButton);
  }));

  it('should fill an assignee property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var assigneeInput = domQuery('input[name=assignee]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(assigneeInput, 'foo');

    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get("assignee")).toBe("foo");
  }));

  it('should not fill an empty assignee property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var assigneeInput = domQuery('input[name=assignee]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(assigneeInput, '');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get("assignee")).toBeUndefined();
  }));

  it('should fill a form key property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var formKeyInput = domQuery('input[name=formKey]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(formKeyInput, 'foo/bar');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get("formKey")).toBe('foo/bar');
  }));

  it('should not fill an empty form key property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var formKeyInput = domQuery('input[name=formKey]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(formKeyInput, '');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get("formKey")).toBeUndefined();
  }));

  it('should fill a canidate users property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var candidateUserInput = domQuery('input[name=candidateUsers]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(candidateUserInput, 'Kermit, Piggy');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get("candidateUsers")).toBe('Kermit, Piggy');
  }));

  it('should not fill an empty candidate users property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var candidateUserInput = domQuery('input[name=candidateUsers]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(candidateUserInput, '');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get("candidateUsers")).toBeUndefined();
  }));

  it('should fill a canidate groups property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var candidateGroups = domQuery('input[name=candidateGroups]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(candidateGroups, 'Administration, IT');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get("candidateGroups")).toBe('Administration, IT');
  }));

  it('should not fill an empty candidate groups property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var candidateGroups = domQuery('input[name=candidateGroups]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(candidateGroups, '');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get("candidateGroups")).toBeUndefined();
  }));

  it('should fill a due date property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var dueDateInput = domQuery('input[name=dueDate]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(dueDateInput, '2015-06-26T09:57:00');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get("dueDate")).toBe('2015-06-26T09:57:00');
  }));

  it('should not fill an empty due date property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var dueDateInput = domQuery('input[name=dueDate]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(dueDateInput, '');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get("dueDate")).toBeUndefined();
  }));

  it('should fill a follow up date property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var followUpDateInput = domQuery('input[name=followUpDate]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(followUpDateInput, '2015-06-26T09:57:00');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get("followUpDate")).toBe('2015-06-26T09:57:00');
  }));

  it('should not fill an empty follow up date property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var followUpDateInput = domQuery('input[name=followUpDate]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(followUpDateInput, '');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get("followUpDate")).toBeUndefined();
  }));

  it('should fill a priority property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var priority = domQuery('input[name=priority]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(priority, '100');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get("priority")).toBe('100');
  }));

  it('should not fill an empty follow up date property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var priority = domQuery('input[name=priority]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(priority, '');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get("priority")).toBeUndefined();
  }));

});
