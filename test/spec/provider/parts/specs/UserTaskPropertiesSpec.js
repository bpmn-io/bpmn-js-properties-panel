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
    TestHelper.triggerValue(assigneeInput, 'foo', 'change');

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
    TestHelper.triggerValue(assigneeInput, '', 'change');
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
    TestHelper.triggerValue(formKeyInput, 'foo/bar', 'change');
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
    TestHelper.triggerValue(formKeyInput, '', 'change');
    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get("formKey")).toBeUndefined();
  }));

});
