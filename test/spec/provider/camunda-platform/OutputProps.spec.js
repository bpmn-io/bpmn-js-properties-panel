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

import BehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-platform';

import BpmnPropertiesPanel from 'src/render';

import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import {
  getInputOutput,
  getOutputParameters
} from 'src/provider/camunda-platform/utils/InputOutputUtil';

import diagramXML from './OutputProps.bpmn';


describe('provider/camunda-platform - OutputProps', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
    CamundaPlatformPropertiesProvider,
    BehaviorsModule
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


  describe('bpmn:ServiceTask#outputParameters', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const group = getGroup(container, 'CamundaPlatform__Output');
      const listItems = getOutputListItems(group);

      // then
      expect(group).to.exist;
      expect(listItems.length).to.equal(getOutputParameters(serviceTask).length);
    }));


    it('should add new output parameter', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const group = getGroup(container, 'CamundaPlatform__Output');
      const addEntry = domQuery('.bio-properties-panel-add-entry', group);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      expect(getOutputParameters(serviceTask)).to.have.length(5);
    }));


    it('should add new output to bottom', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const group = getGroup(container, 'CamundaPlatform__Output');
      const addEntry = domQuery('.bio-properties-panel-add-entry', group);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      const outputItemLabel = getOutputItemLabel(container, 0);

      expect(outputItemLabel.innerHTML).to.equal('output1');
    }));


    it('should sort output items according to XML', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('UnsortedServiceTask');

      await act(() => {
        selection.select(serviceTask);
      });

      // then
      const outputParameters = getOutputParameters(serviceTask);

      for (let idx = 0; idx < outputParameters.length; idx++) {
        const outputItemLabel = getOutputItemLabel(container, idx).innerHTML;

        expect(outputParameters[idx].name).to.equal(outputItemLabel);
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

        const group = getGroup(container, 'CamundaPlatform__Output');
        const addEntry = domQuery('.bio-properties-panel-add-entry', group);

        // when
        await act(() => {
          addEntry.click();
        });

        // then
        expect(getBusinessObject(serviceTask).get('extensionElements')).to.exist;
        expect(getOutputParameters(serviceTask)).to.have.length(1);
      })
    );


    it('should re-use existing extensionElements', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_withExtensionElements');

      await act(() => {
        selection.select(serviceTask);
      });

      // assume
      expect(getBusinessObject(serviceTask).get('extensionElements')).to.exist;

      const group = getGroup(container, 'CamundaPlatform__Output');
      const addEntry = domQuery('.bio-properties-panel-add-entry', group);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      expect(getBusinessObject(serviceTask).get('extensionElements')).to.exist;
      expect(getOutputParameters(serviceTask)).to.have.length(1);
    }));


    it('should delete output parameter', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const group = getGroup(container, 'CamundaPlatform__Output');
      const listItems = getOutputListItems(group);
      const removeEntry = domQuery('.bio-properties-panel-remove-entry', listItems[0]);

      // when
      await act(() => {
        removeEntry.click();
      });

      // then
      expect(getOutputParameters(serviceTask)).to.have.length(3);
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalParameters = getOutputParameters(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        const group = getGroup(container, 'CamundaPlatform__Output');
        const addEntry = domQuery('.bio-properties-panel-add-entry', group);
        await act(() => {
          addEntry.click();
        });

        // when
        await act(() => {
          commandStack.undo();
        });

        const listItems = getOutputListItems(group);

        // then
        expect(listItems.length).to.eql(originalParameters.length);
      })
    );


    describe('integration', function() {

      it('should remove empty input output', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_OneOutput');

        await act(() => {
          selection.select(serviceTask);
        });

        const group = getGroup(container, 'CamundaPlatform__Output');
        const listItems = getOutputListItems(group);
        const removeEntry = domQuery('.bio-properties-panel-remove-entry', listItems[0]);

        // when
        await act(() => {
          removeEntry.click();
        });

        // then
        expect(getInputOutput(serviceTask)).not.to.exist;
      }));

    });

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
  return getListItems(container, 'outputParameter');
}

function getOutputItemLabel(container, id) {
  return domQueryAll('.bio-properties-panel-collapsible-entry-header-title', container)[id];
}