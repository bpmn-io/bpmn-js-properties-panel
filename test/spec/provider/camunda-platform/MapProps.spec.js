import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';

import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import {
  getInputParameters
} from 'src/provider/camunda-platform/utils/InputOutputUtil';

import diagramXML from './MapProps.bpmn';


describe('provider/camunda-platform - MapProps', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CamundaPlatformPropertiesProvider
  ];

  const moddleExtensions = {
    camunda: camundaModdleExtensions
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


  describe('bpmn:ServiceTask#inputParameter.map', function() {

    describe('entries', function() {

      it('should NOT display', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const list = domQuery('div[data-entry-id="ServiceTask_1-inputParameter-1-map"]', group);

        // then
        expect(list).to.not.exist;
      }));


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const list = domQuery('div[data-entry-id="ServiceTask_1-inputParameter-0-map"]', group);
        const listItems = getListItems(list);

        const parameter = getInputParameter(serviceTask, 0);

        // then
        expect(listItems.length).to.equal(getEntries(parameter).length);
      }));


      it('should add entry', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const list = domQuery('div[data-entry-id="ServiceTask_1-inputParameter-0-map"]', group);
        const addEntry = domQuery('.bio-properties-panel-add-entry', list);

        // when
        await act(() => {
          addEntry.click();
        });

        const parameter = getInputParameter(serviceTask, 0);

        // then
        expect(getEntries(parameter)).to.have.length(4);
      }));


      it('should remove entry', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        const group = getGroup(container, 'CamundaPlatform__Input');
        const list = domQuery('div[data-entry-id="ServiceTask_1-inputParameter-0-map"]', group);
        const listItem = getListItems(list)[0];
        const removeEntry = domQuery('.bio-properties-panel-remove-entry', listItem);

        // when
        await act(() => {
          removeEntry.click();
        });

        const parameter = getInputParameter(serviceTask, 0);

        // then
        expect(getEntries(parameter)).to.have.length(2);
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_1');
          const parameter = getInputParameter(serviceTask, 0);
          const originalItems = getEntries(parameter);

          await act(() => {
            selection.select(serviceTask);
          });

          const group = getGroup(container, 'CamundaPlatform__Input');
          const list = domQuery('div[data-entry-id="ServiceTask_1-inputParameter-0-map"]', group);
          const addEntry = domQuery('.bio-properties-panel-add-entry', list);
          await act(() => {
            addEntry.click();
          });

          // when
          await act(() => {
            commandStack.undo();
          });

          const listItems = getListItems(list);

          // then
          expect(listItems.length).to.eql(originalItems.length);
        })
      );


      it('should not randomly open items', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        const group = getGroup(container, 'CamundaPlatform__Input');
        const list = domQuery('div[data-entry-id="ServiceTask_1-inputParameter-0-map"]', group);
        const addEntry = domQuery('.bio-properties-panel-add-entry', list);

        // when
        await act(() => {
          addEntry.click();
          addEntry.click();
          selection.select();
        });

        await act(() => {
          selection.select(serviceTask);
        });

        // then
        const groupAfter = getGroup(container, 'CamundaPlatform__Input');
        const listAfter = domQuery('div[data-entry-id="ServiceTask_1-inputParameter-0-map"]', groupAfter);
        const entries = domQueryAll('.bio-properties-panel-collapsible-entry', listAfter);
        const openEntries = domQueryAll('.bio-properties-panel-collapsible-entry.open', listAfter);

        expect(entries).to.have.length(5);
        expect(openEntries).to.be.empty;
      }));

    });


    describe('entry.key', function() {

      it('should NOT display', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const input = domQuery('input[name="ServiceTask_1-inputParameter-1-map-mapEntry-0-key"]', group);

        // then
        expect(input).to.not.exist;
      }));


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const input = domQuery('input[name="ServiceTask_1-inputParameter-0-map-mapEntry-0-key"]', group);

        const entry = getEntry(getInputParameter(serviceTask, 0), 0);

        // then
        expect(input.value).to.eql(entry.get('key'));
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        const group = getGroup(container, 'CamundaPlatform__Input');
        const input = domQuery('input[name="ServiceTask_1-inputParameter-0-map-mapEntry-0-key"]', group);

        // when
        changeInput(input, 'newValue');

        const entry = getEntry(getInputParameter(serviceTask, 0), 0);

        // then
        expect(entry.get('key')).to.eql('newValue');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_1');
          const entry = getEntry(getInputParameter(serviceTask, 0), 0);
          const originalValue = entry.get('key');

          await act(() => {
            selection.select(serviceTask);
          });

          const group = getGroup(container, 'CamundaPlatform__Input');
          const input = domQuery('input[name="ServiceTask_1-inputParameter-0-map-mapEntry-0-key"]', group);
          changeInput(input, 'newValue');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(input.value).to.eql(originalValue);
        })
      );

    });


    describe('entry.value', function() {

      it('should NOT display', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const input = domQuery('input[name="ServiceTask_1-inputParameter-1-map-mapEntry-0-value"]', group);

        // then
        expect(input).to.not.exist;
      }));


      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const input = domQuery('input[name="ServiceTask_1-inputParameter-0-map-mapEntry-0-value"]', group);

        const entry = getEntry(getInputParameter(serviceTask, 0), 0);

        // then
        expect(input.value).to.eql(entry.get('value'));
      }));


      it('should display as disabled - script', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const input = domQuery('input[name="ServiceTask_1-inputParameter-2-map-mapEntry-0-value"]', group);

        // then
        expect(input.value).to.eql('Script');
        expect(input.disabled).to.be.true;
      }));


      it('should display as disabled - list', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const input = domQuery('input[name="ServiceTask_1-inputParameter-2-map-mapEntry-1-value"]', group);

        // then
        expect(input.value).to.eql('List');
        expect(input.disabled).to.be.true;
      }));


      it('should display as disabled - map', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__Input');
        const input = domQuery('input[name="ServiceTask_1-inputParameter-2-map-mapEntry-2-value"]', group);

        // then
        expect(input.value).to.eql('Map');
        expect(input.disabled).to.be.true;
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        const group = getGroup(container, 'CamundaPlatform__Input');
        const input = domQuery('input[name="ServiceTask_1-inputParameter-0-map-mapEntry-0-value"]', group);

        // when
        changeInput(input, 'newValue');

        const entry = getEntry(getInputParameter(serviceTask, 0), 0);

        // then
        expect(entry.get('value')).to.eql('newValue');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_1');
          const entry = getEntry(getInputParameter(serviceTask, 0), 0);
          const originalValue = entry.get('value');

          await act(() => {
            selection.select(serviceTask);
          });

          const group = getGroup(container, 'CamundaPlatform__Input');
          const input = domQuery('input[name="ServiceTask_1-inputParameter-0-map-mapEntry-0-value"]', group);
          changeInput(input, 'newValue');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(input.value).to.eql(originalValue);
        })
      );

    });

  });

});


// helper //////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getInputParameter(element, idx) {
  return (getInputParameters(element) || [])[idx];
}

function getEntries(parameter) {
  return parameter.get('definition').get('entries');
}

function getEntry(parameter, idx) {
  return (getEntries(parameter) || [])[idx];
}

function getListItems(container) {
  return domQueryAll('.bio-properties-panel-list-entry-item', container);
}