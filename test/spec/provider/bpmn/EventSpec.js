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
  forEach = require('lodash/collection/forEach'),
  eventDefinitionHelper = require('../../../../lib/helper/EventDefinitionHelper');

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

  it('should exist a message definition field to an element with message def',
      inject(function(propertiesPanel, selection, elementRegistry) {

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

  it('should exists a message definition field to all compatible events and tasks',
      inject(function(propertiesPanel, selection, elementRegistry) {

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

  it('should not exist a message definition field to an element w/o definition',
      inject(function(propertiesPanel, selection, elementRegistry) {

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

  it('should be able to select an existing reference',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('IntermediateCatchEvent_1'),
        inputEl = 'input[name=messageRef]';

    // given
    selection.select(shape);
    var inputField = domQuery(inputEl, propertiesPanel._container);

    // when
    TestHelper.triggerEvent(inputField, 'click');

    var messages = domQuery.all('.djs-properties-tab.active ul > li', propertiesPanel._container);

    TestHelper.triggerEvent(messages[0], 'click');
    TestHelper.triggerEvent(inputField, 'click');

    inputField = domQuery(inputEl, propertiesPanel._container);
    var messageRef = getBusinessObject(shape).get('eventDefinitions')[0].messageRef;

    // then
    expect(messages.length).to.be.at.least(0);
    expect(inputField.value).to.equal(messages[0].textContent);
    expect(messageRef.id).to.equal(domAttr(messages[0], 'data-option-id'));
  }));

  it('should be able to clear an existing reference',
      inject(function(propertiesPanel, selection, elementRegistry) {

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

  it('should attach a signal to an element with signal def',
      inject(function(propertiesPanel, selection, elementRegistry) {

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
    var signals = domQuery.all('.djs-properties-tab.active ul > li', propertiesPanel._container);

    // then
    expect(signals.length).to.be.at.least(1);
    expect(inputField.value).to.equal(signals[1].textContent);
    expect(signalRef.id).to.equal(domAttr(signals[1], 'data-option-id'));
  }));

  it('should attach a error to an element with error def',
      inject(function(propertiesPanel, selection, elementRegistry) {

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
    var errors = domQuery.all('.djs-properties-tab.active ul > li', propertiesPanel._container);

    // then
    expect(errors.length).to.be.at.least(2);
    expect(inputField.value).to.equal(errors[1].textContent);
    expect(errorRef.id).to.equal(domAttr(errors[1], 'data-option-id'));
  }));

  it('should fetch a timer event definition for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('StartEvent_2');
    selection.select(shape);

    var timerEventDefinition = getBusinessObject(shape).get('eventDefinitions')[0];

    var textField = domQuery('input[name=timerEventDefinition]', propertiesPanel._container),
        radioInput = domQuery('input[value=timeDate]:checked', propertiesPanel._container);

    expect(radioInput.checked).to.be.true;
    expect(textField.value).to.equal(timerEventDefinition.get('timeDate').get('body'));

  }));

  it('should change the value of a timer event definition for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

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

  it('should change the type of a timer event definition for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

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

  it('should remove type and value of a timer event definition for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

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

  it('should exist an escalation definition field to all compatible events',
      inject(function(propertiesPanel, selection, elementRegistry) {

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

  it('should attach an escalation to an element with escalation def',
      inject(function(propertiesPanel, selection, elementRegistry) {

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
    var escalations = domQuery.all('.djs-properties-tab.active ul > li', propertiesPanel._container);

    // then
    expect(escalations.length).to.be.at.least(2);
    expect(inputField.value).to.equal(escalations[1].textContent);
    expect(escalationRef.id).to.equal(domAttr(escalations[1], 'data-option-id'));
  }));

  it('should fetch properties of an error element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('EndEvent_4');
    selection.select(shape);

    var errorCodeField = domQuery('input[name=errorCode]', propertiesPanel._container),
        errorNameField = domQuery('input[name=errorName]', propertiesPanel._container),
        errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(shape);

    expect(errorCodeField.value).to.equal('123');
    expect(errorNameField.value).to.equal('myError');
    expect(errorEventDefinition.errorRef.get('errorCode')).to.equal(errorCodeField.value);
    expect(errorEventDefinition.errorRef.get('name')).to.equal(errorNameField.value);

  }));

  it('should change an error code and name of an error element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('EndEvent_4');
    selection.select(shape);

    var errorCodeField = domQuery('input[name=errorCode]', propertiesPanel._container),
        errorNameField = domQuery('input[name=errorName]', propertiesPanel._container),
        errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(shape);

    // given
    expect(errorCodeField.value).to.equal('123');
    expect(errorNameField.value).to.equal('myError');
    expect(errorEventDefinition.errorRef.get('errorCode')).to.equal(errorCodeField.value);
    expect(errorEventDefinition.errorRef.get('name')).to.equal(errorNameField.value);

    // when
    TestHelper.triggerValue(errorCodeField, 'myErrorCode', 'change');
    TestHelper.triggerValue(errorNameField, 'myErrorNew', 'change');

    // then
    expect(errorCodeField.value).to.equal('myErrorCode');
    expect(errorNameField.value).to.equal('myErrorNew');
    expect(errorEventDefinition.errorRef.get('errorCode')).to.equal(errorCodeField.value);
    expect(errorEventDefinition.errorRef.get('name')).to.equal(errorNameField.value);
  }));

  it('should not remove the error name of an error element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('EndEvent_4');
    selection.select(shape);

    var syntax = 'input[name=errorName]',
        inputField = domQuery(syntax, propertiesPanel._container),
        errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(shape);

    // given
    expect(inputField.value).to.equal('myError');
    expect(errorEventDefinition.errorRef.get('name')).to.equal(inputField.value);

    // when
    TestHelper.triggerValue(inputField, '', 'change');

    // then
    expect(inputField.value).to.be.empty;
    expect(inputField.className).to.equal('invalid');
    // shouldn't change error name in business object because it is required
    expect(errorEventDefinition.errorRef.get('name')).to.equal('myError');
  }));

  it('should clear the error code of an error element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('EndEvent_4');
    selection.select(shape);

    var errorCodeField = domQuery('input[name=errorCode]', propertiesPanel._container),
        errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(shape),
        clearButton = domQuery('[data-entry=errorDefinition] > .pp-row > .field-wrapper > button[data-action=clearErrorCode]',
                                propertiesPanel._container);

    // given
    expect(errorCodeField.value).to.equal('123');
    expect(errorEventDefinition.errorRef.get('errorCode')).to.equal(errorCodeField.value);

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(errorCodeField.value).to.be.empty;
    expect(errorEventDefinition.errorRef.get('errorCode')).to.be.undefined;
  }));

  it('should fetch properties of an escalation element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('EndEvent_5');
    selection.select(shape);

    var escalationCodeField = domQuery('input[name=escalationCode]', propertiesPanel._container),
        escalationNameField = domQuery('input[name=escalationName]', propertiesPanel._container),
        escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape);

    expect(escalationCodeField.value).to.equal('123');
    expect(escalationNameField.value).to.equal('myEscalation');
    expect(escalationEventDefinition.escalationRef.get('escalationCode')).to.equal(escalationCodeField.value);
    expect(escalationEventDefinition.escalationRef.get('name')).to.equal(escalationNameField.value);

  }));

  it('should change an escalation code and name of an escalation element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('EndEvent_5');
    selection.select(shape);

    var escalationCodeField = domQuery('input[name=escalationCode]', propertiesPanel._container),
        escalationNameField = domQuery('input[name=escalationName]', propertiesPanel._container),
        escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape);

    // given
    expect(escalationCodeField.value).to.equal('123');
    expect(escalationNameField.value).to.equal('myEscalation');
    expect(escalationEventDefinition.escalationRef.get('escalationCode')).to.equal(escalationCodeField.value);
    expect(escalationEventDefinition.escalationRef.get('name')).to.equal(escalationNameField.value);

    // when
    TestHelper.triggerValue(escalationCodeField, 'myEscalationCode', 'change');
    TestHelper.triggerValue(escalationNameField, 'myEscalationNew', 'change');

    // then
    expect(escalationCodeField.value).to.equal('myEscalationCode');
    expect(escalationNameField.value).to.equal('myEscalationNew');
    expect(escalationEventDefinition.escalationRef.get('escalationCode')).to.equal(escalationCodeField.value);
    expect(escalationEventDefinition.escalationRef.get('name')).to.equal(escalationNameField.value);
  }));

  it('should not remove the escalation name of an escalation element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('EndEvent_5');
    selection.select(shape);

    var syntax = 'input[name=escalationName]',
        inputField = domQuery(syntax, propertiesPanel._container),
        escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape);

    // given
    expect(inputField.value).to.equal('myEscalation');
    expect(escalationEventDefinition.escalationRef.get('name')).to.equal(inputField.value);

    // when
    TestHelper.triggerValue(inputField, '', 'change');

    // then
    expect(inputField.value).to.be.empty;
    expect(inputField.className).to.equal('invalid');
    // shouldn't change escalation name in business object because it is required
    expect(escalationEventDefinition.escalationRef.get('name')).to.equal('myEscalation');
  }));

  it('should clear the error code of an escalation element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('EndEvent_5');
    selection.select(shape);

    var escalationCodeField = domQuery('input[name=escalationCode]', propertiesPanel._container),
        escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape),
        clearButton = domQuery('[data-entry=escalationDefinition] > .pp-row > .field-wrapper > button[data-action=clearEscalationCode]',
                                propertiesPanel._container);

    // given
    expect(escalationCodeField.value).to.equal('123');
    expect(escalationEventDefinition.escalationRef.get('escalationCode')).to.equal(escalationCodeField.value);

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(escalationCodeField.value).to.be.empty;
    expect(escalationEventDefinition.escalationRef.get('escalationCode')).to.be.undefined;
  }));

  it('should fetch name property of a message element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('EndEvent_6');
    selection.select(shape);

    var messageNameField = domQuery('input[name=messageName]', propertiesPanel._container),
        messageEventDefinition = eventDefinitionHelper.getMessageEventDefinition(shape);

    expect(messageNameField.value).to.equal('asd');
    expect(messageEventDefinition.messageRef.get('name')).to.equal(messageNameField.value);

  }));

  it('should not clear the message name of a message element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('EndEvent_6');
    selection.select(shape);

    var inputField = domQuery('input[name=messageName]', propertiesPanel._container),
        messageEventDefinition = eventDefinitionHelper.getMessageEventDefinition(shape),
        clearButton = domQuery('[data-entry=messageName] > .field-wrapper > button[data-action=clear]',
                                propertiesPanel._container);

    // given
    expect(inputField.value).to.equal('asd');
    expect(messageEventDefinition.messageRef.get('name')).to.equal(inputField.value);

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(inputField.value).to.be.empty;
    expect(inputField.className).to.equal('invalid');
    // shouldn't change message name in business object because it is required
    expect(messageEventDefinition.messageRef.get('name')).to.equal('asd');
  }));

  it('should fetch name property of a signal element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('StartEvent_4');
    selection.select(shape);

    var signalNameField = domQuery('input[name=signalName]', propertiesPanel._container),
        signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(shape);

    expect(signalNameField.value).to.equal('mySignal');
    expect(signalEventDefinition.signalRef.get('name')).to.equal(signalNameField.value);

  }));

  it('should not clear the signal name of a signal element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('StartEvent_4');
    selection.select(shape);

    var inputField = domQuery('input[name=signalName]', propertiesPanel._container),
        signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(shape),
        clearButton = domQuery('[data-entry=signalName] > .field-wrapper > button[data-action=clear]',
                                propertiesPanel._container);

    // given
    expect(inputField.value).to.equal('mySignal');
    expect(signalEventDefinition.signalRef.get('name')).to.equal(inputField.value);

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(inputField.value).to.be.empty;
    expect(inputField.className).to.equal('invalid');
    // shouldn't change signal name in business object because it is required
    expect(signalEventDefinition.signalRef.get('name')).to.equal('mySignal');
  }));

  it('should not show signal name field when no signal is selected',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('StartEvent_1');
    selection.select(shape);

    var signalNameField = domQuery('input[name=signalName]', propertiesPanel._container),
        signalSelectField = domQuery('input[name=signalRef]', propertiesPanel._container);

    expect(signalSelectField.value).to.be.empty;
    expect(signalNameField.parentElement.className).to.contain('pp-hidden');

  }));

  it('should fetch name property of a receive task element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('ReceiveTask_1');
    selection.select(shape);

    var messageNameField = domQuery('input[name=messageName]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(messageNameField.value).to.equal('asd');
    expect(businessObject.messageRef.get('name')).to.equal(messageNameField.value);

  }));

  it('should fetch error code variable of an error event definition element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('StartEvent_5');
    selection.select(shape);

    var errorCodeVar = domQuery('input[name=errorCodeVariable]', propertiesPanel._container),
        errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(shape);

    expect(errorCodeVar.value).to.equal('myErrorVariable');
    expect(errorEventDefinition.get('camunda:errorCodeVariable')).to.equal(errorCodeVar.value);

  }));

  it('should change error code variable of an error event definition element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('StartEvent_5');
    selection.select(shape);

    var errorCodeVar = domQuery('input[name=errorCodeVariable]', propertiesPanel._container),
        errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(shape);

    // given
    expect(errorCodeVar.value).to.equal('myErrorVariable');
    expect(errorEventDefinition.get('camunda:errorCodeVariable')).to.equal(errorCodeVar.value);

    // when
    TestHelper.triggerValue(errorCodeVar, 'myNewErrorVar', 'change');

    // then
    expect(errorCodeVar.value).to.equal('myNewErrorVar');
    expect(errorEventDefinition.get('camunda:errorCodeVariable')).to.equal(errorCodeVar.value);

  }));

  it('should clear error code variable of an error event definition element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('StartEvent_5');
    selection.select(shape);

    var errorCodeVar = domQuery('input[name=errorCodeVariable]', propertiesPanel._container),
        clearButton = domQuery('[data-entry=errorCodeVariable] button[data-action=clear]', propertiesPanel._container),
        errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(shape);

    // given
    expect(errorCodeVar.value).to.equal('myErrorVariable');
    expect(errorEventDefinition.get('camunda:errorCodeVariable')).to.equal(errorCodeVar.value);

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(errorCodeVar.value).to.be.empty;
    expect(errorEventDefinition.get('camunda:errorCodeVariable')).to.be.undefined;

  }));

  it('should fetch escalation code variable of an escalation event definition element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('StartEvent_6');
    selection.select(shape);

    var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container),
        escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape);

    expect(escalationCodeVar.value).to.equal('myEscalationVariable');
    expect(escalationEventDefinition.get('camunda:escalationCodeVariable')).to.equal(escalationCodeVar.value);

  }));

  it('should change escalation code variable of an escalation event definition element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('StartEvent_6');
    selection.select(shape);

    var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container),
        escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape);

    // given
    expect(escalationCodeVar.value).to.equal('myEscalationVariable');
    expect(escalationEventDefinition.get('camunda:escalationCodeVariable')).to.equal(escalationCodeVar.value);

    // when
    TestHelper.triggerValue(escalationCodeVar, 'myNewEscalationVar', 'change');

    // then
    expect(escalationCodeVar.value).to.equal('myNewEscalationVar');
    expect(escalationEventDefinition.get('camunda:escalationCodeVariable')).to.equal(escalationCodeVar.value);

  }));

  it('should clear escalation code variable of an escalation event definition element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('StartEvent_6');
    selection.select(shape);

    var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container),
        clearButton = domQuery('[data-entry=escalationCodeVariable] button[data-action=clear]', propertiesPanel._container),
        escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape);

    // given
    expect(escalationCodeVar.value).to.equal('myEscalationVariable');
    expect(escalationEventDefinition.get('camunda:escalationCodeVariable')).to.equal(escalationCodeVar.value);

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(escalationCodeVar.value).to.be.empty;
    expect(escalationEventDefinition.get('camunda:escalationCodeVariable')).to.be.undefined;

  }));

  it('should not have escalation code variable input field for an end event with escalation event definition',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('EndEvent_5');
    selection.select(shape);

    var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container);

    expect(escalationCodeVar).to.be.null;

  }));

  it('should not have error code variable input field for an end event with error event definition',
      inject(function(propertiesPanel, selection, elementRegistry) {

    propertiesPanel.attachTo(container);

    var shape = elementRegistry.get('EndEvent_4');
    selection.select(shape);

    var errorCodeVar = domQuery('input[name=errorCodeVariable]', propertiesPanel._container);

    expect(errorCodeVar).to.be.null;

  }));

});
