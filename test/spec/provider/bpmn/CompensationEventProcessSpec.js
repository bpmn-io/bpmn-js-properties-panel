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
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  forEach = require('lodash/collection/forEach'),
  eventDefinitionHelper = require('../../../../lib/helper/EventDefinitionHelper');

describe('compensation-event-process', function() {

  var diagramXML = require('./CompensationEventProcess.bpmn');

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


  it('should check activityRef property list of an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('IntermediateThrowEvent_1f51k5d');
    selection.select(shape);

    var selectBox = domQuery('select[name=activityRef]', propertiesPanel._container);

    expect(selectBox.options).to.have.length.of(4);
    expect(selectBox.options[0].value).to.equal('');
    expect(selectBox.options[1].value).to.equal('subProcessNotTriggeredByEvent');
    expect(selectBox.options[2].value).to.equal('withCompensationBoundaryEvent');
    expect(selectBox.options[3].value).to.equal('callActivity');

  }));

});
