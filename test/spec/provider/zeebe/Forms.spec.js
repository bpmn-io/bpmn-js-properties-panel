import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil.js';

import {
  FORM_TYPES,
  getFormDefinition,
  getRootElement,
  getUserTaskForm
} from 'src/provider/zeebe/utils/FormUtil.js';

import BpmnPropertiesPanel from 'src/render';
import CoreModule from 'bpmn-js/lib/core';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import SelectionModule from 'diagram-js/lib/features/selection';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import BehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './Forms.bpmn';


describe('provider/zeebe - Forms', function() {

  const testModules = [
    BpmnPropertiesPanel,
    CoreModule,
    ModelingModule,
    SelectionModule,
    ZeebePropertiesProvider,
    BehaviorsModule
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


  describe('form type', function() {

    it('should display - embedded form', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CAMUNDA_FORM_EMBEDDED');

      // when
      await act(() => {
        selection.select(userTask);
      });

      const formTypeSelect = getFormTypeSelect(container);

      // then
      expect(formTypeSelect).to.exist;

      expect(formTypeSelect.value).to.equal(FORM_TYPES.CAMUNDA_FORM_EMBEDDED);
    }));


    it('should display - linked form', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CAMUNDA_FORM_LINKED');

      // when
      await act(() => {
        selection.select(userTask);
      });

      const formTypeSelect = getFormTypeSelect(container);

      // then
      expect(formTypeSelect).to.exist;

      expect(formTypeSelect.value).to.equal(FORM_TYPES.CAMUNDA_FORM_LINKED);
    }));


    it('should display - custom form', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CUSTOM_FORM');

      // when
      await act(() => {
        selection.select(userTask);
      });

      const formTypeSelect = getFormTypeSelect(container);

      // then
      expect(formTypeSelect).to.exist;

      expect(formTypeSelect.value).to.equal(FORM_TYPES.CUSTOM_FORM);
    }));


    it('should display - external reference', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CUSTOM_FORM_ZEEBE_USER_TASK');

      // when
      await act(() => {
        selection.select(userTask);
      });

      const formTypeSelect = getFormTypeSelect(container);

      // then
      expect(formTypeSelect).to.exist;

      expect(formTypeSelect.value).to.equal(FORM_TYPES.EXTERNAL_REFERENCE);
    }));


    it('should display - empty', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('NO_FORM');

      // when
      await act(() => {
        selection.select(userTask);
      });

      const formTypeSelect = getFormTypeSelect(container);

      // then
      expect(formTypeSelect).to.exist;

      expect(formTypeSelect.value).to.equal('none');
    }));


    it('should update - empty', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CAMUNDA_FORM_EMBEDDED');

      await act(() => {
        selection.select(userTask);
      });

      const formTypeSelect = getFormTypeSelect(container);

      // when
      changeInput(formTypeSelect, '');

      // then

      const formDefinition = getFormDefinition(userTask);
      expect(formDefinition).to.not.exist;

      const rootElement = getRootElement(userTask);
      const userTaskForms = getExtensionElementsList(rootElement, 'zeebe:UserTaskForm');
      expect(userTaskForms).to.have.lengthOf(0);
    }));


    it('should update - embedded form', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('NO_FORM');

      await act(() => {
        selection.select(userTask);
      });

      const formTypeSelect = getFormTypeSelect(container);

      // when
      changeInput(formTypeSelect, FORM_TYPES.CAMUNDA_FORM_EMBEDDED);

      // then
      expectUserTaskForm(userTask, '');
    }));


    it('should update - linked form', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('NO_FORM');

      await act(() => {
        selection.select(userTask);
      });

      const formTypeSelect = getFormTypeSelect(container);

      // when
      changeInput(formTypeSelect, FORM_TYPES.CAMUNDA_FORM_LINKED);

      // then
      expectFormId(userTask, '');
    }));


    it('should update - custom form', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('NO_FORM');

      await act(() => {
        selection.select(userTask);
      });

      const formTypeSelect = getFormTypeSelect(container);

      // when
      changeInput(formTypeSelect, FORM_TYPES.CUSTOM_FORM);

      // then
      expectFormKey(userTask, '');
    }));


    it('should update - external reference', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('NO_FORM_ZEEBE_USER_TASK');

      await act(() => {
        selection.select(userTask);
      });

      const formTypeSelect = getFormTypeSelect(container);

      // when
      changeInput(formTypeSelect, FORM_TYPES.EXTERNAL_REFERENCE);

      // then
      expectExternalReference(userTask, '');
    }));


    it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('NO_FORM');
      const rootElement = getRootElement(userTask);

      await act(() => {
        selection.select(userTask);
      });

      const formTypeSelect = getFormTypeSelect(container);
      const initialTaskForms = getExtensionElementsList(rootElement, 'zeebe:UserTaskForm').length;

      changeInput(formTypeSelect, FORM_TYPES.CAMUNDA_FORM_EMBEDDED);
      expectUserTaskForm(userTask, '');

      // when
      await act(() => {
        commandStack.undo();
      });

      // expect user task form not to exist
      const formDefinition = getFormDefinition(userTask);
      expect(formDefinition).to.not.exist;

      const forms = getExtensionElementsList(rootElement, 'zeebe:UserTaskForm');
      expect(forms).to.have.lengthOf(initialTaskForms);
    }));

  });


  describe('embedded form', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CAMUNDA_FORM_EMBEDDED');

      // when
      await act(() => {
        selection.select(userTask);
      });

      const formConfigurationTextarea = getFormConfigurationTextarea(container);

      // then
      expect(formConfigurationTextarea).to.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CAMUNDA_FORM_EMBEDDED');

      await act(() => {
        selection.select(userTask);
      });

      const formConfigurationTextarea = getFormConfigurationTextarea(container);

      // when
      changeInput(formConfigurationTextarea, '{ "a": 1 }');

      // then
      expectUserTaskForm(userTask, '{ "a": 1 }');
    }));


    it('should not delete if empty', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CAMUNDA_FORM_EMBEDDED');

      await act(() => {
        selection.select(userTask);
      });

      const formConfigurationTextarea = getFormConfigurationTextarea(container);

      // when
      changeInput(formConfigurationTextarea, '');

      // then
      expectUserTaskForm(userTask, '');
    }));


    it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CAMUNDA_FORM_EMBEDDED');

      await act(() => {
        selection.select(userTask);
      });

      const formConfigurationTextarea = getFormConfigurationTextarea(container);
      const initialConfig = formConfigurationTextarea.value;

      changeInput(formConfigurationTextarea, '{ "a": 1 }');
      expectUserTaskForm(userTask, '{ "a": 1 }');

      // when
      await act(() => {
        commandStack.undo();
      });

      expectUserTaskForm(userTask, initialConfig);
    }));

  });


  describe('linked form', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CAMUNDA_FORM_LINKED');

      // when
      await act(() => {
        selection.select(userTask);
      });

      const formIdInput = getFormIdInput(container);

      // then
      expect(formIdInput).to.exist;
    }));


    it('should display - Zeebe User Task', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CAMUNDA_FORM_LINKED_ZEEBE_USER_TASK');

      // when
      await act(() => {
        selection.select(userTask);
      });

      const formIdInput = getFormIdInput(container);

      // then
      expect(formIdInput).to.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CAMUNDA_FORM_LINKED');

      await act(() => {
        selection.select(userTask);
      });

      const formIdInput = getFormIdInput(container);

      // when
      changeInput(formIdInput, 'bar');

      // then
      expectFormId(userTask, 'bar');
    }));


    it('should not delete if empty', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CAMUNDA_FORM_LINKED');

      await act(() => {
        selection.select(userTask);
      });

      const formIdInput = getFormIdInput(container);

      // when
      changeInput(formIdInput, '');

      // then
      expectFormId(userTask, '');
    }));


    it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CAMUNDA_FORM_LINKED');

      await act(() => {
        selection.select(userTask);
      });

      const formIdInput = getFormIdInput(container);
      const initialFormId = formIdInput.value;

      changeInput(formIdInput, 'bar');
      expectFormId(userTask, 'bar');

      // when
      await act(() => {
        commandStack.undo();
      });

      expectFormId(userTask, initialFormId);
    }));

  });


  describe('custom form', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CUSTOM_FORM');

      // when
      await act(() => {
        selection.select(userTask);
      });

      const customFormKeyInput = getCustomFormKeyInput(container);

      // then
      expect(customFormKeyInput).to.exist;
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CUSTOM_FORM_ZEEBE_USER_TASK');

      // when
      await act(() => {
        selection.select(userTask);
      });

      const customFormKeyInput = getCustomFormKeyInput(container);

      // then
      expect(customFormKeyInput).not.to.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CUSTOM_FORM');

      await act(() => {
        selection.select(userTask);
      });

      const customFormKeyInput = getCustomFormKeyInput(container);

      // when
      changeInput(customFormKeyInput, 'foo');

      // then
      expectFormKey(userTask, 'foo');
    }));


    it('should not delete if empty', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CUSTOM_FORM');

      await act(() => {
        selection.select(userTask);
      });

      const customFormKeyInput = getCustomFormKeyInput(container);

      // when
      changeInput(customFormKeyInput, '');

      // then
      expectFormKey(userTask, '');
    }));


    it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CUSTOM_FORM');

      await act(() => {
        selection.select(userTask);
      });

      const customFormKeyInput = getCustomFormKeyInput(container);
      const initialFormKey = customFormKeyInput.value;

      changeInput(customFormKeyInput, 'bar');
      expectFormKey(userTask, 'bar');

      // when
      await act(() => {
        commandStack.undo();
      });

      expectFormKey(userTask, initialFormKey);
    }));
  });


  describe('external reference', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CUSTOM_FORM_ZEEBE_USER_TASK');

      // when
      await act(() => {
        selection.select(userTask);
      });

      const externalReferenceInput = getExternalReferenceInput(container);

      // then
      expect(externalReferenceInput).to.exist;
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CUSTOM_FORM');

      // when
      await act(() => {
        selection.select(userTask);
      });

      const externalReferenceInput = getExternalReferenceInput(container);

      // then
      expect(externalReferenceInput).not.to.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CUSTOM_FORM_ZEEBE_USER_TASK');

      await act(() => {
        selection.select(userTask);
      });

      const externalReferenceInput = getExternalReferenceInput(container);

      // when
      changeInput(externalReferenceInput, 'foo');

      // then
      expectExternalReference(userTask, 'foo');
    }));


    it('should not delete if empty', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CUSTOM_FORM_ZEEBE_USER_TASK');

      await act(() => {
        selection.select(userTask);
      });

      const externalReferenceInput = getExternalReferenceInput(container);

      // when
      changeInput(externalReferenceInput, '');

      // then
      expectExternalReference(userTask, '');
    }));


    it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('CUSTOM_FORM_ZEEBE_USER_TASK');

      await act(() => {
        selection.select(userTask);
      });

      const externalReferenceInput = getExternalReferenceInput(container);
      const initialFormKey = externalReferenceInput.value;

      changeInput(externalReferenceInput, 'bar');
      expectExternalReference(userTask, 'bar');

      // when
      await act(() => {
        commandStack.undo();
      });

      expectExternalReference(userTask, initialFormKey);
    }));
  });
});


