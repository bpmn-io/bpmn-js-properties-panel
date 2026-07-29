import { expect } from 'chai';

import TestContainer from 'mocha-test-container-support';

import { act } from '@testing-library/preact';

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
import ZeebePropertiesProvider from 'src/provider/zeebe';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import executionListenersXML from './ExecutionListenerProps.bpmn';
import inputXML from './InputProps.bpmn';
import businessIdXML from './BusinessIdProps.bpmn';


// verify the render-agnostic contract end to end: whatever id
// ZeebePropertiesProvider resolves for a moddle path is actually rendered as an
// entry (or group) in the DOM - so the resolver can never drift from the UI
describe('provider/zeebe - entry id rendered', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  function expectRenderedEntry(propertiesPanel, element, path, expectedId) {

    // when
    const entryId = propertiesPanel.getEntryId(element, path);

    // then
    expect(entryId, 'resolved entry id').to.eql(expectedId);

    const rendered = domQuery(
      `[data-entry-id="${ entryId }"], [data-group-id="group-${ entryId }"]`,
      container
    );

    expect(rendered, `rendered entry or group "${ entryId }"`).to.exist;
  }


  describe('execution listeners', function() {

    beforeEach(bootstrapPropertiesPanel(executionListenersXML, {
      modules: [
        CoreModule,
        ModelingModule,
        SelectionModule,
        BpmnPropertiesPanel,
        BpmnPropertiesProvider,
        ZeebePropertiesProvider
      ],
      moddleExtensions: {
        zeebe: zeebeModdleExtensions
      },
      debounceInput: false
    }));


    it('should render bpmn:Process#isExecutable', inject(async function(elementRegistry, selection, propertiesPanel) {

      // given
      const process = elementRegistry.get('Process');

      await act(() => selection.select(process));

      // then
      expectRenderedEntry(propertiesPanel, process, [ 'isExecutable' ], 'isExecutable');
    }));


    it('should render an execution listener field', inject(async function(elementRegistry, selection, propertiesPanel) {

      // given
      const task = elementRegistry.get('Task_MultipleHeaders');

      await act(() => selection.select(task));

      // then
      expectRenderedEntry(
        propertiesPanel,
        task,
        [ 'extensionElements', 'values', 0, 'listeners', 0, 'retries' ],
        'Task_MultipleHeaders-executionListener-0-retries'
      );
    }));


    it('should render a nested execution listener header', inject(async function(elementRegistry, selection, propertiesPanel) {

      // given
      const task = elementRegistry.get('Task_MultipleHeaders');

      await act(() => selection.select(task));

      // then
      expectRenderedEntry(
        propertiesPanel,
        task,
        [ 'extensionElements', 'values', 0, 'listeners', 0, 'headers', 'values', 0, 'key' ],
        'Task_MultipleHeaders-executionListener-0-headers-header-0-key'
      );
    }));

  });


  describe('io mapping', function() {

    beforeEach(bootstrapPropertiesPanel(inputXML, {
      modules: [
        CoreModule,
        ModelingModule,
        SelectionModule,
        BpmnPropertiesPanel,
        BpmnPropertiesProvider,
        ZeebePropertiesProvider
      ],
      moddleExtensions: {
        zeebe: zeebeModdleExtensions
      },
      debounceInput: false
    }));


    it('should render an input parameter field', inject(async function(elementRegistry, selection, propertiesPanel) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => selection.select(serviceTask));

      // then
      expectRenderedEntry(
        propertiesPanel,
        serviceTask,
        [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ],
        'ServiceTask_1-input-0-source'
      );
    }));


    it('should render the inputs group for the collection', inject(async function(elementRegistry, selection, propertiesPanel) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => selection.select(serviceTask));

      // then
      expectRenderedEntry(
        propertiesPanel,
        serviceTask,
        [ 'extensionElements', 'values', 0, 'inputParameters' ],
        'inputs'
      );
    }));

  });


  describe('business id', function() {

    beforeEach(bootstrapPropertiesPanel(businessIdXML, {
      modules: [
        CoreModule,
        ModelingModule,
        SelectionModule,
        BpmnPropertiesPanel,
        BpmnPropertiesProvider,
        ZeebePropertiesProvider
      ],
      moddleExtensions: {
        zeebe: zeebeModdleExtensions
      },
      debounceInput: false
    }));


    it('should render zeebe:CalledElement#businessId', inject(async function(elementRegistry, selection, propertiesPanel) {

      // given
      const callActivity = elementRegistry.get('CallActivity_override');

      await act(() => selection.select(callActivity));

      // then
      expectRenderedEntry(
        propertiesPanel,
        callActivity,
        [ 'extensionElements', 'values', 0, 'businessId' ],
        'businessId'
      );
    }));

  });

});
