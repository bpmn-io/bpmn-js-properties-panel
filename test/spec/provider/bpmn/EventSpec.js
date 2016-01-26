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


  beforeEach(inject(function(commandStack, propertiesPanel) {

    var undoButton = document.createElement('button');
    undoButton.textContent = 'UNDO';

    undoButton.addEventListener('click', function() {
      commandStack.undo();
    });

    container.appendChild(undoButton);

    propertiesPanel.attachTo(container);
  }));


  it('should exist a message definition field to an element with message def',
      inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    // that the intermediate catch event has a message ref input field
    var shape = elementRegistry.get('IntermediateCatchEvent_1'),
        selectEl = 'select[name=messages]';

    // when
    // I select the intermediate catch event
    selection.select(shape);

    // then
    var selectField = domQuery(selectEl, propertiesPanel._container);
    // the message ref input field exists and is empty
    expect(selectField).to.exist;
    expect(selectField.value).is.empty;
    expect(selectField.value).to.have.length.of.at.least(0);
  }));


  it('should exists a message definition field to all compatible events and tasks',
      inject(function(propertiesPanel, selection, elementRegistry) {

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
      var selectEl = 'select[name=messages]';

      // when
      // I select the current shape
      selection.select(shape);

      // then
      var selectBox = domQuery(selectEl, propertiesPanel._container);
      // the message ref input field exists and is empty
      expect(selectBox).to.exist;
      expect(selectBox.value).to.have.length.of.at.least(0);
    });
  }));


  it('should not exist a message definition field to an element w/o definition',
      inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    // that the element hasn't a message ref input field
    var shape = elementRegistry.get('EndEvent_2'),
        selectEl = 'select[name=messages]';

    // when
    selection.select(shape);

    // then
    var selectBox = domQuery(selectEl, propertiesPanel._container);
    // the message ref select box doesn't exist
    expect(selectBox).to.not.exist;
  }));


  it('should be able to select an existing reference',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('IntermediateCatchEvent_1'),
        selectEl = 'select[name=messages]';

    // given
    selection.select(shape);
    var selectBox = domQuery(selectEl, propertiesPanel._container);

    // when
    // select first message to set message ref
    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    var messages = domQuery.all('select[name=messages] > option', propertiesPanel._container);

    selectBox = domQuery(selectEl, propertiesPanel._container);

    // then
    expect(messages.length).to.be.at.least(0);
    expect(selectBox.value).to.equal(messages[0].value);
  }));


  it('should be able to clear an existing reference',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('IntermediateCatchEvent_1'),
        selectEl = 'select[name=messages]';

    // given
    selection.select(shape);
    var selectBox = domQuery(selectEl, propertiesPanel._container),
        messages = domQuery.all('select[name=messages] > option', propertiesPanel._container);

    // when
    // select the last message to clear the reference
    // (because the last one is always an empty message)
    selectBox.options[messages.length-1].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    selectBox = domQuery(selectEl, propertiesPanel._container);
    var messageRef = getBusinessObject(shape).get('eventDefinitions')[0].messageRef;

    // then
    expect(selectBox.value).to.equal('');
    expect(messageRef).to.be.undefined;
  }));


  it('should attach a signal to an element with signal def',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('StartEvent_1'),
        selectEl = 'select[name=signals]';

    selection.select(shape);
    var selectBox = domQuery(selectEl, propertiesPanel._container);

    // given
    expect(selectBox.value).is.empty;

    // when
    // select first signal
    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    var signalRef = getBusinessObject(shape).get('eventDefinitions')[0].signalRef;
    var signals = domQuery.all('select[name=signals] > option', propertiesPanel._container);

    // then
    expect(signals.length).to.be.at.least(1);
    expect(selectBox.value).to.equal(signals[0].value);
    expect(signalRef.id).to.equal(selectBox.value);
  }));


  it('should attach a error to an element with error def',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_2'),
        selectEl = 'select[name=errors]';

    selection.select(shape);
    var selectField = domQuery(selectEl, propertiesPanel._container);

    // given
    expect(selectField.value).is.empty;

    // when
    // select the first option
    selectField.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectField, 'change');

    var errorRef = getBusinessObject(shape).get('eventDefinitions')[0].errorRef;
    var errors = domQuery.all('select[name=errors] > option', propertiesPanel._container);

    // then
    expect(errors.length).to.be.at.least(2);
    expect(selectField.value).to.equal(errors[0].value);
    expect(errorRef.id).to.equal(selectField.value);
  }));


  it('should fetch a timer event definition for an element',
      inject(function(propertiesPanel, selection, elementRegistry) {

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

    var shape = elementRegistry.get('StartEvent_2');
    selection.select(shape);

    var timerEventDefinition = getBusinessObject(shape).get('eventDefinitions')[0];

    var clearButton = domQuery('[data-entry=timer-event-definition] button[data-action=clear]',
      propertiesPanel._container);
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
      var selectEl = 'select[name=escalations]';

      // when
      // I select the current shape
      selection.select(shape);

      // then
      var selectBox = domQuery(selectEl, propertiesPanel._container);
      // the escalation ref input field exists and is empty
      expect(selectBox).to.exist;
      expect(selectBox.value).to.be.empty;
    });
  }));


  it('should attach an escalation to an element with escalation def',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_3'),
        selectEl = 'select[name=escalations]';

    selection.select(shape);

    var selectBox = domQuery(selectEl, propertiesPanel._container);

    // given
    expect(selectBox.value).is.empty;

    // when
    // select first escalation option
    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    var escalationRef = getBusinessObject(shape).get('eventDefinitions')[0].escalationRef;
    var escalations = domQuery.all(selectEl + '> option', propertiesPanel._container);

    // then
    expect(escalations.length).to.be.at.least(2);
    expect(selectBox.value).to.equal(escalations[0].value);
    expect(escalationRef.id).to.equal(selectBox.value);
  }));


  it('should fetch properties of an error element',
      inject(function(propertiesPanel, selection, elementRegistry) {

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


  it('should remove the error name of an error element',
      inject(function(propertiesPanel, selection, elementRegistry) {

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
    expect(errorEventDefinition.errorRef.get('name')).to.equal('');
  }));


  it('should clear the error code of an error element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_4');
    selection.select(shape);

    var errorCodeField = domQuery('input[name=errorCode]', propertiesPanel._container),
        errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(shape),
        clearButton = domQuery(
          '[data-entry=errorDefinition] > .pp-row > .pp-field-wrapper > button[data-action=clearErrorCode]',
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


  it('should remove the escalation name of an escalation element',
      inject(function(propertiesPanel, selection, elementRegistry) {

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
    expect(escalationEventDefinition.escalationRef.get('name')).to.equal('');
  }));


  it('should clear the escalation code of an escalation element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_5');
    selection.select(shape);

    var escalationCodeField = domQuery('input[name=escalationCode]', propertiesPanel._container),
        escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape),
        clearButton = domQuery(
          '[data-entry=escalationDefinition] > .pp-row > .pp-field-wrapper > button[data-action=clearEscalationCode]',
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

    var shape = elementRegistry.get('EndEvent_6');
    selection.select(shape);

    var messageNameField = domQuery('input[name=messageName]', propertiesPanel._container),
        messageEventDefinition = eventDefinitionHelper.getMessageEventDefinition(shape);

    expect(messageNameField.value).to.equal('asd');
    expect(messageEventDefinition.messageRef.get('name')).to.equal(messageNameField.value);

  }));


  it('should clear the message name of a message element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_6');
    selection.select(shape);

    var inputField = domQuery('input[name=messageName]', propertiesPanel._container),
        messageEventDefinition = eventDefinitionHelper.getMessageEventDefinition(shape),
        clearButton = domQuery(
          '[data-entry=messageDefinition] > .pp-row > .pp-field-wrapper > button[data-action=clear]',
          propertiesPanel._container);

    // given
    expect(inputField.value).to.equal('asd');
    expect(messageEventDefinition.messageRef.get('name')).to.equal(inputField.value);

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(inputField.value).to.be.empty;
    expect(inputField.className).to.equal('invalid');
    expect(messageEventDefinition.messageRef.get('name')).to.equal('');
  }));


  it('should fetch name property of a signal element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('StartEvent_4');
    selection.select(shape);

    var signalNameField = domQuery('input[name=signalName]', propertiesPanel._container),
        signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(shape);

    expect(signalNameField.value).to.equal('mySignal');
    expect(signalEventDefinition.signalRef.get('name')).to.equal(signalNameField.value);

  }));


  it('should clear the signal name of a signal element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('StartEvent_4');
    selection.select(shape);

    var inputField = domQuery('input[name=signalName]', propertiesPanel._container),
        signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(shape),
        clearButton = domQuery(
          '[data-entry=signalDefinition] > .pp-row > .pp-field-wrapper > button[data-action=clear]',
          propertiesPanel._container);

    // given
    expect(inputField.value).to.equal('mySignal');
    expect(signalEventDefinition.signalRef.get('name')).to.equal(inputField.value);

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(inputField.value).to.be.empty;
    expect(inputField.className).to.equal('invalid');
    expect(signalEventDefinition.signalRef.get('name')).to.equal('');
  }));


  it('should not show signal name field when no signal is selected',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('StartEvent_1');
    selection.select(shape);

    var signalSelectField = domQuery('select[name=signals]', propertiesPanel._container),
        signalNameDiv = domQuery('[data-show=isSignalSelected]', propertiesPanel._container);

    expect(signalSelectField.value).to.be.empty;
    expect(signalNameDiv.className).to.contain('pp-hidden');

  }));


  it('should fetch name property of a receive task element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ReceiveTask_1');
    selection.select(shape);

    var messageNameField = domQuery('input[name=messageName]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(messageNameField.value).to.equal('asd');
    expect(businessObject.messageRef.get('name')).to.equal(messageNameField.value);

  }));


  it('should fetch error code variable of an error event definition element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('StartEvent_5');
    selection.select(shape);

    var errorCodeVar = domQuery('input[name=errorCodeVariable]', propertiesPanel._container),
        errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(shape);

    expect(errorCodeVar.value).to.equal('myErrorVariable');
    expect(errorEventDefinition.get('camunda:errorCodeVariable')).to.equal(errorCodeVar.value);

  }));


  it('should change error code variable of an error event definition element',
      inject(function(propertiesPanel, selection, elementRegistry) {

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

    var shape = elementRegistry.get('StartEvent_6');
    selection.select(shape);

    var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container),
        escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape);

    expect(escalationCodeVar.value).to.equal('myEscalationVariable');
    expect(escalationEventDefinition.get('camunda:escalationCodeVariable')).to.equal(escalationCodeVar.value);

  }));


  it('should change escalation code variable of an escalation event definition element',
      inject(function(propertiesPanel, selection, elementRegistry) {

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

    var shape = elementRegistry.get('StartEvent_6');
    selection.select(shape);

    var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container),
        clearButton = domQuery(
          '[data-entry=escalationCodeVariable] button[data-action=clear]', propertiesPanel._container),
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

    var shape = elementRegistry.get('EndEvent_5');
    selection.select(shape);

    var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container);

    expect(escalationCodeVar).to.be.null;

  }));


  it('should not have error code variable input field for an end event with error event definition',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_4');
    selection.select(shape);

    var errorCodeVar = domQuery('input[name=errorCodeVariable]', propertiesPanel._container);

    expect(errorCodeVar).to.be.null;

  }));


  it('should add and attach a new message to a message event definition element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_6');
    selection.select(shape);

    var syntax = 'input[name=messageName]',
        inputField = domQuery(syntax, propertiesPanel._container),
        messageEventDefinition = eventDefinitionHelper.getMessageEventDefinition(shape),
        addButton = domQuery('[data-entry=messageDefinition] button[data-action=addMessage]',
          propertiesPanel._container);

    // given
    expect(inputField.value).to.equal('asd');
    expect(messageEventDefinition.messageRef.get('name')).to.equal(inputField.value);

    // when
    TestHelper.triggerEvent(addButton, 'click');

    // then
    expect(inputField.value).not.to.be.empty;
    expect(inputField.value).not.to.equal('asd');
    // should change message name of business object
    expect(messageEventDefinition.messageRef.get('name')).to.equal(inputField.value);
  }));


  it('should add and attach a new escalation to an escalation event definition element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_5');
    selection.select(shape);

    var syntax = 'input[name=escalationName]',
        escalationNameField = domQuery(syntax, propertiesPanel._container),
        escalationCodeField = domQuery('input[name=escalationCode]', propertiesPanel._container),
        escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape),
        addButton = domQuery('[data-entry=escalationDefinition] button[data-action=addEscalation]',
          propertiesPanel._container);

    // given
    expect(escalationNameField.value).to.equal('myEscalation');
    expect(escalationEventDefinition.escalationRef.get('name')).to.equal(escalationNameField.value);
    expect(escalationCodeField.value).to.equal('123');
    expect(escalationEventDefinition.escalationRef.get('escalationCode')).to.equal(escalationCodeField.value);

    // when
    TestHelper.triggerEvent(addButton, 'click');

    // then
    expect(escalationNameField.value).not.to.be.empty;
    expect(escalationNameField.value).not.to.equal('myEscalation');
    expect(escalationCodeField.value).to.be.empty;
    // should change message name of business object
    expect(escalationEventDefinition.escalationRef.get('name')).to.equal(escalationNameField.value);
    expect(escalationEventDefinition.escalationRef.get('escalationCode')).to.be.undefined;
  }));


  it('should add and attach a new error to an error event definition element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_4');
    selection.select(shape);

    var syntax = 'input[name=errorName]',
        errorNameField = domQuery(syntax, propertiesPanel._container),
        errorCodeField = domQuery('input[name=errorCode]', propertiesPanel._container),
        errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(shape),
        addButton = domQuery('[data-entry=errorDefinition] button[data-action=addError]', propertiesPanel._container);

    // given
    expect(errorNameField.value).to.equal('myError');
    expect(errorEventDefinition.errorRef.get('name')).to.equal(errorNameField.value);
    expect(errorCodeField.value).to.equal('123');
    expect(errorEventDefinition.errorRef.get('errorCode')).to.equal(errorCodeField.value);

    // when
    TestHelper.triggerEvent(addButton, 'click');

    // then
    expect(errorNameField.value).not.to.be.empty;
    expect(errorNameField.value).not.to.equal('myError');
    expect(errorCodeField.value).to.be.empty;
    // should change message name of business object
    expect(errorEventDefinition.errorRef.get('name')).to.equal(errorNameField.value);
    expect(errorEventDefinition.errorRef.get('errorCode')).to.be.undefined;
  }));


  it('should add and attach a new signal to a signal event definition element',
      inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('StartEvent_4');
    selection.select(shape);

    var syntax = 'input[name=signalName]',
        inputField = domQuery(syntax, propertiesPanel._container),
        signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(shape),
        addButton = domQuery('[data-entry=signalDefinition] button[data-action=addSignal]', propertiesPanel._container);

    // given
    expect(inputField.value).to.equal('mySignal');
    expect(signalEventDefinition.signalRef.get('name')).to.equal(inputField.value);

    // when
    TestHelper.triggerEvent(addButton, 'click');

    // then
    expect(inputField.value).not.to.be.empty;
    expect(inputField.value).not.to.equal('asd');
    // should change message name of business object
    expect(signalEventDefinition.signalRef.get('name')).to.equal(inputField.value);
  }));

});