// helpers //////////

function getCustomFormKeyInput(container) {
  return domQuery('input[name=customFormKey]', container);
}

function getExternalReferenceInput(container) {
  return domQuery('input[name=externalReference]', container);
}

function getFormConfigurationTextarea(container) {
  return domQuery('textarea[name=formConfiguration]', container);
}

function getFormIdInput(container) {
  return domQuery('input[name=formId]', container);
}

function getFormTypeSelect(container) {
  return domQuery('select[name=formType]', container);
}

function expectFormId(element, expected) {
  const formDefinition = getFormDefinition(element);

  expect(formDefinition).to.exist;
  expect(formDefinition.get('formId')).to.eql(expected);
}

function expectFormKey(element, expected) {
  const formDefinition = getFormDefinition(element);

  expect(formDefinition).to.exist;
  expect(formDefinition.get('formKey')).to.eql(expected);
}

function expectUserTaskForm(element, expected) {
  const userTaskForm = getUserTaskForm(element);

  expect(userTaskForm).to.exist;
  expect(userTaskForm.get('body')).to.eql(expected);
}

function expectExternalReference(element, expected) {
  const formDefinition = getFormDefinition(element);

  expect(formDefinition).to.exist;
  expect(formDefinition.get('externalReference')).to.eql(expected);
}
