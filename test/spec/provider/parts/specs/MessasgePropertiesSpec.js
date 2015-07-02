'use strict';

var TestHelper = require('../../../../TestHelper');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../../lib'),
  domQuery = require('min-dom/lib/query'),
  domAttr = require('min-dom/lib/attr'),
  coreModule = require('bpmn-js/lib/core'),
  selectionModule = require('diagram-js/lib/features/selection'),
  modelingModule = require('bpmn-js/lib/features/modeling'),
  propertiesProviderModule = require('../../../../../lib/provider/camunda'),
  camundaModdlePackage = require('../../../../../lib/provider/camunda/camunda-moddle'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  forEach = require('lodash/collection/forEach');

describe('message-properties', function() {

  var diagramXML = require('../diagrams/MessagePropertyTest.bpmn');

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

  it('should be attached to an element with message def', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('IntermediateCatchEvent_1'),
        inputEl = 'input[name=messageRef]';

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var inputFields = domQuery.all(inputEl, propertiesPanel._container);

    // then
    expect(inputFields.length).toBeGreaterThan(0);
  }));

  it('should be attached to all compatible events and tasks', inject(function(propertiesPanel, selection, elementRegistry) {
    var elements = [
      'StartEvent_1',
      'IntermediateCatchEvent_1',
      'IntermediateThrowEvent_1',
      'EndEvent_1',
      'BoundaryEvent_1',
      'ReceiveTask_1'
    ];

    forEach(elements, function(element) {
      // given
      var inputEl = 'input[name=messageRef]';

      propertiesPanel.attachTo(container);

      // when
      var shape = elementRegistry.get(element);
      selection.select(shape);

      var inputFields = domQuery.all(inputEl, propertiesPanel._container);

      // then
      expect(inputFields.length).toBeGreaterThan(0);
    });
  }));

  it('should be not attached to an element w/o message def', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('EndEvent_2'),
      inputEl = 'input[name=messageRef]';

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var inputFields = domQuery.all(inputEl, propertiesPanel._container);

    // then
    expect(inputFields.length).toBe(0);
  }));

  it('should be able to select an existing message', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('IntermediateCatchEvent_1'),
      inputEl = 'input[name=messageRef]';

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var inputField = domQuery(inputEl, propertiesPanel._container);

    TestHelper.triggerEvent(inputField, 'click');

    var messages = domQuery.all('ul[data-show=isOptionsAvailable] > li', propertiesPanel._container);

    TestHelper.triggerEvent(messages[0], 'click');
    TestHelper.triggerEvent(inputField, 'click');

    inputField = domQuery(inputEl, propertiesPanel._container);
    var messageRef = getBusinessObject(shape).get('eventDefinitions')[0].messageRef;

    // then
    expect(messages.length).toBeGreaterThan(0);
    expect(inputField.value).toBe(messages[0].textContent);
    expect(messageRef).toBe(domAttr(messages[0], 'data-option-id'));
  }));

  it('should be able to clear an existing reference', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    var shape = elementRegistry.get('IntermediateCatchEvent_1'),
      inputEl = 'input[name=messageRef]';

    propertiesPanel.attachTo(container);

    // when
    selection.select(shape);

    var inputField = domQuery(inputEl, propertiesPanel._container),
        clearButton = domQuery('button[data-action=clear]', propertiesPanel._container);

    TestHelper.triggerEvent(inputField, 'click');

    var messages = domQuery.all('ul[data-show=isOptionsAvailable] > li', propertiesPanel._container);

    TestHelper.triggerEvent(messages[0], 'click');
    TestHelper.triggerEvent(inputField, 'click');

    TestHelper.triggerEvent(clearButton, 'click');
    TestHelper.triggerEvent(inputField, 'click');

    inputField = domQuery(inputEl, propertiesPanel._container);
    var messageRef = getBusinessObject(shape).get('eventDefinitions')[0].messageRef;

    // then
    expect(inputField.value).toBe('');
    expect(messageRef).toBeUndefined();
  }));
});
