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

describe('process-participant-properties', function() {

  var diagramXML = require('./ProcessParticipant.bpmn');

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


  it('should set the isExecutable property of a process',
      inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('Participant_1');

    selection.select(shape);

    var isExecutable = domQuery('input[name=isExecutable]', propertiesPanel._container),
        taskBo        = getBusinessObject(shape).get('processRef');

    // when
    TestHelper.triggerEvent(isExecutable, 'click');

    // then
    expect(taskBo.get("isExecutable")).to.be.ok;
  }));


  it('should get the name of a process in a participant',
      inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('_Participant_2');

    // when
    selection.select(shape);

    var name = domQuery('input[name=name]', propertiesPanel._container),
        shapeBo = getBusinessObject(shape).get('processRef');

    // then
    expect(shapeBo.get('name')).to.equal(name.value);
  }));


  it('should set the name of a process in a participant',
      inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('_Participant_2');

    selection.select(shape);

    var name = domQuery('input[name=name]', propertiesPanel._container),
        shapeBo = getBusinessObject(shape).get('processRef');

    // when
    TestHelper.triggerValue(name, 'Foo', 'change');

    // then
    expect(shapeBo.get('name')).to.equal('Foo');
  }));


  it('should get the id of a process in a participant',
    inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('_Participant_2');

    // when
    selection.select(shape);

    var id = domQuery('input[name=processId]', propertiesPanel._container),
        shapeBo = getBusinessObject(shape).get('processRef');

    // then
    expect(shapeBo.get('id')).to.equal(id.value);
  }));


  it('should set the id of a process in a participant',
      inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('_Participant_2');

    selection.select(shape);

    var name = domQuery('input[name=processId]', propertiesPanel._container),
        shapeBo = getBusinessObject(shape).get('processRef');

    // when
    TestHelper.triggerValue(name, 'Foo', 'change');

    // then
    expect(shapeBo.get('id')).to.equal('Foo');
  }));

});
