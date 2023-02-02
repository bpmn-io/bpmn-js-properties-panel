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

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  getHeaders,
  getTaskHeaders
} from 'src/provider/zeebe/utils/HeadersUtil';

import diagramXML from './HeaderProps.bpmn';


describe('provider/zeebe - HeaderProps', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
    ZeebePropertiesProvider
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


  describe('bpmn:ServiceTask#taskHeaders', function() {

    it('should NOT display for receive task', inject(async function(elementRegistry, selection) {

      // given
      const receiveTask = elementRegistry.get('ReceiveTask_1');

      await act(() => {
        selection.select(receiveTask);
      });

      // when
      const headerGroup = getGroup(container, 'headers');

      // then
      expect(headerGroup).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const headerGroup = getGroup(container, 'headers');
      const headerListItems = getHeaderListItems(headerGroup);

      // then
      expect(headerGroup).to.exist;
      expect(headerListItems.length).to.equal(getHeaders(serviceTask).length);
    }));


    it('should add new header', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const headerGroup = getGroup(container, 'headers');
      const addEntry = domQuery('.bio-properties-panel-add-entry', headerGroup);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      expect(getHeaders(serviceTask)).to.have.length(5);
    }));


    it('should add new header to bottom', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const headerGroup = getGroup(container, 'headers');
      const addEntry = domQuery('.bio-properties-panel-add-entry', headerGroup);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      const headerLabel = getHeaderLabel(container, 0);

      expect(headerLabel.innerHTML).to.equal('headerKey_1');
    }));


    it('should sort input items according to XML', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // then
      const headers = getHeaders(serviceTask);

      for (let idx = 0; idx < headers.length; idx++) {
        const headerLabel = getHeaderLabel(container, idx).innerHTML;

        expect(headers[idx].key).to.equal(headerLabel);
      }
    }));


    it('should create non existing extension elements',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // assume
        expect(getBusinessObject(serviceTask).get('extensionElements')).not.to.exist;

        const headerGroup = getGroup(container, 'headers');
        const addEntry = domQuery('.bio-properties-panel-add-entry', headerGroup);

        // when
        await act(() => {
          addEntry.click();
        });

        // then
        expect(getBusinessObject(serviceTask).get('extensionElements')).to.exist;
      })
    );


    it('should create non existing taskHeaders',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_noTaskHeaders');

        await act(() => {
          selection.select(serviceTask);
        });

        // assume
        expect(getTaskHeaders(serviceTask)).not.to.exist;

        const headerGroup = getGroup(container, 'headers');
        const addEntry = domQuery('.bio-properties-panel-add-entry', headerGroup);

        // when
        await act(() => {
          addEntry.click();
        });

        // then
        expect(getTaskHeaders(serviceTask)).to.exist;
      })
    );


    it('should delete header', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const headerListItems = getHeaderListItems(getGroup(container, 'headers'));
      const removeEntry = domQuery('.bio-properties-panel-remove-entry', headerListItems[0]);

      // when
      await act(() => {
        removeEntry.click();
      });

      // then
      expect(getHeaders(serviceTask)).to.have.length(3);
    }));


    it('should remove taskHeaders on last delete', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_2');

      await act(() => {
        selection.select(serviceTask);
      });

      // assume
      expect(getTaskHeaders(serviceTask)).to.exist;

      const headerListItems = getHeaderListItems(getGroup(container, 'headers'));
      const removeEntry = domQuery('.bio-properties-panel-remove-entry', headerListItems[0]);

      // when
      await act(() => {
        removeEntry.click();
      });

      // then
      expect(getTaskHeaders(serviceTask)).not.to.exist;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalHeaders = getHeaders(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        const addEntry = domQuery('.bio-properties-panel-add-entry', container);
        await act(() => {
          addEntry.click();
        });

        // when
        await act(() => {
          commandStack.undo();
        });

        const headerListItems = getHeaderListItems(getGroup(container, 'headers'));

        // then
        expect(headerListItems.length).to.eql(originalHeaders.length);
      })
    );

  });

});


// helper //////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getListItems(container, type) {
  return domQueryAll(`div[data-entry-id*="-${type}-"].bio-properties-panel-collapsible-entry`, container);
}

function getHeaderListItems(container) {
  return getListItems(container, 'header');
}

function getHeaderLabel(container, id) {
  return domQueryAll('.bio-properties-panel-collapsible-entry-header-title', container)[id];
}