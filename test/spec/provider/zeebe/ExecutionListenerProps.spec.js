import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  inject
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import ZeebePropertiesProvider from 'src/provider/zeebe';
import BehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe.json';

import diagramXML from './ExecutionListenerProps.bpmn';
import { getExtensionElementsList } from 'src/utils/ExtensionElementsUtil';


describe('provider/zeebe - ExecutionListenerProps', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
    ZeebePropertiesProvider,
    BehaviorsModule
  ];

  const moddleExtensions = {
    zeebe: zeebeModdleExtensions
  };

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    moddleExtensions,
    debounceInput: false
  }));


  for (const elementType of [
    'Process',
    'StartEvent',
    'IntermediateThrowEvent',
    'EndEvent',
    'TimerEndEvent',
    'Gateway',
    'Task',
    'SubProcess',
    'BoundaryEvent'
  ]) {

    it(`should display for ${elementType}`, inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get(elementType);

      await act(() => {
        selection.select(element);
      });

      // when
      const group = getExecutionListenersGroup(container);
      const listItems = getListenerListItems(group, 'executionListener');

      const listeners = getListeners(element);

      // then
      expect(group).to.exist;
      expect(listItems).to.have.length(listeners.length);
    }));
  }


  it('should NOT display', inject(async function(elementRegistry, selection) {

    // given
    const compensationEvent = elementRegistry.get('CompensationBoundaryEvent');

    await act(() => {
      selection.select(compensationEvent);
    });

    // when
    const group = getExecutionListenersGroup(container);

    // then
    expect(group).not.to.exist;
  }));


  it('should display proper label', inject(async function(elementRegistry, selection) {

    // given
    const element = elementRegistry.get('StartEvent');

    await act(() => {
      selection.select(element);
    });

    // when
    const group = getExecutionListenersGroup(container);
    const label = domQuery('.bio-properties-panel-collapsible-entry-header-title', group);

    // then
    expect(label).to.have.property('textContent', 'End: sysout');
  }));


  it('should add new listener', inject(async function(elementRegistry, selection) {

    // given
    const element = elementRegistry.get('StartEvent');

    await act(() => {
      selection.select(element);
    });

    const group = getExecutionListenersGroup(container);
    const addEntry = domQuery('.bio-properties-panel-add-entry', group);

    // when
    await act(() => {
      addEntry.click();
    });

    // then
    expect(getListeners(element)).to.have.length(3);
  }));


  it('should create non existing extension elements',
    inject(async function(elementRegistry, selection) {

      // given
      const empty = elementRegistry.get('Empty');

      await act(() => {
        selection.select(empty);
      });

      // assume
      expect(getBusinessObject(empty).get('extensionElements')).not.to.exist;

      const group = getExecutionListenersGroup(container);
      const addEntry = domQuery('.bio-properties-panel-add-entry', group);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      expect(getBusinessObject(empty).get('extensionElements')).to.exist;
      expect(getListeners(empty)).to.have.length(1);
    })
  );


  it('should re-use existing extensionElements', inject(async function(elementRegistry, selection) {

    // given
    const otherExtensions = elementRegistry.get('OtherExtensions');

    await act(() => {
      selection.select(otherExtensions);
    });

    // assume
    expect(getBusinessObject(otherExtensions).get('extensionElements')).to.exist;

    const group = getExecutionListenersGroup(container);
    const addEntry = domQuery('.bio-properties-panel-add-entry', group);

    // when
    await act(() => {
      addEntry.click();
    });

    // then
    expect(getBusinessObject(otherExtensions).get('extensionElements')).to.exist;
    expect(getListeners(otherExtensions)).to.have.length(1);
  }));


  it('should delete listener', inject(async function(elementRegistry, selection) {

    // given
    const element = elementRegistry.get('SingleListener');

    await act(() => {
      selection.select(element);
    });

    const group = getExecutionListenersGroup(container);
    const listItems = getListenerListItems(group, 'executionListener');
    const removeEntry = domQuery('.bio-properties-panel-remove-entry', listItems[0]);

    // when
    await act(() => {
      removeEntry.click();
    });

    // then
    expect(getListeners(element)).to.have.length(0);
  }));


  it('should update on external change',
    inject(async function(elementRegistry, selection, commandStack) {

      // given
      const element = elementRegistry.get('SingleListener');
      const originalListeners = getListeners(element);

      await act(() => {
        selection.select(element);
      });

      const group = getExecutionListenersGroup(container);
      const addEntry = domQuery('.bio-properties-panel-add-entry', group);
      await act(() => {
        addEntry.click();
      });

      // when
      await act(() => {
        commandStack.undo();
      });

      const listItems = getListenerListItems(group, 'executionListener');

      // then
      expect(listItems).to.have.length(originalListeners.length);
    })
  );
});


// helper //////////////////
function getExecutionListenersGroup(container) {
  return getGroup(container, 'Zeebe__ExecutionListeners');
}

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getListItems(container, type) {
  return domQueryAll(`div[data-entry-id*="-${type}-"].bio-properties-panel-collapsible-entry`, container);
}

function getListenerListItems(container, listenerGroup) {
  return getListItems(container, listenerGroup);
}

function getListeners(element) {
  const bo = getBusinessObject(element);
  const executionListeners = getExtensionElementsList(bo.get('processRef') || bo, 'zeebe:ExecutionListeners')[0];

  return executionListeners.get('listeners');
}
