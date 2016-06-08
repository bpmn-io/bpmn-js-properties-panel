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

describe('collaboration-listener-properties', function() {

  var diagramXML = require('./ExecutionListenerCollaborationTest.bpmn');

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


  it('should fetch execution listener properties for a collaboration process', inject(function(propertiesPanel, selection, elementRegistry) {

    var taskShape = elementRegistry.get('Participant_One');
    selection.select(taskShape);

    var bo = getBusinessObject(taskShape),
        eventTypes = domQuery.all('select[name=eventType]', propertiesPanel._container),
        listenerTypes = domQuery.all('select[name=listenerType]', propertiesPanel._container),
        listenerValues = domQuery.all('input[name=listenerValue]', propertiesPanel._container);

    expect(bo.processRef.extensionElements.values.length).to.equal(1);
    expect(eventTypes.length).to.equal(1);
    expect(listenerTypes.length).to.equal(1);
    expect(listenerValues.length).to.equal(1);

    var extensionElementsValues = bo.processRef.extensionElements.values;
    // execution listener 1
    expect(eventTypes[0].value).to.equal('start');
    expect(listenerTypes[0].value).to.equal('expression');
    expect(listenerValues[0].value).to.equal('userOne');
    expect(extensionElementsValues[0].get('event')).to.equal(eventTypes[0].value);
    expect(extensionElementsValues[0].get('expression')).to.equal(listenerValues[0].value);

  }));

});
