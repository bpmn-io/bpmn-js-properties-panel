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

describe('start-event-inititator', function() {

  var diagramXML = require('./StartEventInitiator.bpmn');

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
    modules : testModules,
    moddleExtensions : { camunda : camundaModdlePackage }
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


  it('should fetch the initiator attribute', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var startEvenShape = elementRegistry.get('StartEvent');

    // when
    selection.select(startEvenShape);

    var initiatorField = domQuery('input[name=initiator]', propertiesPanel._container),
        bo = getBusinessObject(startEvenShape);

    // then
    expect(initiatorField.value).to.equal('kermit');
    expect(bo.get('camunda:initiator')).to.equal(initiatorField.value);
  }));


  it('should set the initiator attribute', inject(function(propertiesPanel, selection, elementRegistry) {

    var startEvenShape = elementRegistry.get('StartEvent');

    // given
    selection.select(startEvenShape);
    var initiatorField = domQuery('input[name=initiator]', propertiesPanel._container);

    // when
    TestHelper.triggerValue(initiatorField, 'asd', 'change');
    var bo = getBusinessObject(startEvenShape);

    // then
    expect(bo.get('camunda:initiator')).to.equal('asd');
  }));


  it('should not show the initiator field on sub process', inject(function(propertiesPanel, selection, elementRegistry) {

    var startEvenShape = elementRegistry.get('StartEvent');

    // given
    selection.select(startEvenShape);
    var initiatorField = domQuery('input[name=initiator]', propertiesPanel._container);

    // when
    TestHelper.triggerValue(initiatorField, '', 'change');
    var bo = getBusinessObject(startEvenShape);

    // then
    expect(bo.get('camunda:initiator')).to.be.undefined;
  }));


  it('should remove the empty initiator field', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var startEvenShape = elementRegistry.get('SubStartEvent');

    // when
    selection.select(startEvenShape);
    var initiatorField = domQuery('input[name=initiator]', propertiesPanel._container);

    // then
    expect(initiatorField).to.be.not.ok;
  }));
});
