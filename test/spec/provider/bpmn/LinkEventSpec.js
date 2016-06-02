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

describe('link-properties', function() {

  var diagramXML = require('./LinkEvent.bpmn');

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


  it('should get the name of a link event', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('IntermediateCatchEvent_1'),
        inputEl = 'input[name=link-name]',
        linkName = getBusinessObject(shape).get('eventDefinitions')[0].name;

    selection.select(shape);
    var inputField = domQuery(inputEl, propertiesPanel._container);

    expect(inputField.value).to.equal(linkName);
  }));


  it('should set the name of a link event', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('IntermediateCatchEvent_1'),
        inputEl = 'input[name=link-name]';
    selection.select(shape);
    var inputField = domQuery(inputEl, propertiesPanel._container);
    var bo = getBusinessObject(shape);

    // given
    // that the name of the link event definition is set
    expect(inputField.value).to.exist;
    expect(bo.get('eventDefinitions')[0].name).to.equal('Come to me ');

    // when
    // I change the link event definition name
    TestHelper.triggerValue(inputField, 'foo', 'change');

    var linkName = bo.get('eventDefinitions')[0].name;
    // then
    // the link event definition name is changed
    expect(inputField.value).to.equal(linkName);
    expect(linkName).to.equal('foo');
  }));
});
