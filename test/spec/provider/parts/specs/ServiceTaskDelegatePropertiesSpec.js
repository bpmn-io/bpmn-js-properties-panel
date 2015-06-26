'use strict';

var TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../../lib'),
  domQuery = require('min-dom/lib/query'),
  coreModule = require('bpmn-js/lib/core'),
  selectionModule = require('diagram-js/lib/features/selection'),
  modelingModule = require('bpmn-js/lib/features/modeling'),
  propertiesProviderModule = require('../../../../../lib/provider/camunda'),
  camundaModdlePackage = require('../../../../../lib/provider/camunda/camunda-moddle'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

describe('service-task-delegate-properties', function() {

  var diagramXML = require('../diagrams/ServiceTaskDelegatePropertyTest.bpmn');

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

  it('should fill expression property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var delegateInput = domQuery('input[name=delegate]', propertiesPanel._container);
    var delegateRadio = domQuery('input[value=delegateExpression]', propertiesPanel._container);

    // if
    delegateRadio.click();
    TestHelper.triggerEvent(delegateRadio, 'click');
    TestHelper.triggerValue(delegateInput, 'foo');

    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get('class')).toBeUndefined();
    expect(taskBo.get('delegateExpression')).toBe('foo');


  }));

  it('should fill delegate expression property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var delegateInput = domQuery('input[name=delegate]', propertiesPanel._container);
    var expressionRadio = domQuery('input[value=expression]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(delegateInput, 'foo');
    expressionRadio.click();
    TestHelper.triggerEvent(expressionRadio, 'click');

    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get("expression")).toBe("foo");
  }));

  it('should fill class property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var delegateInput = domQuery('input[name=delegate]', propertiesPanel._container);
    var classRadio = domQuery('input[value=class]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(delegateInput, 'foo');
    classRadio.click();
    TestHelper.triggerEvent(classRadio, 'click');


    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get("class")).toBe("foo");
  }));

  it('should remove all other properties in a mutuable choice', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var delegateInput = domQuery('input[name=delegate]', propertiesPanel._container);
    var expressionRadio = domQuery('input[value=expression]', propertiesPanel._container);

    // if
    expressionRadio.click();
    TestHelper.triggerEvent(expressionRadio, 'click');
    TestHelper.triggerValue(delegateInput, 'foo');

    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get('expression')).toBe('foo');
    expect(taskBo.get('class')).toBeUndefined();

    expect(domQuery.all('input[name=delegate-resolution]:checked', propertiesPanel._container).length).toBe(1);
    expect(domQuery('input[name=delegate-resolution]:checked', propertiesPanel._container).value).toBe('expression');
    expect(domQuery('input[name=delegate-resolution]:checked', propertiesPanel._container).value).not.toBe('class');
  }));

  // FAILING TEST CASE!
  it('should remove all other properties in a mutuable choice when first changing the input', inject(function(propertiesPanel, selection, elementRegistry) {
    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var delegateInput = domQuery('input[name=delegate]', propertiesPanel._container);
    var expressionRadio = domQuery('input[value=expression]', propertiesPanel._container);

    // if
    TestHelper.triggerValue(delegateInput, 'foo');
    expressionRadio.click();
    TestHelper.triggerEvent(expressionRadio, 'click');


    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get('expression')).toBe('foo');
    expect(taskBo.get('class')).toBeUndefined();

    expect(domQuery.all('input[name=delegate-resolution]:checked', propertiesPanel._container).length).toBe(1);
    expect(domQuery('input[name=delegate-resolution]:checked', propertiesPanel._container).value).toBe('expression');
    expect(domQuery('input[name=delegate-resolution]:checked', propertiesPanel._container).value).not.toBe('class');
  }));

  it('should not apply an empty string to a property', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var taskShape = elementRegistry.get('Task_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(taskShape);

    var delegateInput = domQuery('input[name=delegate]', propertiesPanel._container);
    var classRadio = domQuery('input[value=class]', propertiesPanel._container);

    // if
    classRadio.click();
    TestHelper.triggerEvent(classRadio, 'click');
    TestHelper.triggerValue(delegateInput, '');


    // then
    var taskBo = getBusinessObject(taskShape);
    expect(taskBo.get('class')).toBeUndefined();
  }));

});
