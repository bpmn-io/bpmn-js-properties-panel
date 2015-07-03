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

describe('user-task-properties', function() {

  var diagramXML = require('../diagrams/LinkEventPropertyTest.bpmn');

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

  it('should get the name of a link event', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('IntermediateCatchEvent_1'),
        inputEl = 'input[name=link-name]',
        linkName = getBusinessObject(shape).get('eventDefinitions')[0].name;

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);
    var inputField = domQuery(inputEl, propertiesPanel._container);

    // then
    expect(inputField.value).toBe(linkName);
  }));

  it('should set the name of a link event', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('IntermediateCatchEvent_1'),
      inputEl = 'input[name=link-name]';

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);
    var inputField = domQuery(inputEl, propertiesPanel._container);

    TestHelper.triggerValue(inputField, 'foo', 'change');

    var linkName = getBusinessObject(shape).get('eventDefinitions')[0].name;

    // then
    expect(inputField.value).toBe(linkName);
    expect(linkName).toBe('foo');
  }));
});
