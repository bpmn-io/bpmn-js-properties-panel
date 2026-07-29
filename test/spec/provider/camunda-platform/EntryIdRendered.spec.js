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
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import historyCleanupXML from './HistoryCleanupProps-process.bpmn';


// verify the render-agnostic contract end to end: whatever id
// CamundaPlatformPropertiesProvider resolves for a moddle path is actually
// rendered as an entry (or group) in the DOM - so the resolver can never drift
// from the UI
describe('provider/camunda-platform - entry id rendered', function() {

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


  describe('history cleanup', function() {

    beforeEach(bootstrapPropertiesPanel(historyCleanupXML, {
      modules: [
        CoreModule,
        ModelingModule,
        SelectionModule,
        BpmnPropertiesPanel,
        BpmnPropertiesProvider,
        CamundaPlatformPropertiesProvider
      ],
      moddleExtensions: {
        camunda: camundaModdleExtensions
      },
      debounceInput: false
    }));


    it('should render bpmn:Process#historyTimeToLive', inject(async function(elementRegistry, selection, propertiesPanel) {

      // given
      const process = elementRegistry.get('Process_1');

      await act(() => selection.select(process));

      // then
      expectRenderedEntry(propertiesPanel, process, [ 'historyTimeToLive' ], 'historyTimeToLive');
    }));

  });

});
