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

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('WITH_FORM');

      // when
      await act(() => {
        selection.select(userTask);
      });

      const formInput = getFormInput(container);

      // then
      expect(formInput).to.exist;

      expect(formInput.value).to.equal('{}');
    }));


    it('should display empty', inject(async function(elementRegistry, selection) {

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


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('WITH_FORM');

      await act(() => {
        selection.select(userTask);
      });

      const formInput = getFormInput(container);

      // when
      changeInput(formInput, '{ "a": 1 }');

      // then
      expectForm(userTask, '{ "a": 1 }');
    }));


    it('should remove', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('WITH_FORM');

      await act(() => {
        selection.select(userTask);
      });

      const formInput = getFormInput(container);

      // when
      changeInput(formInput, '');

      // then
      expectForm(userTask, null);
    }));


    it('should add', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('NO_FORM');

      await act(() => {
        selection.select(userTask);
      });

      const formInput = getFormInput(container);

      // when
      changeInput(formInput, '{}');

      // then
      expectForm(userTask, '{}');
    }));

  });

});


// helpers /////////////////////

function getFormInput(container) {
  return domQuery('textarea[name=formConfiguration]', container);
}

function expectForm(element, body) {

  // (1) get form definition from user task
  const formDefinition = getFormDefinition(element);

  // (2.1) assume removed, if no body
  if (!body) {
    expect(formDefinition).not.to.exist;

    return;
  }

  // (2.2) assume existing
  expect(formDefinition).to.exist;

  const rootElement = getRootElement(element);

  // (3) assume corresponding task form on root element
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
