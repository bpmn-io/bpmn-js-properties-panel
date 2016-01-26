'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
  domQuery = require('min-dom/lib/query'),
  coreModule = require('bpmn-js/lib/core'),
  selectionModule = require('diagram-js/lib/features/selection'),
  modelingModule = require('bpmn-js/lib/features/modeling'),
  propertiesProviderModule = require('../../../../lib/provider/bpmn'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

describe('documentation-properties', function() {

  var diagramXML = require('./Documentation.bpmn');

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
    modules: testModules
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


  it('should fetch the documentation for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ServiceTask_1');
    selection.select(shape);
    var textField = domQuery('textarea[name=documentation]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(textField.value).to.equal('Task');
  }));


  it('should set the documentation for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('BoundaryEvent_1');
    selection.select(shape);
    var textField = domQuery('textarea[name=documentation]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    // given
    expect(textField.value).to.be.empty;

    // when
    TestHelper.triggerValue(textField, 'foo', 'change');

    var documentation = businessObject.get('documentation');

    // then
    expect(textField.value).to.equal('foo');
    expect(documentation.length).to.be.at.least(0);
    expect(documentation[0].text).to.equal('foo');
    expect(documentation[0].$instanceOf('bpmn:Documentation')).to.be.true;
  }));


  it('should remove the documentation for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

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
