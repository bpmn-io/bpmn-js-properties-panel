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

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import {
  getInputOutput,
  getInputParameters
} from 'src/provider/camunda-platform/utils/InputOutputUtil';

import {
  getConnector
} from 'src/provider/camunda-platform/utils/ConnectorUtil';

import diagramXML from './ConnectorInputProps.bpmn';


describe('provider/camunda-platform - ConnectorInputProps', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
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


  describe('bpmn:ServiceTask#connector.inputParameters', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const group = getGroup(container, 'CamundaPlatform__ConnectorInput');
      const listItems = getInputListItems(group);

      // then
      expect(group).to.exist;
      expect(listItems.length).to.equal(getConnectorInputParameters(serviceTask).length);
    }));


    it('should add new input parameter', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const group = getGroup(container, 'CamundaPlatform__ConnectorInput');
      const addEntry = domQuery('.bio-properties-panel-add-entry', group);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      expect(getConnectorInputParameters(serviceTask)).to.have.length(5);
    }));


    it('should create non existing inputOutput',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');
        const connector = getConnector(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        // assume
        expect(getInputOutput(connector)).not.to.exist;

        const group = getGroup(container, 'CamundaPlatform__ConnectorInput');
        const addEntry = domQuery('.bio-properties-panel-add-entry', group);

        // when
        await act(() => {
          addEntry.click();
        });

        // then
        expect(getInputOutput(connector)).to.exist;
        expect(getConnectorInputParameters(serviceTask)).to.have.length(1);
      })
    );


    it('should delete input parameter', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const group = getGroup(container, 'CamundaPlatform__ConnectorInput');
      const listItems = getInputListItems(group);
      const removeEntry = domQuery('.bio-properties-panel-remove-entry', listItems[0]);

      // when
      await act(() => {
        removeEntry.click();
      });

      // then
      expect(getConnectorInputParameters(serviceTask)).to.have.length(3);
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalParameters = getConnectorInputParameters(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        const group = getGroup(container, 'CamundaPlatform__ConnectorInput');
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
  return getListItems(container, 'connector-inputParameter');
}

function getConnectorInputParameters(element) {
  const connector = getConnector(element);
  return getInputParameters(connector);
}