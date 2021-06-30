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
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider
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

});


// helpers /////////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}