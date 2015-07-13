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

describe('process-participant-properties', function() {

  var diagramXML = require('../diagrams/ProcessPropertyParticipantTest.bpmn');

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

  it('should set the isExecutable property of a process', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('Participant_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var isExecutable = domQuery('input[name=isExecutable]', propertiesPanel._container),
        taskBo        = getBusinessObject(shape).get('processRef');

    // if
    expect(taskBo.get("isExecutable")).toBeFalsy();
    TestHelper.triggerEvent(isExecutable, 'click');

    // then
    expect(taskBo.get("isExecutable")).toBeTruthy();
  }));

  it('should get the name of a process in a participant', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('_Participant_2');

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var name = domQuery('input[name=name]', propertiesPanel._container),
        shapeBo = getBusinessObject(shape).get('processRef');

    // then
    expect(shapeBo.get('name')).toBe('Process 1');
  }));

  it('should set the name of a process in a participant', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('_Participant_2');

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var name = domQuery('input[name=name]', propertiesPanel._container),
      shapeBo = getBusinessObject(shape).get('processRef');

    TestHelper.triggerValue(name, 'Foo', 'change');

    // then
    expect(shapeBo.get('name')).toBe('Foo');
  }));
});
