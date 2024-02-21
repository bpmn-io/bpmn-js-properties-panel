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
  getOutputParameters,
  getIoMapping
} from 'src/provider/zeebe/utils/InputOutputUtil';

import diagramXML from './OutputProps.bpmn';


describe('provider/zeebe - OutputProps', function() {

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


  describe('bpmn:ServiceTask#output', function() {

    it('should NOT display for simple task', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const outputGroup = getGroup(container, 'outputs');

      // then
      expect(outputGroup).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const outputGroup = getGroup(container, 'outputs');
      const outputListItems = getOutputListItems(outputGroup);

      // then
      expect(outputGroup).to.exist;
      expect(outputListItems.length).to.equal(getOutputParameters(serviceTask).length);
    }));


    it('should add new output', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const outputGroup = getGroup(container, 'outputs');
      const addEntry = domQuery('.bio-properties-panel-add-entry', outputGroup);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      expect(getOutputParameters(serviceTask)).to.have.length(5);
    }));


    it('should add new output to bottom', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_2');

      await act(() => {
        selection.select(serviceTask);
      });

      const outputGroup = getGroup(container, 'outputs');
      const addEntry = domQuery('.bio-properties-panel-add-entry', outputGroup);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      const outputItemLabel = getOutputItemLabel(container, 0);

      expect(outputItemLabel.innerHTML).to.equal('outputTargetValue1');
    }));


    it('should sort output items according to XML', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_Unsorted');

      await act(() => {
        selection.select(serviceTask);
      });

      // then
      const outputParameters = getOutputParameters(serviceTask);

      for (let idx = 0; idx < outputParameters.length; idx++) {
        const outputItemLabel = getOutputItemLabel(container, idx).innerHTML;

        expect(outputParameters[idx].target).to.equal(outputItemLabel);
      }
    }));


    it('should create non existing extension elements',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_NoExtensionElements');

        await act(() => {
          selection.select(serviceTask);
        });

        // assume
        expect(getBusinessObject(serviceTask).get('extensionElements')).not.to.exist;

        const outputGroup = getGroup(container, 'outputs');
        const addEntry = domQuery('.bio-properties-panel-add-entry', outputGroup);

        // when
        await act(() => {
          addEntry.click();
        });

        // then
        expect(getBusinessObject(serviceTask).get('extensionElements')).to.exist;
      })
    );


    it('should create non existing ioMapping',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_NoIoMapping');

        await act(() => {
          selection.select(serviceTask);
        });

        // assume
        expect(getIoMapping(serviceTask)).not.to.exist;

        const outputGroup = getGroup(container, 'outputs');
        const addEntry = domQuery('.bio-properties-panel-add-entry', outputGroup);

        // when
        await act(() => {
          addEntry.click();
        });

        // then
        expect(getIoMapping(serviceTask)).to.exist;
      })
    );


    it('should delete output', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const outputListItems = getOutputListItems(getGroup(container, 'outputs'));
      const removeEntry = domQuery('.bio-properties-panel-remove-entry', outputListItems[0]);

      // when
      await act(() => {
        removeEntry.click();
      });

      // then
      expect(getOutputParameters(serviceTask)).to.have.length(3);
    }));


    it('should remove ioMapping on last delete', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_2');

      await act(() => {
        selection.select(serviceTask);
      });

      // assume
      expect(getIoMapping(serviceTask)).to.exist;

      const outputListItems = getOutputListItems(getGroup(container, 'outputs'));
      const removeEntry = domQuery('.bio-properties-panel-remove-entry', outputListItems[0]);

      // when
      await act(() => {
        removeEntry.click();
      });

      // then
      expect(getIoMapping(serviceTask)).not.to.exist;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalOutputs = getOutputParameters(serviceTask);

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

        const outputListItems = getOutputListItems(getGroup(container, 'outputs'));

        // then
        expect(outputListItems.length).to.equal(originalOutputs.length);
      })
    );

  });


  describe('bpmn:EndEvent#output', function() {

    it('should NOT display for terminate event', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('TerminateEvent');

      await act(() => {
        selection.select(task);
      });

      // when
      const outputGroup = getGroup(container, 'outputs');

      // then
      expect(outputGroup).to.not.exist;
    }));
  });
});


// helper //////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getListItems(container, type) {
  return domQueryAll(`div[data-entry-id*="-${type}-"].bio-properties-panel-collapsible-entry`, container);
}

function getOutputListItems(container) {
  return getListItems(container, 'output');
}

function getOutputItemLabel(container, id) {
  return domQueryAll('.bio-properties-panel-collapsible-entry-header-title', container)[id];
}