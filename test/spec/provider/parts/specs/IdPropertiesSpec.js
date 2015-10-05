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

describe('id-properties', function() {

  var diagramXML = require('../diagrams/IdPropertyTest.bpmn');

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

  it('should fetch the id for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask_1');
    selection.select(shape);

    var textField = domQuery('input[name=id]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(textField.value).to.equal(businessObject.get('id'));
  }));

  it('should set the id for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('StartEvent_1');
    selection.select(shape);

    var textField = domQuery('input[name=id]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(textField.value).to.equal('StartEvent_1');

    // when
    TestHelper.triggerValue(textField, 'foo', 'change');

    // then
    expect(textField.value).to.equal('foo');
    expect(businessObject.get('id')).to.equal('foo');
  }));

  it('should not remove the id for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ServiceTask_1');
    selection.select(shape);

    var textField = domQuery('input[name=id]', propertiesPanel._container);
    var businessObject = getBusinessObject(shape);

    // given
    expect(textField.value).to.equal('ServiceTask_1');
    expect(textField.getAttribute('class')).to.be.null;

    // when
    TestHelper.triggerValue(textField, '', 'change');

    // then
    expect(textField.value).to.equal('');
    expect(textField.getAttribute('class')).to.equal('invalid');
    expect(businessObject.get('id')).to.equal('ServiceTask_1');
  }));
});
