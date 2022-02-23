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


describe('provider/camunda-platform - FormFieldConstraint', function() {

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


  describe('#Name', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(task);
      });

      const nameInput = domQuery('#bio-properties-panel-UserTask_1-formField-0-formFieldConstraints-constraint-0-name', container);
      const validation = getFormFieldValidation(task, 0);

      // then
      expect(nameInput).to.exist;
      expect(nameInput.value).to.equal(validation.get('constraints')[0].name);
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(task);
      });

      const nameInput = domQuery('#bio-properties-panel-UserTask_1-formField-0-formFieldConstraints-constraint-0-name', container);
      const validation = getFormFieldValidation(task, 0);

      // when
      changeInput(nameInput, 'newVal');

      // then
      expect(validation.get('constraints')[0].name).to.equal('newVal');
    }));


    it('should update on external change', inject(
      async function(elementRegistry, selection, commandStack) {

        // given
        const task = elementRegistry.get('UserTask_1');
        const validation = getFormFieldValidation(task, 0);
        const originalValue = validation.get('constraints')[0].name;

        await act(() => {
          selection.select(task);
        });

        const nameInput = domQuery('#bio-properties-panel-UserTask_1-formField-0-formFieldConstraints-constraint-0-name', container);

        changeInput(nameInput, 'newVal');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(nameInput.value).to.eql(originalValue);
      }));

  });


  describe('#Config', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(task);
      });

      const configInput = domQuery('#bio-properties-panel-UserTask_1-formField-0-formFieldConstraints-constraint-0-config', container);
      const validation = getFormFieldValidation(task, 0);

      // then
      expect(configInput).to.exist;
      expect(configInput.value).to.equal(validation.get('constraints')[0].config);
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(task);
      });

      const configInput = domQuery('#bio-properties-panel-UserTask_1-formField-0-formFieldConstraints-constraint-0-config', container);
      const validation = getFormFieldValidation(task, 0);

      // when
      changeInput(configInput, 'newVal');

      // then
      expect(validation.get('constraints')[0].config).to.equal('newVal');
    }));


    it('should update on external change', inject(
      async function(elementRegistry, selection, commandStack) {

        // given
        const task = elementRegistry.get('UserTask_1');
        const validation = getFormFieldValidation(task, 0);
        const originalValue = validation.get('constraints')[0].config;

        await act(() => {
          selection.select(task);
        });

        const configInput = domQuery('#bio-properties-panel-UserTask_1-formField-0-formFieldConstraints-constraint-0-config', container);

        changeInput(configInput, 'newVal');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(configInput.value).to.eql(originalValue);
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

function getFormFieldValidation(element, formFieldIdx) {
  return getFormField(element, formFieldIdx).get('validation');
}
