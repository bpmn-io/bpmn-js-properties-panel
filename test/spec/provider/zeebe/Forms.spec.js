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

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './Forms.bpmn';


describe('provider/zeebe - Forms', function() {

  const testModules = [
    BpmnPropertiesPanel,
    CoreModule,
    ModelingModule,
    SelectionModule,
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


  describe('form type', function() {

    it('should display - embedded form', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('WITH_CAMUNDA_FORM');

      // when
      await act(() => {
        selection.select(userTask);
      });

      const formTypeSelect = getFormTypeSelect(container);

      // then
      expect(formTypeSelect).to.exist;

      expect(formTypeSelect.value).to.equal(FORM_TYPES.CAMUNDA_FORM_EMBEDDED);
    }));


    it('should display - custom form', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('WITH_CUSTOM_KEY');

      // when
      await act(() => {
        selection.select(userTask);
      });

      const formTypeSelect = getFormTypeSelect(container);

      // then
      expect(formTypeSelect).to.exist;

      expect(formTypeSelect.value).to.equal(FORM_TYPES.CUSTOM_FORM);
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

      expect(formTypeSelect.value).to.equal('');
    }));


    it('should update - empty', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('WITH_CAMUNDA_FORM');

      await act(() => {
        selection.select(userTask);
      });

      const formTypeSelect = getFormTypeSelect(container);

      // when
      changeInput(formTypeSelect, '');

      // then

      // expect user task form not to exist
      const formDefinition = getFormDefinition(userTask);
      expect(formDefinition).to.not.exist;

      // expect form definnition not to exist
      const rootElement = getRootElement(userTask);
      const forms = getExtensionElementsList(rootElement, 'zeebe:UserTaskForm');
      expect(forms).to.have.lengthOf(0);
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

      // expect form definnition not to exist
      const forms = getExtensionElementsList(rootElement, 'zeebe:UserTaskForm');
      expect(forms).to.have.lengthOf(initialTaskForms);
    }));

  });


  describe('embedded form', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('WITH_CAMUNDA_FORM');

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
      const userTask = elementRegistry.get('WITH_CAMUNDA_FORM');

      await act(() => {
        selection.select(userTask);
      });

      const formConfigurationTextarea = getFormConfigurationTextarea(container);

      // when
      changeInput(formConfigurationTextarea, '{ "a": 1 }');

      // then
      expectUserTaskForm(userTask, '{ "a": 1 }');
    }));


    it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('WITH_CAMUNDA_FORM');

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

      // expect form definnition not to exist
      expectUserTaskForm(userTask, initialConfig);
    }));

  });


  describe('custom form', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('WITH_CUSTOM_KEY');

      // when
      await act(() => {
        selection.select(userTask);
      });

      const customFormKeyInput = getCustomFormKeyInput(container);

      // then
      expect(customFormKeyInput).to.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('WITH_CUSTOM_KEY');

      await act(() => {
        selection.select(userTask);
      });

      const customFormKeyInput = getCustomFormKeyInput(container);

      // when
      changeInput(customFormKeyInput, 'customKey');

      // then
      expectFormKey(userTask, 'customKey');
    }));


    it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('WITH_CUSTOM_KEY');

      await act(() => {
        selection.select(userTask);
      });

      const customFormKeyInput = getCustomFormKeyInput(container);
      const initialFormKey = customFormKeyInput.value;

      changeInput(customFormKeyInput, '');
      expectFormKey(userTask, 'customKey');

      // when
      await act(() => {
        commandStack.undo();
      });

      // expect form definnition not to exist
      expectFormKey(userTask, initialFormKey);
    }));

  });

});


// helpers //////////

function getCustomFormKeyInput(container) {
  return domQuery('input[name=customFormKey]', container);
}

function getFormConfigurationTextarea(container) {
  return domQuery('textarea[name=formConfiguration]', container);
}

function getFormTypeSelect(container) {
  return domQuery('select[name=formType]', container);
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