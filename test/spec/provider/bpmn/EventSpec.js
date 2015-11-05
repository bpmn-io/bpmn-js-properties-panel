'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
  domQuery = require('min-dom/lib/query'),
  domAttr = require('min-dom/lib/attr'),
  coreModule = require('bpmn-js/lib/core'),
  selectionModule = require('diagram-js/lib/features/selection'),
  modelingModule = require('bpmn-js/lib/features/modeling'),
  propertiesProviderModule = require('../../../../lib/provider/bpmn'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  forEach = require('lodash/collection/forEach');

describe('event-properties', function() {

  var diagramXML = require('./Event.bpmn');

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


  beforeEach(inject(function(commandStack) {

    var undoButton = document.createElement('button');
    undoButton.textContent = 'UNDO';

    undoButton.addEventListener('click', function() {
      commandStack.undo();
    });

    container.appendChild(undoButton);
  }));

  it('should exist a message definition field to an element with message def', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    // given
    // that the intermediate catch event has a message ref input field
    var shape = elementRegistry.get('IntermediateCatchEvent_1'),
        inputEl = 'input[name=messageRef]';

    // when
    // I select the intermediate catch event
    selection.select(shape);

    // then
    var inputField = domQuery(inputEl, propertiesPanel._container);
    // the message ref input field exists and is empty
    expect(inputField).to.exist;
    expect(inputField.value).is.empty;
    expect(inputField.value).to.have.length.of.at.least(0);
  }));

  it('should exists a message definition field to all compatible events and tasks', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var elements = [
      'IntermediateCatchEvent_1',
      'IntermediateThrowEvent_1',
      'EndEvent_1',
      'BoundaryEvent_1',
      'ReceiveTask_1'
    ];

    forEach(elements, function(element) {
      // given
      // that the element has a message ref input field
      var shape = elementRegistry.get(element);
      var inputEl = 'input[name=messageRef]';

      // when
      // I select the current shape
      selection.select(shape);

      // then
      var inputField = domQuery(inputEl, propertiesPanel._container);
      // the message ref input field exists and is empty
      expect(inputField).to.exist;
      expect(inputField.value).to.have.length.of.at.least(0);
    });
  }));

  it('should not exist a message definition field to an element w/o definition', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    // given
    // that the element hasn't a message ref input field
    var shape = elementRegistry.get('EndEvent_2'),
        inputEl = 'input[name=messageRef]';

    // when
    selection.select(shape);

    // then
    var inputField = domQuery(inputEl, propertiesPanel._container);
    // the message ref input field doesn't exist
    expect(inputField).to.not.exist;
  }));

  it('should be able to select an existing reference', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('IntermediateCatchEvent_1'),
        inputEl = 'input[name=messageRef]';

    // given
    selection.select(shape);
    var inputField = domQuery(inputEl, propertiesPanel._container);

    // when
    TestHelper.triggerEvent(inputField, 'click');

    var messages = domQuery.all('ul > li', propertiesPanel._container);

    TestHelper.triggerEvent(messages[0], 'click');
    TestHelper.triggerEvent(inputField, 'click');

    inputField = domQuery(inputEl, propertiesPanel._container);
    var messageRef = getBusinessObject(shape).get('eventDefinitions')[0].messageRef;

    // then
    expect(messages.length).to.be.at.least(0);
    expect(inputField.value).to.equal(messages[0].textContent);
    expect(messageRef.id).to.equal(domAttr(messages[0], 'data-option-id'));
  }));

  it('should be able to clear an existing reference', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('IntermediateCatchEvent_1'),
        inputEl = 'input[name=messageRef]';

    // given
    selection.select(shape);
    var inputField = domQuery(inputEl, propertiesPanel._container),
        clearButton = domQuery('[data-entry=selectMessage] button[data-action=clear]', propertiesPanel._container);

    // when
    TestHelper.triggerEvent(inputField, 'click');

    var messages = domQuery.all('ul > li', propertiesPanel._container);

    TestHelper.triggerEvent(messages[0], 'click');
    TestHelper.triggerEvent(inputField, 'click');

    TestHelper.triggerEvent(clearButton, 'click');
    TestHelper.triggerEvent(inputField, 'click');

    inputField = domQuery(inputEl, propertiesPanel._container);
    var messageRef = getBusinessObject(shape).get('eventDefinitions')[0].messageRef;

    // then
    expect(inputField.value).to.equal('');
    expect(messageRef).to.be.undefined;
  }));

  it('should attach a signal to an element with signal def', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('StartEvent_1'),
        inputEl = 'input[name=signalRef]';
    selection.select(shape);
    var inputField = domQuery(inputEl, propertiesPanel._container);

    // given
    expect(inputField.value).is.empty;

    // when
    TestHelper.triggerValue(inputField, 'Foo', 'change');
    TestHelper.triggerEvent(inputField, 'click');

    var signalRef = getBusinessObject(shape).get('eventDefinitions')[0].signalRef;
    var signals = domQuery.all('ul > li', propertiesPanel._container);

    // then
    expect(signals.length).to.be.at.least(1);
    expect(inputField.value).to.equal(signals[0].textContent);
    expect(signalRef.id).to.equal(domAttr(signals[0], 'data-option-id'));
  }));

  it('should attach a error to an element with error def', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('EndEvent_2'),
        inputEl = 'input[name=errorRef]';
    selection.select(shape);
    var inputField = domQuery(inputEl, propertiesPanel._container);

    // given
    expect(inputField.value).is.empty;

    // when
    TestHelper.triggerValue(inputField, 'Foo', 'change');
    TestHelper.triggerEvent(inputField, 'click');

    var errorRef = getBusinessObject(shape).get('eventDefinitions')[0].errorRef;
    var errors = domQuery.all('ul > li', propertiesPanel._container);

    // then
    expect(errors.length).to.be.at.least(2);
    expect(inputField.value).to.equal(errors[1].textContent);
    expect(errorRef.id).to.equal(domAttr(errors[1], 'data-option-id'));
  }));

  it('should fetch a timer event definition for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('StartEvent_2');
    selection.select(shape);

    var timerEventDefinition = getBusinessObject(shape).get('eventDefinitions')[0];

    var textField = domQuery('input[name=timerEventDefinition]', propertiesPanel._container),
        radioInput = domQuery('input[value=timeDate]:checked', propertiesPanel._container);

    expect(radioInput.checked).to.be.true;
    expect(textField.value).to.equal(timerEventDefinition.get('timeDate').get('body'));

  }));

  it('should change the value of a timer event definition for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('StartEvent_2');
    selection.select(shape);

    var timerEventDefinition = getBusinessObject(shape).get('eventDefinitions')[0];

    var inputField = domQuery('input[name=timerEventDefinition]', propertiesPanel._container),
        radioInput = domQuery('input[value=timeDate]:checked', propertiesPanel._container);

    // given
    expect(radioInput.checked).to.be.true;
    expect(inputField.value).to.equal(timerEventDefinition.get('timeDate').get('body'));

    // when
    TestHelper.triggerValue(inputField, '2014-08-03T19:36:00Z', 'change');

    // then
    expect(inputField.value).to.equal('2014-08-03T19:36:00Z');
    expect(inputField.value).to.equal(timerEventDefinition.get('timeDate').get('body'));

  }));

  it('should change the type of a timer event definition for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('StartEvent_2');
    selection.select(shape);

    var timerEventDefinition = getBusinessObject(shape).get('eventDefinitions')[0];

    var inputField = domQuery('input[name=timerEventDefinition]', propertiesPanel._container),
        radioInput = domQuery('input[value=timeDuration]', propertiesPanel._container);

    // given
    expect(radioInput.checked).to.be.false;
    expect(inputField.value).to.equal(timerEventDefinition.get('timeDate').get('body'));

    // when
    TestHelper.triggerEvent(radioInput, 'click');

    // then
    expect(radioInput.checked).to.be.true;
    expect(inputField.value).to.equal(timerEventDefinition.get('timeDuration').get('body'));

  }));

  it('should remove type and value of a timer event definition for an element', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('StartEvent_2');
    selection.select(shape);

    var timerEventDefinition = getBusinessObject(shape).get('eventDefinitions')[0];

    var clearButton = domQuery('[data-entry=timer-event-definition] button[data-action=clear]', propertiesPanel._container);
    var inputField = domQuery('input[name=timerEventDefinition]', propertiesPanel._container),
        radioInput = domQuery('input[value=timeDate]', propertiesPanel._container);

    // given
    expect(radioInput.checked).to.be.true;
    expect(inputField.value).to.equal(timerEventDefinition.get('timeDate').get('body'));

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(radioInput.checked).to.be.false;
    expect(domQuery.all('input[name=timerEventDefinitionType]:checked', propertiesPanel._container).length).to.equal(0);
    expect(inputField.value).to.be.empty;
    expect(timerEventDefinition.get('timeDate')).to.be.undefined;

  }));

  it('should exist an escalation definition field to all compatible events', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var elements = [
      'StartEvent_3',
      'BoundaryEvent_2',
      'IntermediateThrowEvent_2',
      'EndEvent_3'
    ];

    forEach(elements, function(element) {
      // given
      // that the element has a message ref input field
      var shape = elementRegistry.get(element);
      var inputEl = 'input[name=escalationRef]';

      // when
      // I select the current shape
      selection.select(shape);

      // then
      var inputField = domQuery(inputEl, propertiesPanel._container);
      // the escalation ref input field exists and is empty
      expect(inputField).to.exist;
      expect(inputField.value).to.be.empty;
    });
  }));

  it('should attach an escalation to an element with escalation def', inject(function(propertiesPanel, selection, elementRegistry) {
    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('EndEvent_3'),
        inputEl = 'input[name=escalationRef]';

    selection.select(shape);

    var inputField = domQuery(inputEl, propertiesPanel._container);

    // given
    expect(inputField.value).is.empty;

    // when
    TestHelper.triggerValue(inputField, 'foo', 'change');
    TestHelper.triggerEvent(inputField, 'click');

    var escalationRef = getBusinessObject(shape).get('eventDefinitions')[0].escalationRef;
    var escalations = domQuery.all('ul > li', propertiesPanel._container);

    // then
    expect(escalations.length).to.be.at.least(1);
    expect(inputField.value).to.equal(escalations[0].textContent);
    expect(escalationRef.id).to.equal(domAttr(escalations[0], 'data-option-id'));
  }));

});
