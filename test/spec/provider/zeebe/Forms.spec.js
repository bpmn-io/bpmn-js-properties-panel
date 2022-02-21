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
  find
} from 'min-dash';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil.js';

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


  describe('zeebe:userTaskForm', function() {

    describe('form type', function() {

      it('should display - custom key', inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('WITH_CAMUNDA_FORM');

        // when
        await act(() => {
          selection.select(userTask);
        });

        const formInput = getFormInput(container);

        // then
        expect(formInput).to.exist;

        expect(formInput.value).to.equal('camundaForm');
      }));


      it('should display - camunda form', inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('WITH_CUSTOM_KEY');

        // when
        await act(() => {
          selection.select(userTask);
        });

        const formInput = getFormInput(container);

        // then
        expect(formInput).to.exist;

        expect(formInput.value).to.equal('formKey');
      }));


      it('should display - empty', inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('NO_FORM');

        // when
        await act(() => {
          selection.select(userTask);
        });

        const formInput = getFormInput(container);

        // then
        expect(formInput).to.exist;

        expect(formInput.value).to.equal('');
      }));


      it('should update - empty', inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('WITH_CAMUNDA_FORM');

        await act(() => {
          selection.select(userTask);
        });

        const formInput = getFormInput(container);

        // when
        changeInput(formInput, '');

        // then

        // expect user task form not to exist
        const formDefinition = getFormDefinition(userTask);
        expect(formDefinition).to.not.exist;

        // expect form definnition not to exist
        const rootElement = getRootElement(userTask);
        const forms = getExtensionElementsList(rootElement, 'zeebe:UserTaskForm');
        expect(forms).to.have.lengthOf(0);
      }));


      it('should update - camunda form', inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('NO_FORM');

        await act(() => {
          selection.select(userTask);
        });

        const formInput = getFormInput(container);

        // when
        changeInput(formInput, 'camundaForm');

        // then
        expectCamundaForm(userTask, '');
      }));


      it('should update - custom key', inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('NO_FORM');

        await act(() => {
          selection.select(userTask);
        });

        const formInput = getFormInput(container);

        // when
        changeInput(formInput, 'formKey');

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

        const formInput = getFormInput(container);
        const initialTaskForms = getExtensionElementsList(rootElement, 'zeebe:UserTaskForm').length;

        changeInput(formInput, 'camundaForm');
        expectCamundaForm(userTask, '');

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


    describe('camunda form', function() {

      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('WITH_CAMUNDA_FORM');

        // when
        await act(() => {
          selection.select(userTask);
        });

        const formConfig = getFormConfig(container);

        // then
        expect(formConfig).to.exist;
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('WITH_CAMUNDA_FORM');

        await act(() => {
          selection.select(userTask);
        });

        const formConfig = getFormConfig(container);

        // when
        changeInput(formConfig, '{ "a": 1 }');

        // then
        expectCamundaForm(userTask, '{ "a": 1 }');
      }));


      it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('WITH_CAMUNDA_FORM');

        await act(() => {
          selection.select(userTask);
        });

        const formConfig = getFormConfig(container);
        const initialConfig = formConfig.value;

        changeInput(formConfig, '{ "a": 1 }');
        expectCamundaForm(userTask, '{ "a": 1 }');

        // when
        await act(() => {
          commandStack.undo();
        });

        // expect form definnition not to exist
        expectCamundaForm(userTask, initialConfig);
      }));

    });


    describe('custom key', function() {

      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('WITH_CUSTOM_KEY');

        // when
        await act(() => {
          selection.select(userTask);
        });

        const formKey = getCustomKey(container);

        // then
        expect(formKey).to.exist;
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('WITH_CUSTOM_KEY');

        await act(() => {
          selection.select(userTask);
        });

        const formKey = getCustomKey(container);

        // when
        changeInput(formKey, 'customKey');

        // then
        expectFormKey(userTask, 'customKey');
      }));


      it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('WITH_CUSTOM_KEY');

        await act(() => {
          selection.select(userTask);
        });

        const formKey = getCustomKey(container);
        const initialFormKey = formKey.value;

        changeInput(formKey, '');
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

});


// helpers /////////////////////

function getFormInput(container) {
  return domQuery('select[name=formType]', container);
}

function getFormConfig(container) {
  return domQuery('textarea[name=formConfiguration]', container);
}

function getCustomKey(container) {
  return domQuery('input[name=customFormKey]', container);
}

function expectFormKey(element, key) {
  const formDefinition = getFormDefinition(element);

  expect(formDefinition).to.exist;
  expect(formDefinition.formKey).to.eql(key);
}

function expectCamundaForm(element, body) {

  // (1) get form definition from user task
  const formDefinition = getFormDefinition(element);

  // (1.2) assume existing
  expect(formDefinition).to.exist;

  const rootElement = getRootElement(element);

  // (2) assume corresponding task form on root element
  const formKey = formDefinition.get('formKey');

  const form = findUserTaskForm(formKey, rootElement);

  expect(form).to.exist;

  expect(form.body).to.eql(body);
}

function getFormDefinition(element) {
  const businessObject = getBusinessObject(element);

  const formDefinitions = getExtensionElementsList(businessObject, 'zeebe:FormDefinition');

  return formDefinitions[0];
}

function createFormKey(formId) {
  return 'camunda-forms:bpmn:' + formId;
}

function findUserTaskForm(formKey, rootElement) {
  const forms = getExtensionElementsList(rootElement, 'zeebe:UserTaskForm');

  return find(forms, function(userTaskForm) {
    return createFormKey(userTaskForm.id) === formKey;
  });
}

function getRootElement(element) {
  var businessObject = getBusinessObject(element),
      parent = businessObject;

  while (parent.$parent && !is(parent, 'bpmn:Process')) {
    parent = parent.$parent;
  }

  return parent;
}
