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
  getInputParameters
} from 'src/provider/camunda-platform/utils/InputOutputUtil';

import diagramXML from './InputProps.bpmn';


describe('provider/camunda-platform - InputProps', function() {

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


  describe('bpmn:ServiceTask#inputParameters', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const group = getGroup(container, 'CamundaPlatform__Input');
      const listItems = getInputListItems(group);

      // then
      expect(group).to.exist;
      expect(listItems.length).to.equal(getInputParameters(serviceTask).length);
    }));


    it('should add new input parameter', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const group = getGroup(container, 'CamundaPlatform__Input');
      const addEntry = domQuery('.bio-properties-panel-add-entry', group);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      expect(getInputParameters(serviceTask)).to.have.length(5);
    }));


    it('should add new input to bottom', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const inputGroup = getGroup(container, 'inputs');
      const addEntry = domQuery('.bio-properties-panel-add-entry', inputGroup);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      const inputItemLabel = getInputItemLabel(container, 0);

      expect(inputItemLabel.innerHTML).to.equal('input1');
    }));


    it('should sort input items according to XML', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('UnsortedServiceTask');

      await act(() => {
        selection.select(serviceTask);
      });

      // then
      const inputParameters = getInputParameters(serviceTask);

      for (let idx = 0; idx < inputParameters.length; idx++) {
        const inputItemLabel = getInputItemLabel(container, idx).innerHTML;

        expect(inputParameters[idx].name).to.equal(inputItemLabel);
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

        const group = getGroup(container, 'CamundaPlatform__Input');
        const addEntry = domQuery('.bio-properties-panel-add-entry', group);

        // when
        await act(() => {
          addEntry.click();
        });

        // then
        expect(getBusinessObject(serviceTask).get('extensionElements')).to.exist;
        expect(getInputParameters(serviceTask)).to.have.length(1);
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

      const group = getGroup(container, 'CamundaPlatform__Input');
      const addEntry = domQuery('.bio-properties-panel-add-entry', group);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      expect(getBusinessObject(serviceTask).get('extensionElements')).to.exist;
      expect(getInputParameters(serviceTask)).to.have.length(1);
    }));


    it('should delete input parameter', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const group = getGroup(container, 'CamundaPlatform__Input');
      const listItems = getInputListItems(group);
      const removeEntry = domQuery('.bio-properties-panel-remove-entry', listItems[0]);

      // when
      await act(() => {
        removeEntry.click();
      });

      // then
      expect(getInputParameters(serviceTask)).to.have.length(3);
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalParameters = getInputParameters(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        const group = getGroup(container, 'CamundaPlatform__Input');
        const addEntry = domQuery('.bio-properties-panel-add-entry', group);
        await act(() => {
          addEntry.click();
        });

        // when
        await act(() => {
          commandStack.undo();
        });

        const listItems = getInputListItems(group);

        // then
        expect(listItems.length).to.eql(originalParameters.length);
      })
    );


    describe('integration', function() {

      it('should remove empty input output', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_OneInput');

        await act(() => {
          selection.select(serviceTask);
        });

        const group = getGroup(container, 'CamundaPlatform__Input');
        const listItems = getInputListItems(group);
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

function getInputListItems(container) {
  return getListItems(container, 'inputParameter');
}

function getInputItemLabel(container, id) {
  return domQueryAll('.bio-properties-panel-collapsible-entry-header-title', container)[id];
}