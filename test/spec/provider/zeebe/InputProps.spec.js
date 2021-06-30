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
  getInputParameters,
  getIoMapping
} from 'src/provider/zeebe/utils/InputOutputUtil';

import diagramXML from './InputProps.bpmn';


describe('provider/zeebe - InputProps', function() {

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


  describe('bpmn:ServiceTask#input', function() {

    it('should NOT display for receive task', inject(async function(elementRegistry, selection) {

      // given
      const receiveTask = elementRegistry.get('ReceiveTask_1');

      await act(() => {
        selection.select(receiveTask);
      });

      // when
      const inputGroup = getGroup(container, 'inputs');

      // then
      expect(inputGroup).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const inputGroup = getGroup(container, 'inputs');
      const inputListItems = getInputListItems(inputGroup);

      // then
      expect(inputGroup).to.exist;
      expect(inputListItems.length).to.equal(getInputParameters(serviceTask).length);
    }));


    it('should add new input', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const inputGroup = getGroup(container, 'inputs');
      const addEntry = domQuery('.bio-properties-panel-add-entry', inputGroup);

      // when
      await act(() => {
        addEntry.parentNode.click();
      });

      // then
      expect(getInputParameters(serviceTask)).to.have.length(5);
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

        const inputGroup = getGroup(container, 'inputs');
        const addEntry = domQuery('.bio-properties-panel-add-entry', inputGroup);

        // when
        await act(() => {
          addEntry.parentNode.click();
        });

        // then
        expect(getBusinessObject(serviceTask).get('extensionElements')).to.exist;
      })
    );


    it('should create non existing ioMapping',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_noIoMapping');

        await act(() => {
          selection.select(serviceTask);
        });

        // assume
        expect(getIoMapping(serviceTask)).not.to.exist;

        const inputGroup = getGroup(container, 'inputs');
        const addEntry = domQuery('.bio-properties-panel-add-entry', inputGroup);

        // when
        await act(() => {
          addEntry.parentNode.click();
        });

        // then
        expect(getIoMapping(serviceTask)).to.exist;
      })
    );


    it('should delete input', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const inputListItems = getInputListItems(getGroup(container, 'inputs'));
      const removeEntry = domQuery('.bio-properties-panel-remove-entry', inputListItems[0]);

      // when
      await act(() => {
        removeEntry.parentNode.click();
      });

      // then
      expect(getInputParameters(serviceTask)).to.have.length(3);
    }));


    it('should remove ioMapping on last delete', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_2');

      await act(() => {
        selection.select(serviceTask);
      });

      // assume
      expect(getIoMapping(serviceTask)).to.exist;

      const inputListItems = getInputListItems(getGroup(container, 'inputs'));
      const removeEntry = domQuery('.bio-properties-panel-remove-entry', inputListItems[0]);

      // when
      await act(() => {
        removeEntry.parentNode.click();
      });

      // then
      expect(getIoMapping(serviceTask)).not.to.exist;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalInputs = getInputParameters(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        const addEntry = domQuery('.bio-properties-panel-add-entry', container);
        await act(() => {
          addEntry.parentNode.click();
        });

        // when
        await act(() => {
          commandStack.undo();
        });

        const inputListItems = getInputListItems(getGroup(container, 'inputs'));

        // then
        expect(inputListItems.length).to.equal(originalInputs.length);
      })
    );

  });

});


// helper //////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getListItems(container, type) {
  return domQueryAll(`div[data-entry-id^="${type}-"].bio-properties-panel-collapsible-entry`, container);
}

function getInputListItems(container) {
  return getListItems(container, 'input');
}