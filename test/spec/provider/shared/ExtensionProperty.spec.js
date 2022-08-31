import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';

import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

import diagramXML from './ExtensionProperty.bpmn';


describe('provider/shared - ExtensionProperty', function() {

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


  describe('bpmn:ServiceTask#property.name', function() {

    it('should NOT display for empty properties',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__ExtensionProperties');
        const nameInput = domQuery('input[name=ServiceTask_empty-extensionProperty-0-name]', group);

        // then
        expect(nameInput).to.not.exist;
      })
    );

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const group = getGroup(container, 'CamundaPlatform__ExtensionProperties');
      const nameInput = domQuery('input[name=ServiceTask_1-extensionProperty-0-name]', group);

      // then
      expect(nameInput.value).to.eql(getProperty(serviceTask, 0).get('name'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const group = getGroup(container, 'CamundaPlatform__ExtensionProperties');
      const nameInput = domQuery('input[name=ServiceTask_1-extensionProperty-0-name]', group);
      changeInput(nameInput, 'newValue');

      // then
      expect(getProperty(serviceTask, 0).get('name')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getProperty(serviceTask, 0).get('name');

        await act(() => {
          selection.select(serviceTask);
        });
        const group = getGroup(container, 'CamundaPlatform__ExtensionProperties');
        const nameInput = domQuery('input[name=ServiceTask_1-extensionProperty-0-name]', group);
        changeInput(nameInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(nameInput.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:ServiceTask#property.value', function() {

    it('should NOT display for empty properties',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const group = getGroup(container, 'CamundaPlatform__ExtensionProperties');
        const valueInput = domQuery('input[name=ServiceTask_empty-extensionProperty-0-value]', group);

        // then
        expect(valueInput).to.not.exist;
      })
    );

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const group = getGroup(container, 'CamundaPlatform__ExtensionProperties');
      const valueInput = domQuery('input[name=ServiceTask_1-extensionProperty-0-value]', group);

      // then
      expect(valueInput.value).to.eql(getProperty(serviceTask, 0).get('value'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const group = getGroup(container, 'CamundaPlatform__ExtensionProperties');
      const valueInput = domQuery('input[name=ServiceTask_1-extensionProperty-0-value]', group);
      changeInput(valueInput, 'newValue');

      // then
      expect(getProperty(serviceTask, 0).get('value')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getProperty(serviceTask, 0).get('value');

        await act(() => {
          selection.select(serviceTask);
        });
        const valueInput = domQuery('input[name=ServiceTask_1-extensionProperty-0-value]', container);
        changeInput(valueInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(valueInput.value).to.eql(originalValue);
      })
    );

  });

});


// helper //////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getProperties(element) {
  const businessObject = getBusinessObject(element);
  return getExtensionElementsList(businessObject, 'camunda:Properties')[0];
}

function getPropertiesList(element) {
  const properties = getProperties(element);
  return properties && properties.get('values');
}

function getProperty(element, idx) {
  return (getPropertiesList(element) || [])[idx];
}
