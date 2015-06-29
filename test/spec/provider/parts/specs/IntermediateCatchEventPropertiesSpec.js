'use strict';

var TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../../lib'),
  domQuery = domQuery = require('min-dom/lib/query'),
  coreModule = require('bpmn-js/lib/core'),
  selectionModule = require('diagram-js/lib/features/selection'),
  modelingModule = require('bpmn-js/lib/features/modeling'),
  propertiesProviderModule = require('../../../../../lib/provider/camunda'),
  camundaModdlePackage = require('../../../../../lib/provider/camunda/camunda-moddle'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

describe('intermediate-catch-event-properties', function() {

  var diagramXML = require('../diagrams/IntermediateMessageCatchEventPropertyTest.bpmn');

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

  iit('should list available messages', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('IntermediateCatchEvent_1');

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);
    /*
    var asyncBefore = domQuery('input[name=asyncBefore]', propertiesPanel._container),
        taskBo      = getBusinessObject(shape);

    // if
    expect(taskBo.get("asyncBefore")).toBeFalsy();
    TestHelper.triggerEvent(asyncBefore, 'click');

    // then
    taskBo = getBusinessObject(shape);
    expect(taskBo.get("asyncBefore")).toBeTruthy();
    */
  }));
});
