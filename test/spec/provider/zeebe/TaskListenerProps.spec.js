import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
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

import diagramXML from './TaskListenerProps.bpmn';
import { getExtensionElementsList } from 'src/utils/ExtensionElementsUtil';


describe('provider/zeebe - TaskListenerProps', function() {

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


  it('should display for zeebe UserTask', inject(async function(elementRegistry, selection) {

    // given
    const element = elementRegistry.get('UserTask');


    await act(() => {
      selection.select(element);
    });

    // when
    const group = getTaskListenersGroup(container);
    const listItems = getListenerListItems(group);

    const listeners = getListeners(element);

    // then
    expect(group).to.exist;
    expect(listItems).to.have.length(listeners.length);
  }));


  it('should NOT display for non-zeebe UserTask', inject(async function(elementRegistry, selection) {

    // given
    const element = elementRegistry.get('NonZeebeUserTask');


    await act(() => {
      selection.select(element);
    });

    // when
    const group = getTaskListenersGroup(container);

    // then
    expect(group).not.to.exist;
  }));


  for (const elementType of [
    'CompensationBoundaryEvent',
    'Gateway'
  ]) {

    it(`should NOT display for ${elementType}`, inject(async function(elementRegistry, selection) {

      // given
      const compensationEvent = elementRegistry.get(elementType);

      await act(() => {
        selection.select(compensationEvent);
      });

      // when
      const group = getTaskListenersGroup(container);

      // then
      expect(group).not.to.exist;
    }));
  }


  it('should display proper label', inject(async function(elementRegistry, selection) {

    // given
    const element = elementRegistry.get('UserTask');

    await act(() => {
      selection.select(element);
    });

    // when
    const group = getTaskListenersGroup(container);
    const label = domQuery('.bio-properties-panel-collapsible-entry-header-title', group);

    // then
    expect(label).to.have.property('textContent', 'Assigning: assign_listener');
  }));


  it('should display label with exact value for unknown event type', inject(async function(elementRegistry, selection) {

    // given
    const element = elementRegistry.get('UserTaskLegacyEventTypes');

    await act(() => {
      selection.select(element);
    });

    // when
    const group = getTaskListenersGroup(container);
    const label = domQuery('.bio-properties-panel-collapsible-entry-header-title', group);

    // then
    expect(label).to.have.property('textContent', 'assignment: assign_listener_legacy');
  }));


  it('should add new listener', inject(async function(elementRegistry, selection) {

    // given
    const element = elementRegistry.get('UserTaskSubprocess');

    await act(() => {
      selection.select(element);
    });

    // assume
    expect(getListeners(element)).to.have.length(2);

    const group = getTaskListenersGroup(container);
    const addEntry = domQuery('.bio-properties-panel-add-entry', group);

    // when
    await act(() => {
      addEntry.click();
    });

    // then
    expect(getListeners(element)).to.have.length(3);
  }));


  it('should re-use existing extensionElements', inject(async function(elementRegistry, selection) {

    // given
    const empty = elementRegistry.get('Empty');

    await act(() => {
      selection.select(empty);
    });

    // assume
    expect(getBusinessObject(empty).get('extensionElements')).to.exist;

    const group = getTaskListenersGroup(container);
    const addEntry = domQuery('.bio-properties-panel-add-entry', group);

    // when
    await act(() => {
      addEntry.click();
    });

    // then
    expect(getBusinessObject(empty).get('extensionElements')).to.exist;
    expect(getListeners(empty)).to.have.length(1);
  }));


  it('should delete listener', inject(async function(elementRegistry, selection) {

    // given
    const element = elementRegistry.get('UserTask');

    await act(() => {
      selection.select(element);
    });

    const group = getTaskListenersGroup(container);
    const listItems = getListenerListItems(group);
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
      const element = elementRegistry.get('UserTask');
      const originalListeners = getListeners(element);

      await act(() => {
        selection.select(element);
      });

      const group = getTaskListenersGroup(container);
      const addEntry = domQuery('.bio-properties-panel-add-entry', group);
      await act(() => {
        addEntry.click();
      });

      // when
      await act(() => {
        commandStack.undo();
      });

      const listItems = getListenerListItems(group);

      // then
      expect(listItems).to.have.length(originalListeners.length);
    })
  );


  describe('event type', function() {

    it('should use "assigning" as event type for a new listener', inject(
      async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('Empty');

        await act(() => {
          selection.select(element);
        });

        const group = getTaskListenersGroup(container);
        const addEntry = domQuery('.bio-properties-panel-add-entry', group);

        // when
        await act(() => {
          addEntry.click();
        });


        // then
        const listeners = getListeners(element);
        const newListener = listeners[listeners.length - 1];

        expect(newListener).to.have.property('eventType', 'assigning');
      })
    );


    it('should update value', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('UserTask');

      await act(() => {
        selection.select(element);
      });

      const group = getTaskListenersGroup(container);
      const eventType = getEventType(group);
      const input = domQuery('select', eventType);

      // when
      changeInput(input, 'completing');

      // then
      const listeners = getListeners(element);
      const listener = listeners[0];

      expect(listener).to.have.property('eventType', 'completing');
    }));


    it('should update on external change', inject(async function(elementRegistry, selection, commandStack) {

      // given
      const element = elementRegistry.get('UserTask');
      await act(() => {
        selection.select(element);
      });
      const group = getTaskListenersGroup(container);
      const eventType = getEventType(group);
      const input = domQuery('select', eventType);
      changeInput(input, 'completing');

      // when
      await act(() => {
        commandStack.undo();
      });

      // then
      expect(input).to.have.property('value', 'assigning');
    }));
  });


  describe('listener type', function() {

    it('should update value', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('UserTask');

      await act(() => {
        selection.select(element);
      });

      const group = getTaskListenersGroup(container);
      const input = domQuery('[name*=listenerType]', group);

      // when
      changeInput(input, 'debug');

      // then
      const listeners = getListeners(element);
      const listener = listeners[0];

      expect(listener).to.have.property('type', 'debug');
    }));


    it('should update on external change', inject(async function(elementRegistry, selection, commandStack) {

      // given
      const element = elementRegistry.get('UserTask');
      await act(() => {
        selection.select(element);
      });
      const group = getTaskListenersGroup(container);
      const input = domQuery('[name*=listenerType]', group);
      changeInput(input, 'debug');

      // when
      await act(() => {
        commandStack.undo();
      });

      // then
      expect(input).to.have.property('value', 'assign_listener');
    }));
  });


  describe('retries type', function() {

    it('should update value', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('UserTask');

      await act(() => {
        selection.select(element);
      });

      const group = getTaskListenersGroup(container);
      const input = domQuery('[name*=retries]', group);

      // when
      changeInput(input, '22');

      // then
      const listeners = getListeners(element);
      const listener = listeners[0];

      expect(listener).to.have.property('retries', '22');
    }));


    it('should update on external change', inject(async function(elementRegistry, selection, commandStack) {

      // given
      const element = elementRegistry.get('UserTask');
      await act(() => {
        selection.select(element);
      });
      const group = getTaskListenersGroup(container);
      const input = domQuery('[name*=retries]', group);
      changeInput(input, '22');

      // when
      await act(() => {
        commandStack.undo();
      });

      // then
      expect(input).to.have.property('value', '2');
    }));
  });
});


// helper //////////////////
function getTaskListenersGroup(container) {
  return getGroup(container, 'Zeebe__TaskListeners');
}

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getListItems(container, type) {
  return domQueryAll(`div[data-entry-id*="-${type}-"].bio-properties-panel-collapsible-entry`, container);
}

function getListenerListItems(container) {
  return getListItems(container, 'taskListener');
}

function getEventType(container) {
  return domQuery('[data-entry-id*="eventType"]', container);
}

function getListeners(element) {
  const bo = getBusinessObject(element);
  const taskListeners = getExtensionElementsList(bo.get('processRef') || bo, 'zeebe:TaskListeners')[0];

  return (taskListeners && taskListeners.get('listeners')) || [];
}
