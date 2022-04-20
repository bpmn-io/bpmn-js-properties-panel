import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
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

import BehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-platform';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import diagramXML from './FormProps.bpmn';


describe('provider/camunda-platform - FormTypeProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CamundaPlatformPropertiesProvider,
    CoreModule,
    ModelingModule,
    SelectionModule,
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


  it('should display', inject(async function(elementRegistry, selection) {

    // given
    const task = elementRegistry.get('UserTask_FormKey');

    await act(() => {
      selection.select(task);
    });

    // when
    const select = domQuery('select[name=formType]', container);

    // then
    expect(select).to.exist;
    expect(select.value).to.equal('formKey');

    expect(asOptionNamesList(select)).to.eql([
      '<none>',
      'Camunda Forms',
      'Embedded or External Task Forms',
      'Generated Task Forms'
    ]);
  }));


  it('should NOT display', inject(async function(elementRegistry, selection) {

    // given
    const task = elementRegistry.get('Task_1');

    await act(() => {
      selection.select(task);
    });

    // when
    const select = domQuery('select[name=formType]', container);

    // then
    expect(select).to.not.exist;
  }));


  it('should add formData, creating extensionElements', inject(async function(elementRegistry, selection) {

    // given
    const task = elementRegistry.get('UserTask');

    await act(() => {
      selection.select(task);
    });

    // assume
    let formData = getFormData(task);
    let formDataGroup = domQuery('div[data-group-id=group-CamundaPlatform__FormData]', container);
    let extElements = getExtensionElementsList(getBusinessObject(task));
    expect(formData).to.not.exist;
    expect(formDataGroup).to.not.exist;
    expect(extElements).to.have.length(0);

    // when
    const select = domQuery('select[name=formType]', container);
    changeInput(select, 'formData');

    // then
    formDataGroup = domQuery('div[data-group-id=group-CamundaPlatform__FormData]', container);
    formData = getFormData(task);
    extElements = getExtensionElementsList(getBusinessObject(task));

    expect(formData).to.exist;
    expect(formDataGroup).to.exist;
    expect(extElements).to.have.length(1);
  }));


  it('should add formData, re-using extensionElements', inject(async function(elementRegistry, selection) {

    // given
    const task = elementRegistry.get('UserTask_FormRef');

    await act(() => {
      selection.select(task);
    });

    // assume
    let formData = getFormData(task);
    let formDataGroup = domQuery('div[data-group-id=group-CamundaPlatform__FormData]', container);
    let extElements = getExtensionElementsList(getBusinessObject(task));
    expect(formData).to.not.exist;
    expect(formDataGroup).to.not.exist;
    expect(extElements).to.have.length(1);

    // when
    const select = domQuery('select[name=formType]', container);
    changeInput(select, 'formData');

    // then
    formDataGroup = domQuery('div[data-group-id=group-CamundaPlatform__FormData]', container);
    formData = getFormData(task);
    extElements = getExtensionElementsList(getBusinessObject(task));

    expect(formData).to.exist;
    expect(formDataGroup).to.exist;
    expect(extElements).to.have.length(2);
  }));


  it('should remove formData, keeping extension elements', inject(async function(elementRegistry, selection) {

    // given
    const task = elementRegistry.get('UserTask_GeneratedForm');

    await act(() => {
      selection.select(task);
    });

    // assume
    let formData = getFormData(task);
    let formDataGroup = domQuery('div[data-group-id=group-CamundaPlatform__FormData]', container);
    let extElements = getExtensionElementsList(getBusinessObject(task));
    expect(formData).to.exist;
    expect(formDataGroup).to.exist;
    expect(extElements).to.have.length(2);

    // when
    const select = domQuery('select[name=formType]', container);
    changeInput(select, '');

    // then
    formDataGroup = domQuery('div[data-group-id=group-CamundaPlatform__FormData]', container);
    formData = getFormData(task);
    extElements = getExtensionElementsList(getBusinessObject(task));

    expect(formData).to.not.exist;
    expect(formDataGroup).to.not.exist;
    expect(extElements).to.have.length(1);
  }));


  describe('update', function() {

    it('from <none> to Embedded or External Task Forms', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask');

      await act(() => {
        selection.select(task);
      });

      // when
      const select = domQuery('select[name=formType]', container);

      changeInput(select, 'formKey');

      // then
      expect(getBusinessObject(task).get('camunda:formKey')).to.equal('');

      expect(select.value).to.equal('formKey');
    }));


    it('from <none> to Camunda Forms', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask');

      await act(() => {
        selection.select(task);
      });

      // when
      const select = domQuery('select[name=formType]', container);

      changeInput(select, 'formRef');

      // then
      expect(getBusinessObject(task).get('camunda:formRef')).to.equal('');

      expect(select.value).to.equal('formRef');
    }));


    it('from Embedded or External Task Forms to <none>', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_FormKey');

      await act(() => {
        selection.select(task);
      });

      // when
      const select = domQuery('select[name=formType]', container);

      changeInput(select, '');

      // then
      expect(getBusinessObject(task).get('camunda:formKey')).not.to.exist;

      expect(select.value).to.equal('');
    }));

  });


  it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

    // given
    const task = elementRegistry.get('UserTask');

    await act(() => {
      selection.select(task);
    });

    const select = domQuery('select[name=formType]', container);

    changeInput(select, 'formKey');

    // when
    await act(() => {
      commandStack.undo();
    });

    // then
    expect(getBusinessObject(task).get('camunda:formKey')).not.to.exist;

    expect(select.value).to.equal('');
  }));


  describe('integration', function() {

    it('should remove form key when form ref is set', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('StartEvent_FormKey'),
            businessObject = getBusinessObject(task);

      await act(() => {
        selection.select(task);
      });

      // when
      const select = domQuery('select[name=formType]', container);

      changeInput(select, 'formRef');

      // then
      expect(businessObject.get('camunda:formKey')).not.to.exist;
      expect(businessObject.get('camunda:formRef')).to.equal('');
    }));


    it('should remove form ref when form key is set', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('StartEvent_FormRef'),
            businessObject = getBusinessObject(task);

      await act(() => {
        selection.select(task);
      });

      // when
      const select = domQuery('select[name=formType]', container);

      changeInput(select, 'formKey');

      // then
      expect(businessObject.get('camunda:formRef')).not.to.exist;
      expect(businessObject.get('camunda:formRefBinding')).not.to.exist;
      expect(businessObject.get('camunda:formRefVersion')).not.to.exist;
      expect(businessObject.get('camunda:formKey')).to.equal('');
    }));

  });

});

// helpers //////////

function asOptionNamesList(select) {
  const names = [];
  const options = domQueryAll('option', select);

  options.forEach(o => names.push(o.label));

  return names;
}

function getFormData(element) {
  const bo = getBusinessObject(element);

  return getExtensionElementsList(bo, 'camunda:FormData')[0];
}