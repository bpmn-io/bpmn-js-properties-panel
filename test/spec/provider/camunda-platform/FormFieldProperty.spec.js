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

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import diagramXML from './FormField.bpmn';


describe('provider/camunda-platform - FormFieldProperty', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CamundaPlatformPropertiesProvider,
    CoreModule,
    ModelingModule,
    SelectionModule
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


  describe('#ID', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(task);
      });

      const idInput = domQuery('#bio-properties-panel-UserTask_1-formField-0-formFieldProperties-property-1-id', container);
      const properties = getFormFieldProperties(task, 0);

      // then
      expect(idInput).to.exist;
      expect(idInput.value).to.equal(properties.get('values')[0].id);
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(task);
      });

      const idInput = domQuery('#bio-properties-panel-UserTask_1-formField-0-formFieldProperties-property-1-id', container);
      const properties = getFormFieldProperties(task, 0);

      // when
      changeInput(idInput, 'newVal');

      // then
      expect(properties.get('values')[0].id).to.equal('newVal');
    }));


    it('should update on external change', inject(
      async function(elementRegistry, selection, commandStack) {

        // given
        const task = elementRegistry.get('UserTask_1');
        const properties = getFormFieldProperties(task, 0);
        const originalValue = properties.get('values')[0].id;

        await act(() => {
          selection.select(task);
        });

        const idInput = domQuery('#bio-properties-panel-UserTask_1-formField-0-formFieldProperties-property-1-id', container);

        changeInput(idInput, 'newVal');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(idInput.value).to.eql(originalValue);
      }));

  });


  describe('#Value', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(task);
      });

      const valueInput = domQuery('#bio-properties-panel-UserTask_1-formField-0-formFieldProperties-property-1-value', container);
      const properties = getFormFieldProperties(task, 0);

      // then
      expect(valueInput).to.exist;
      expect(valueInput.value).to.equal(properties.get('values')[0].value);
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(task);
      });

      const valueInput = domQuery('#bio-properties-panel-UserTask_1-formField-0-formFieldProperties-property-1-value', container);
      const properties = getFormFieldProperties(task, 0);

      // when
      changeInput(valueInput, 'newVal');

      // then
      expect(properties.get('values')[0].value).to.equal('newVal');
    }));


    it('should update on external change', inject(
      async function(elementRegistry, selection, commandStack) {

        // given
        const task = elementRegistry.get('UserTask_1');
        const properties = getFormFieldProperties(task, 0);
        const originalValue = properties.get('values')[0].value;

        await act(() => {
          selection.select(task);
        });

        const valueInput = domQuery('#bio-properties-panel-UserTask_1-formField-0-formFieldProperties-property-1-value', container);

        changeInput(valueInput, 'newVal');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(valueInput.value).to.eql(originalValue);
      }));

  });

});

// helper //////

function getFormData(element) {
  const bo = getBusinessObject(element);

  return getExtensionElementsList(bo, 'camunda:FormData')[0];
}

function getFormFieldsList(element) {
  const businessObject = getBusinessObject(element);

  const formData = getFormData(businessObject);

  return formData && formData.fields;
}

function getFormField(element, idx) {
  return getFormFieldsList(element)[idx];
}

function getFormFieldProperties(element, formFieldIdx) {
  return getFormField(element, formFieldIdx).get('properties');
}
