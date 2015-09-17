'use strict';

var TestHelper = require('../../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

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
    container = TestContainer.get(this);
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
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask_1');
    selection.select(shape);
    var textField = domQuery('textarea[name=documentation]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(textField.value).to.equal('Task');
  }));

  it('should set the documentation for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('BoundaryEvent_1');
    selection.select(shape);
    var textField = domQuery('textarea[name=documentation]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(textField.value).to.be.empty;

    // when
    TestHelper.triggerValue(textField, 'foo', 'change');

    // then
    expect(textField.value).to.equal('foo');
    expect(businessObject.get('documentation').length).to.be.at.least(0);
    expect(businessObject.get('documentation')[0].text).to.equal('foo');
  }));

  it('should remove the documentation for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask_1');
    selection.select(shape);
    var textField = domQuery('textarea[name=documentation]', propertiesPanel._container);
    var businessObject = getBusinessObject(shape);

    // given
    expect(textField.value).to.equal("Task");

    // when
    TestHelper.triggerValue(textField, '', 'change');

    // then
    expect(textField.value).to.equal('');
    expect(businessObject.get('documentation').length).to.equal(0);
  }));
});
