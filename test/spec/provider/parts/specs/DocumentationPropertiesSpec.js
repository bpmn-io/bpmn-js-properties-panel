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

describe('documentation-properties', function() {

  var diagramXML = require('../diagrams/DocumentationPropertyTest.bpmn');

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

  it('should fetch the documentation for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('ServiceTask_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var textField = domQuery('textarea[name=documentation]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // then
    expect(textField.value).toBe(businessObject.get('documentation')[0].text);
  }));

  it('should set the documentation for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('ServiceTask_1');

    propertiesPanel.attachTo(container);

    // then
    selection.select(shape);

    var textField = domQuery('textarea[name=documentation]', propertiesPanel._container);

    TestHelper.triggerValue(textField, 'foo', 'change');

    var businessObject = getBusinessObject(shape);

    expect(textField.value).toBe('foo');
    expect(businessObject.get('documentation').length).toBeGreaterThan(0);
    expect(businessObject.get('documentation')[0].text).toBe('foo');
  }));

  it('should remove the documentation for an element', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('ServiceTask_1');

    propertiesPanel.attachTo(container);

    // then
    selection.select(shape);

    var textField = domQuery('textarea[name=documentation]', propertiesPanel._container);

    TestHelper.triggerValue(textField, '', 'change');

    var businessObject = getBusinessObject(shape);

    expect(textField.value).toBe('');
    expect(businessObject.get('documentation').length).toBe(0);
  }));
});
