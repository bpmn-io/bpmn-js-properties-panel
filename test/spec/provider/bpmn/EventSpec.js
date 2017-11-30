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


  it('should exist a message definition field to an element with message def', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    // that the intermediate catch event has a message ref input field
    var shape = elementRegistry.get('IntermediateCatchEvent_1'),
        selectEl = 'div[data-entry=event-definitions-message] select[name=selectedElement]';

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


  it('should exists a message definition field to all compatible events and tasks', inject(function(propertiesPanel, selection, elementRegistry) {

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
      var selectEl = 'div[data-entry=event-definitions-message] select[name=selectedElement]';

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


  it('should not exist a message definition field to an element w/o definition', inject(function(propertiesPanel, selection, elementRegistry) {

    // given
    // that the element hasn't a message ref input field
    var shape = elementRegistry.get('EndEvent_2'),
        selectEl = 'div[data-entry=event-definitions-message] select[name=selectedElement]';

    // when
    selection.select(shape);

    // then
    var selectBox = domQuery(selectEl, propertiesPanel._container);
    // the message ref select box doesn't exist
    expect(selectBox).to.not.exist;
  }));


  it('should be able to select an existing reference', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('IntermediateCatchEvent_1'),
        selectEl = 'div[data-entry=event-definitions-message] select[name=selectedElement]';

    // given
    selection.select(shape);
    var selectBox = domQuery(selectEl, propertiesPanel._container);

    // when
    // select first message to set message ref
    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    var messages = domQuery.all('div[data-entry=event-definitions-message] select[name=selectedElement] > option', propertiesPanel._container);

    selectBox = domQuery(selectEl, propertiesPanel._container);

    // then
    expect(messages.length).to.be.at.least(0);
    expect(selectBox.value).to.equal(messages[0].value);
  }));


  it('should be able to clear an existing message reference', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_6'),
        selectEl = 'div[data-entry=event-definitions-message] select[name=selectedElement]',
        messageRef;

    // given
    selection.select(shape);

    var selectBox = domQuery(selectEl, propertiesPanel._container),
        messages = domQuery.all('div[data-entry=event-definitions-message] select[name=selectedElement] > option', propertiesPanel._container);

    // assume
    messageRef = getBusinessObject(shape).get('eventDefinitions')[0].messageRef;
    expect(messageRef.id).to.equal('Message_1');

    // when
    // select the last message to clear the reference
    // (because the last one is always an empty message)
    selectBox.options[messages.length-1].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    selectBox = domQuery(selectEl, propertiesPanel._container);

    // then
    messageRef = getBusinessObject(shape).get('eventDefinitions')[0].messageRef;

    expect(selectBox.value).to.equal('');
    expect(messageRef).to.be.undefined;
  }));


  it('should be able to clear an existing message reference on a receive task', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ReceiveTask_1'),
        selectEl = 'div[data-entry=event-definitions-message] select[name=selectedElement]',
        messageRef;

    // given
    selection.select(shape);

    var selectBox = domQuery(selectEl, propertiesPanel._container),
        messages = domQuery.all(selectEl + ' > option', propertiesPanel._container);

    // assume
    messageRef = getBusinessObject(shape).messageRef;
    expect(messageRef.id).to.equal('Message_1');

    // when
    // select the last message to clear the reference
    // (because the last one is always an empty message)
    selectBox.options[messages.length-1].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    selectBox = domQuery(selectEl, propertiesPanel._container);

    // then
    messageRef = getBusinessObject(shape).messageRef;

    expect(selectBox.value).to.equal('');
    expect(messageRef).to.be.undefined;
  }));


  it('should attach a signal to an element with signal def', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('StartEvent_1'),
        selectEl = 'div[data-entry=event-definitions-signal] select[name=selectedElement]';

    selection.select(shape);
    var selectBox = domQuery(selectEl, propertiesPanel._container);

    // given
    expect(selectBox.value).is.empty;

    // when
    // select first signal
    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    var signalRef = getBusinessObject(shape).get('eventDefinitions')[0].signalRef;
    var signals = domQuery.all('div[data-entry=event-definitions-signal] select[name=selectedElement] > option', propertiesPanel._container);

    // then
    expect(signals.length).to.be.at.least(1);
    expect(selectBox.value).to.equal(signals[0].value);
    expect(signalRef.id).to.equal(selectBox.value);
  }));


  it('should be able to clear an existing signal reference', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('StartEvent_4'),
        selectEl = 'div[data-entry=event-definitions-signal] select[name=selectedElement]',
        signalRef;

    // given
    selection.select(shape);

    var selectBox = domQuery(selectEl, propertiesPanel._container),
        signals = domQuery.all('div[data-entry=event-definitions-signal] select[name=selectedElement] > option', propertiesPanel._container);

    // assume
    signalRef = getBusinessObject(shape).get('eventDefinitions')[0].signalRef;
    expect(signalRef.id).to.equal('Signal_1');

    // when
    // select the last signal to clear the reference
    // (because the last one is always an empty signal)
    selectBox.options[signals.length-1].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    selectBox = domQuery(selectEl, propertiesPanel._container);

    // then
    signalRef = getBusinessObject(shape).get('eventDefinitions')[0].signalRef;

    expect(selectBox.value).to.equal('');
    expect(signalRef).to.be.undefined;
  }));


  it('should exist an escalation definition field to all compatible events', inject(function(propertiesPanel, selection, elementRegistry) {

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
      var selectEl = 'div[data-entry=event-definitions-escalation] select[name=selectedElement]';

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


  it('should attach an escalation to an element with escalation def', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_3'),
        selectEl = 'div[data-entry=event-definitions-escalation] select[name=selectedElement]';

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


  it('should fetch properties of an escalation element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_5');
    selection.select(shape);

    var escalationCodeField = domQuery('div[data-entry=escalation-element-code] input[name=escalationCode]', propertiesPanel._container),
        escalationNameField = domQuery('div[data-entry=escalation-element-name] input[name=name]', propertiesPanel._container),
        escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape);

    expect(escalationCodeField.value).to.equal('123');
    expect(escalationNameField.value).to.equal('myEscalation');
    expect(escalationEventDefinition.escalationRef.get('escalationCode')).to.equal(escalationCodeField.value);
    expect(escalationEventDefinition.escalationRef.get('name')).to.equal(escalationNameField.value);

  }));


  it('should change an escalation code and name of an escalation element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_5');
    selection.select(shape);

    var escalationCodeField = domQuery('div[data-entry=escalation-element-code] input[name=escalationCode]', propertiesPanel._container),
        escalationNameField = domQuery('div[data-entry=escalation-element-name] input[name=name]', propertiesPanel._container),
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


  it('should remove the escalation name of an escalation element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_5');
    selection.select(shape);

    var syntax = 'div[data-entry=escalation-element-name] input[name=name]',
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
    expect(escalationEventDefinition.escalationRef.get('name')).not.to.be.ok;
  }));


  it('should clear the escalation code of an escalation element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_5');
    selection.select(shape);

    var escalationCodeField = domQuery('div[data-entry=escalation-element-code] input[name=escalationCode]', propertiesPanel._container),
        escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape),
        clearButton = domQuery(
          '[data-entry=escalation-element-code] button[data-action=clear]',
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


  it('should fetch name property of a message element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_6');
    selection.select(shape);

    var messageNameField = domQuery('div[data-entry=message-element-name] input[name=name]', propertiesPanel._container),
        messageEventDefinition = eventDefinitionHelper.getMessageEventDefinition(shape);

    expect(messageNameField.value).to.equal('asd');
    expect(messageEventDefinition.messageRef.get('name')).to.equal(messageNameField.value);

  }));


  it('should clear the message name of a message element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_6');
    selection.select(shape);

    var inputField = domQuery('div[data-entry=message-element-name] input[name=name]', propertiesPanel._container),
        messageEventDefinition = eventDefinitionHelper.getMessageEventDefinition(shape),
        clearButton = domQuery(
          '[data-entry=message-element-name] button[data-action=clear]',
          propertiesPanel._container);

    // given
    expect(inputField.value).to.equal('asd');
    expect(messageEventDefinition.messageRef.get('name')).to.equal(inputField.value);

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(inputField.value).to.be.empty;
    expect(inputField.className).to.equal('invalid');
    expect(messageEventDefinition.messageRef.get('name')).to.be.undefined;
  }));


  it('should fetch name property of a signal element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('StartEvent_4');
    selection.select(shape);

    var signalNameField = domQuery('div[data-entry=signal-element-name] input[name=name]', propertiesPanel._container),
        signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(shape);

    expect(signalNameField.value).to.equal('mySignal');
    expect(signalEventDefinition.signalRef.get('name')).to.equal(signalNameField.value);

  }));


  it('should clear the signal name of a signal element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('StartEvent_4');
    selection.select(shape);

    var inputField = domQuery('div[data-entry=signal-element-name] input[name=name]', propertiesPanel._container),
        signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(shape),
        clearButton = domQuery(
          '[data-entry=signal-element-name] button[data-action=clear]',
          propertiesPanel._container);

    // given
    expect(inputField.value).to.equal('mySignal');
    expect(signalEventDefinition.signalRef.get('name')).to.equal(inputField.value);

    // when
    TestHelper.triggerEvent(clearButton, 'click');

    // then
    expect(inputField.value).to.be.empty;
    expect(inputField.className).to.equal('invalid');
    expect(signalEventDefinition.signalRef.get('name')).to.be.undefined;
  }));


  it('should not show signal name field when no signal is selected', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('StartEvent_1');
    selection.select(shape);

    var signalSelectField = domQuery('div[data-entry=event-definitions-signal] select[name=selectedElement]', propertiesPanel._container),
        signalNameDiv = domQuery('div[data-entry=signal-element-name] input[name=name]', propertiesPanel._container);

    expect(signalSelectField.value).to.be.empty;
    expect(signalNameDiv.parentElement.className).to.contain('bpp-hidden');

  }));


  it('should fetch name property of a receive task element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('ReceiveTask_1');
    selection.select(shape);

    var messageNameField = domQuery('div[data-entry=message-element-name] input[name=name]', propertiesPanel._container),
        businessObject = getBusinessObject(shape);

    expect(messageNameField.value).to.equal('asd');
    expect(businessObject.messageRef.get('name')).to.equal(messageNameField.value);

  }));


  it('should fetch escalation code variable of an escalation event definition element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('StartEvent_6');
    selection.select(shape);

    var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container),
        escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape);

    expect(escalationCodeVar.value).to.equal('myEscalationVariable');
    expect(escalationEventDefinition.get('camunda:escalationCodeVariable')).to.equal(escalationCodeVar.value);

  }));


  it('should change escalation code variable of an escalation event definition element', inject(function(propertiesPanel, selection, elementRegistry) {

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


  it('should clear escalation code variable of an escalation event definition element', inject(function(propertiesPanel, selection, elementRegistry) {

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


  it('should not have escalation code variable input field for an end event with escalation event definition', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_5');
    selection.select(shape);

    var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container);

    expect(escalationCodeVar).to.be.null;

  }));


  it('should add and attach a new message to a message event definition element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_6');
    selection.select(shape);

    var syntax = 'div[data-entry=message-element-name] input[name=name]',
        inputField = domQuery(syntax, propertiesPanel._container),
        messageEventDefinition = eventDefinitionHelper.getMessageEventDefinition(shape),
        addButton = domQuery('[data-entry=event-definitions-message] button[data-action=addElement]',
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


  it('should add and attach a new escalation to an escalation event definition element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('EndEvent_5');
    selection.select(shape);

    var syntax = 'div[data-entry=escalation-element-name] input[name=name]',
        escalationNameField = domQuery(syntax, propertiesPanel._container),
        escalationCodeField = domQuery('div[data-entry=escalation-element-code] input[name=escalationCode]', propertiesPanel._container),
        escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape),
        addButton = domQuery('[data-entry=event-definitions-escalation] button[data-action=addElement]',
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


  it('should add and attach a new signal to a signal event definition element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('StartEvent_4');
    selection.select(shape);

    var syntax = 'div[data-entry=signal-element-name] input[name=name]',
        inputField = domQuery(syntax, propertiesPanel._container),
        signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(shape),
        addButton = domQuery('[data-entry=event-definitions-signal] button[data-action=addElement]', propertiesPanel._container);

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


  it('should fetch compensation event properties of an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CompensationIntermediateThrowEvent_1');
    selection.select(shape);

    var checkBox = domQuery('input[name=waitForCompletion]', propertiesPanel._container),
        selectBox = domQuery('select[name=activityRef]', propertiesPanel._container);

    expect(checkBox.checked).to.be.true;
    expect(selectBox.value).to.equal('ReceiveTask_1');

  }));


  it('should set wait for completion property for a compensation end event', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CompensationEndEvent_1');
    selection.select(shape);

    var checkBox = domQuery('input[name=waitForCompletion]', propertiesPanel._container),
        bo = getBusinessObject(shape);

    // given
    expect(checkBox.checked).to.be.false;

    // when
    TestHelper.triggerEvent(checkBox, 'click');

    // then
    expect(checkBox.checked).to.be.true;
    expect(bo.eventDefinitions[0].waitForCompletion).to.be.true;

  }));


  it('should undo to set wait for completion property for a compensation end event', inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    var shape = elementRegistry.get('CompensationEndEvent_1');
    selection.select(shape);

    var checkBox = domQuery('input[name=waitForCompletion]', propertiesPanel._container),
        bo = getBusinessObject(shape);

    // when
    TestHelper.triggerEvent(checkBox, 'click');

    commandStack.undo();

    // then
    expect(checkBox.checked).to.be.false;
    expect(bo.eventDefinitions[0].waitForCompletion).to.be.false;
  }));


  it('should redo to set wait for completion property for a compensation end event', inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    var shape = elementRegistry.get('CompensationEndEvent_1');
    selection.select(shape);

    var checkBox = domQuery('input[name=waitForCompletion]', propertiesPanel._container),
        bo = getBusinessObject(shape);

    // when
    TestHelper.triggerEvent(checkBox, 'click');

    commandStack.undo();
    commandStack.redo();

    // then
    expect(checkBox.checked).to.be.true;
    expect(bo.eventDefinitions[0].waitForCompletion).to.be.true;
  }));


  it('should remove wait for completion property of a compensation throw event', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CompensationIntermediateThrowEvent_1');
    selection.select(shape);

    var checkBox = domQuery('input[name=waitForCompletion]', propertiesPanel._container),
        bo = getBusinessObject(shape);

    // given
    expect(checkBox.checked).to.be.true;

    // when
    TestHelper.triggerEvent(checkBox, 'click');

    // then
    expect(checkBox.checked).to.be.false;
    expect(bo.eventDefinitions[0].waitForCompletion).to.be.false;

  }));


  it('should not show wait for completion property of a compensation non throwing event', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CompensationIntermediateCatchEvent_1');
    selection.select(shape);

    var checkBox = domQuery('input[name=waitForCompletion]', propertiesPanel._container),
        selectBox = domQuery('select[name=activityRef]', propertiesPanel._container);

    expect(checkBox).to.be.null;
    expect(selectBox).to.be.null;

  }));


  it('should fetch activityRef property of an element', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CompensationIntermediateThrowEvent_1');
    selection.select(shape);

    var selectBox = domQuery('select[name=activityRef]', propertiesPanel._container);

    expect(selectBox.value).to.equal('ReceiveTask_1');

  }));


  it('should remove activityRef property of a compensate event definition', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CompensationIntermediateThrowEvent_1');
    selection.select(shape);

    var selectBox = domQuery('select[name=activityRef]', propertiesPanel._container),
        bo = getBusinessObject(shape);

    // given
    expect(selectBox.value).to.equal('ReceiveTask_1');
    expect(bo.eventDefinitions[0].activityRef).not.to.be.undefined;
    expect(bo.eventDefinitions[0].activityRef.id).to.equal(selectBox.value);

    // when
    selectBox.options[0].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    // then
    expect(bo.eventDefinitions[0].activityRef).to.be.undefined;

  }));


  it('should set activityRef property to a compensate event definition', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CompensationEndEvent_1');
    selection.select(shape);

    var selectBox = domQuery('select[name=activityRef]', propertiesPanel._container),
        bo = getBusinessObject(shape);

    // given
    expect(selectBox.value).to.equal('');
    expect(bo.eventDefinitions[0].activityRef).to.be.undefined;

    // when
    selectBox.options[1].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    // then
    expect(selectBox.value).to.equal('ReceiveTask_1');

    expect(bo.eventDefinitions[0].activityRef).not.to.be.undefined;
    expect(bo.eventDefinitions[0].activityRef.id).to.equal(selectBox.value);

  }));


  it('should change activityRef property to a compensate event definition', inject(function(propertiesPanel, selection, elementRegistry) {

    var shape = elementRegistry.get('CompensationIntermediateThrowEvent_1');
    selection.select(shape);

    var selectBox = domQuery('select[name=activityRef]', propertiesPanel._container),
        bo = getBusinessObject(shape);

    // given
    expect(selectBox.value).to.equal('ReceiveTask_1');
    expect(bo.eventDefinitions[0].activityRef).not.to.be.undefined;
    expect(bo.eventDefinitions[0].activityRef.id).to.equal(selectBox.value);

    // when
    selectBox.options[2].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    // then
    expect(selectBox.value).to.equal('UserTask_1');

    expect(bo.eventDefinitions[0].activityRef).not.to.be.undefined;
    expect(bo.eventDefinitions[0].activityRef.id).to.equal(selectBox.value);

  }));


  it('should undo to set activityRef property to a compensate event definition', inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    var shape = elementRegistry.get('CompensationEndEvent_1');
    selection.select(shape);

    var selectBox = domQuery('select[name=activityRef]', propertiesPanel._container),
        bo = getBusinessObject(shape);

    // given
    expect(selectBox.value).to.equal('');
    expect(bo.eventDefinitions[0].activityRef).to.be.undefined;

    // when
    selectBox.options[1].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    // then
    expect(selectBox.value).to.equal('ReceiveTask_1');

    expect(bo.eventDefinitions[0].activityRef).not.to.be.undefined;
    expect(bo.eventDefinitions[0].activityRef.id).to.equal(selectBox.value);

    // undo
    commandStack.undo();

    // then
    expect(selectBox.value).to.equal('');
    expect(bo.eventDefinitions[0].activityRef).to.be.undefined;

  }));


  it('should redo to set activityRef property to a compensate event definition', inject(function(propertiesPanel, selection, elementRegistry, commandStack) {

    var shape = elementRegistry.get('CompensationEndEvent_1');
    selection.select(shape);

    var selectBox = domQuery('select[name=activityRef]', propertiesPanel._container),
        bo = getBusinessObject(shape);

    // given
    expect(selectBox.value).to.equal('');
    expect(bo.eventDefinitions[0].activityRef).to.be.undefined;

    // when
    selectBox.options[1].selected = 'selected';
    TestHelper.triggerEvent(selectBox, 'change');

    // then
    expect(selectBox.value).to.equal('ReceiveTask_1');

    expect(bo.eventDefinitions[0].activityRef).not.to.be.undefined;
    expect(bo.eventDefinitions[0].activityRef.id).to.equal(selectBox.value);

    // redo
    commandStack.undo();
    commandStack.redo();

    // then
    expect(selectBox.value).to.equal('ReceiveTask_1');

    expect(bo.eventDefinitions[0].activityRef).not.to.be.undefined;
    expect(bo.eventDefinitions[0].activityRef.id).to.equal(selectBox.value);

  }));

});
