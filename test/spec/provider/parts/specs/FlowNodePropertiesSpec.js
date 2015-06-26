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

  var diagramXML = require('../diagrams/FlowNodePropertyTest.bpmn');

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

  it('should set the asyncBefore property of a gateway flow node', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('InclusiveGateway_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var asyncBefore = domQuery('input[name=asyncBefore]', propertiesPanel._container),
        taskBo      = getBusinessObject(shape);

    // if
    expect(taskBo.get("asyncBefore")).toBeFalsy();
    TestHelper.triggerEvent(asyncBefore, 'click');

    // then
    taskBo = getBusinessObject(shape);
    expect(taskBo.get("asyncBefore")).toBeTruthy();
  }));

  it('should set the asyncBefore property of a event flow node', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('IntermediateThrowEvent_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var asyncBefore = domQuery('input[name=asyncBefore]', propertiesPanel._container),
        taskBo      = getBusinessObject(shape);

    // if
    expect(taskBo.get("asyncBefore")).toBeFalsy();
    TestHelper.triggerEvent(asyncBefore, 'click');

    // then
    taskBo = getBusinessObject(shape);
    expect(taskBo.get("asyncBefore")).toBeTruthy();
  }));

  it('should set the asyncBefore property of a activity flow node', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('CallActivity_2');

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var asyncBefore = domQuery('input[name=asyncBefore]', propertiesPanel._container),
      taskBo      = getBusinessObject(shape);

    // if
    expect(taskBo.get("asyncBefore")).toBeFalsy();
    TestHelper.triggerEvent(asyncBefore, 'click');

    // then
    taskBo = getBusinessObject(shape);
    expect(taskBo.get("asyncBefore")).toBeTruthy();
  }));

  it('should set the asyncAfter property of a gateway flow node', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('InclusiveGateway_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var asyncAfter = domQuery('input[name=asyncAfter]', propertiesPanel._container),
        taskBo      = getBusinessObject(shape);

    // if
    expect(taskBo.get("asyncAfter")).toBeFalsy();
    TestHelper.triggerEvent(asyncAfter, 'click');

    // then
    taskBo = getBusinessObject(shape);
    expect(taskBo.get("asyncAfter")).toBeTruthy();
  }));

  it('should set the asyncAfter property of a event flow node', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('IntermediateThrowEvent_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var asyncAfter = domQuery('input[name=asyncAfter]', propertiesPanel._container),
        taskBo      = getBusinessObject(shape);

    // if
    expect(taskBo.get("asyncAfter")).toBeFalsy();
    TestHelper.triggerEvent(asyncAfter, 'click');

    // then
    taskBo = getBusinessObject(shape);
    expect(taskBo.get("asyncAfter")).toBeTruthy();
  }));

  it('should set the asyncAfter property of a activity flow node', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('CallActivity_2');

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var asyncAfter = domQuery('input[name=asyncAfter]', propertiesPanel._container),
        taskBo      = getBusinessObject(shape);

    // if
    expect(taskBo.get("asyncAfter")).toBeFalsy();
    TestHelper.triggerEvent(asyncAfter, 'click');

    // then
    taskBo = getBusinessObject(shape);
    expect(taskBo.get("asyncAfter")).toBeTruthy();
  }));
});
