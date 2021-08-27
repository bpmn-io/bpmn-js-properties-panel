import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';

import diagramXML from './BpmnPropertiesProvider.bpmn';


describe('<BpmnPropertiesProvider>', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CoreModule,
    ModelingModule,
    SelectionModule
  ];

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    debounceInput: false
  }));

  it('should show general group', inject(async function(elementRegistry, selection) {

    // given
    const startEvent = elementRegistry.get('StartEvent_1');

    await act(() => {
      selection.select(startEvent);
    });

    // when
    const generalGroup = getGroup(container, 'general');

    // then
    expect(generalGroup).to.exist;
  }));


  it('should NOT show error group', inject(async function(elementRegistry, selection) {

    // given
    const startEvent = elementRegistry.get('StartEvent_1');

    await act(() => {
      selection.select(startEvent);
    });

    // when
    const errorGroup = getGroup(container, 'error');

    // then
    expect(errorGroup).to.not.exist;
  }));


  it('should show error group', inject(async function(elementRegistry, selection) {

    // given
    const errorBoundaryEvent = elementRegistry.get('BoundaryEvent_1');

    await act(() => {
      selection.select(errorBoundaryEvent);
    });

    // when
    const errorGroup = getGroup(container, 'error');

    // then
    expect(errorGroup).to.exist;
  }));


  it('should NOT show message group', inject(async function(elementRegistry, selection) {

    // given
    const startEvent = elementRegistry.get('StartEvent_1');

    await act(() => {
      selection.select(startEvent);
    });

    // when
    const messageGroup = getGroup(container, 'message');

    // then
    expect(messageGroup).to.not.exist;
  }));


  it('should show message group', inject(async function(elementRegistry, selection) {

    // given
    const messageEvent = elementRegistry.get('MessageEvent_1');

    await act(() => {
      selection.select(messageEvent);
    });

    // when
    const messageGroup = getGroup(container, 'message');

    // then
    expect(messageGroup).to.exist;
  }));


  it('should show message group - receive task', inject(async function(elementRegistry, selection) {

    // given
    const receiveTask = elementRegistry.get('ReceiveTask_1');

    await act(() => {
      selection.select(receiveTask);
    });

    // when
    const messageGroup = getGroup(container, 'message');

    // then
    expect(messageGroup).to.exist;
  }));


  it('should show signal group', inject(async function(elementRegistry, selection) {

    // given
    const signalEvent = elementRegistry.get('SignalThrowEvent_1');

    await act(() => {
      selection.select(signalEvent);
    });

    // when
    const signalGroup = getGroup(container, 'signal');

    // then
    expect(signalGroup).to.exist;
  }));


  it('should NOT show signal group', inject(async function(elementRegistry, selection) {

    // given
    const startEvent = elementRegistry.get('StartEvent_1');

    await act(() => {
      selection.select(startEvent);
    });

    // when
    const signalGroup = getGroup(container, 'signal');

    // then
    expect(signalGroup).to.not.exist;
  }));


  it('should show escalation group', inject(async function(elementRegistry, selection) {

    // given
    const escalationEvent = elementRegistry.get('EscalationEvent_1');

    await act(() => {
      selection.select(escalationEvent);
    });

    // when
    const escalationGroup = getGroup(container, 'escalation');

    // then
    expect(escalationGroup).to.exist;
  }));


  it('should NOT show escalation group', inject(async function(elementRegistry, selection) {

    // given
    const startEvent = elementRegistry.get('StartEvent_1');

    await act(() => {
      selection.select(startEvent);
    });

    // when
    const escalationGroup = getGroup(container, 'escalation');

    // then
    expect(escalationGroup).to.not.exist;
  }));


  it('should NOT show timer event group', inject(async function(elementRegistry, selection) {

    // given
    const startEvent = elementRegistry.get('StartEvent_1');

    await act(() => {
      selection.select(startEvent);
    });

    // when
    const timerEventGroup = getGroup(container, 'timer');

    // then
    expect(timerEventGroup).to.not.exist;
  }));


  it('should show timer event group', inject(async function(elementRegistry, selection) {

    // given
    const startEvent = elementRegistry.get('TimerStartEvent_1');

    await act(() => {
      selection.select(startEvent);
    });

    // when
    const timerEventGroup = getGroup(container, 'timer');

    // then
    expect(timerEventGroup).to.exist;
  }));


  it('should show compensation group', inject(async function(elementRegistry, selection) {

    // given
    const compensationEvent = elementRegistry.get('CompensationEvent_1');

    await act(() => {
      selection.select(compensationEvent);
    });

    // when
    const compensationGroup = getGroup(container, 'compensation');

    // then
    expect(compensationGroup).to.exist;
  }));


  it('should NOT show signal group', inject(async function(elementRegistry, selection) {

    // given
    const startEvent = elementRegistry.get('StartEvent_1');

    await act(() => {
      selection.select(startEvent);
    });

    // when
    const compensationGroup = getGroup(container, 'compensation');

    // then
    expect(compensationGroup).to.not.exist;
  }));


  it('should NOT show multiInstance group', inject(async function(elementRegistry, selection) {

    // given
    const element = elementRegistry.get('SubProcess_2');

    await act(() => {
      selection.select(element);
    });

    // when
    const multiInstanceGroup = getGroup(container, 'multiInstance');

    // then
    expect(multiInstanceGroup).to.not.exist;
  }));


  it('should show multiInstance group', inject(async function(elementRegistry, selection) {

    // given
    const element = elementRegistry.get('SubProcess_1');

    await act(() => {
      selection.select(element);
    });

    // when
    const multiInstanceGroup = getGroup(container, 'multiInstance');

    // then
    expect(multiInstanceGroup).to.exist;
  }));

});


// helpers /////////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}
