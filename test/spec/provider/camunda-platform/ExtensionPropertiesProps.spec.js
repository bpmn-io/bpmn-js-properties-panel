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

import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

import diagramXML from './ExtensionPropertiesProps.bpmn';


describe('provider/camunda-platform - ExtensionPropertiesProps', function() {

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


  describe('bpmn:ServiceTask#properties', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const group = getGroup(container, 'CamundaPlatform__ExtensionProperties');
      const listItems = getPropertiesListItems(group);

      // then
      expect(group).to.exist;
      expect(listItems.length).to.equal(getPropertiesList(serviceTask).length);
    }));


    it('should add new property', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const group = getGroup(container, 'CamundaPlatform__ExtensionProperties');
      const addEntry = domQuery('.bio-properties-panel-add-entry', group);

      // when
      await act(() => {
        addEntry.click();
      });

      // then
      expect(getPropertiesList(serviceTask)).to.have.length(4);
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

        const group = getGroup(container, 'CamundaPlatform__ExtensionProperties');
        const addEntry = domQuery('.bio-properties-panel-add-entry', group);

        // when
        await act(() => {
          addEntry.click();
        });

        // then
        expect(getBusinessObject(serviceTask).get('extensionElements')).to.exist;
      })
    );


    it('should create non existing camunda:Properties',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_noProperties');

        await act(() => {
          selection.select(serviceTask);
        });

        // assume
        expect(getProperties(serviceTask)).not.to.exist;

        const group = getGroup(container, 'CamundaPlatform__ExtensionProperties');
        const addEntry = domQuery('.bio-properties-panel-add-entry', group);

        // when
        await act(() => {
          addEntry.click();
        });

        // then
        expect(getProperties(serviceTask)).to.exist;
      })
    );


    it('should delete property', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const group = getGroup(container, 'CamundaPlatform__ExtensionProperties');
      const listItems = getPropertiesListItems(group);
      const removeEntry = domQuery('.bio-properties-panel-remove-entry', listItems[0]);

      // when
      await act(() => {
        removeEntry.click();
      });

      // then
      expect(getPropertiesList(serviceTask)).to.have.length(2);
    }));


    it('should remove camunda:Properties on last delete', inject(
      async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_2');

        await act(() => {
          selection.select(serviceTask);
        });

        // assume
        expect(getProperties(serviceTask)).to.exist;

        const group = getGroup(container, 'CamundaPlatform__ExtensionProperties');
        const listItems = getPropertiesListItems(group);
        const removeEntry = domQuery('.bio-properties-panel-remove-entry', listItems[0]);

        // when
        await act(() => {
          removeEntry.click();
        });

        // then
        expect(getProperties(serviceTask)).not.to.exist;
      })
    );


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalProperties = getPropertiesList(serviceTask);

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

        const group = getGroup(container, 'CamundaPlatform__ExtensionProperties');
        const listItems = getPropertiesListItems(group);

        // then
        expect(listItems.length).to.eql(originalProperties.length);
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

function getPropertiesListItems(container) {
  return getListItems(container, 'extensionProperty');
}

function getProperties(element) {
  const businessObject = getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'camunda:Properties')[0];
}

function getPropertiesList(element) {
  const properties = getProperties(element);
  return properties && properties.get('values');
}