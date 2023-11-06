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

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import diagramXML from './FormProps.bpmn';


describe('provider/camunda-platform - FormProps', function() {

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


  describe('camunda:formKey', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_FormKey');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = domQuery('input[name=formKey]', container);

      // then
      expect(input).to.exist;
      expect(input.value).to.equal(getBusinessObject(task).get('camunda:formKey'));
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_FormRef');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = domQuery('input[name=formKey]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_FormKey');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = domQuery('input[name=formKey]', container);

      changeInput(input, 'newValue');

      // then
      expect(getBusinessObject(task).get('camunda:formKey')).to.equal('newValue');

      expect(input.value).to.equal('newValue');
    }));


    it('should not delete if empty', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_FormKey');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = domQuery('input[name=formKey]', container);

      changeInput(input, '');

      // then
      expect(getBusinessObject(task).get('camunda:formKey')).to.equal('');

      expect(input.value).to.equal('');
    }));


    it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_FormKey');

      const originalValue = getBusinessObject(task).get('camunda:formKey');

      await act(() => {
        selection.select(task);
      });

      const input = domQuery('input[name=formKey]', container);

      changeInput(input, 'newValue');

      // when
      await act(() => {
        commandStack.undo();
      });

      // then
      expect(getBusinessObject(task).get('camunda:formKey')).to.equal(originalValue);

      expect(input.value).to.equal(originalValue);
    }));

  });


  describe('camunda:formRef', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_FormRef');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = domQuery('input[name=formRef]', container);

      // then
      expect(input).to.exist;
      expect(input.value).to.equal(getBusinessObject(task).get('camunda:formRef'));
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_FormKey');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = domQuery('input[name=formRef]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_FormRef');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = domQuery('input[name=formRef]', container);

      changeInput(input, 'newValue');

      // then
      expect(getBusinessObject(task).get('camunda:formRef')).to.equal('newValue');

      expect(input.value).to.equal('newValue');
    }));


    it('should not delete if empty', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_FormRef');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = domQuery('input[name=formRef]', container);

      changeInput(input, '');

      // then
      expect(getBusinessObject(task).get('camunda:formRef')).to.equal('');

      expect(input.value).to.equal('');
    }));


    it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_FormRef');

      const originalValue = getBusinessObject(task).get('camunda:formRef');

      await act(() => {
        selection.select(task);
      });

      const input = domQuery('input[name=formRef]', container);

      changeInput(input, 'newValue');

      // when
      await act(() => {
        commandStack.undo();
      });

      // then
      expect(getBusinessObject(task).get('camunda:formRef')).to.equal(originalValue);

      expect(input.value).to.equal(originalValue);
    }));

  });


  describe('camunda:formRefBinding', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_FormRef');

      await act(() => {
        selection.select(task);
      });

      // when
      const select = domQuery('select[name=formRefBinding]', container);

      // then
      expect(select).to.exist;
      expect(select.value).to.equal('version');

      expect(asOptionNamesList(select)).to.eql([
        'deployment',
        'latest',
        'version'
      ]);
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_FormKey');

      await act(() => {
        selection.select(task);
      });

      // when
      const select = domQuery('select[name=formRefBinding]', container);

      // then
      expect(select).to.not.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_FormRef');

      await act(() => {
        selection.select(task);
      });

      // when
      const select = domQuery('select[name=formRefBinding]', container);

      changeInput(select, 'deployment');

      // then
      expect(getBusinessObject(task).get('camunda:formRefBinding')).to.equal('deployment');

      expect(select.value).to.equal('deployment');
    }));


    it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_FormRef');

      const originalValue = getBusinessObject(task).get('camunda:formRefBinding');

      await act(() => {
        selection.select(task);
      });

      const select = domQuery('select[name=formRefBinding]', container);

      // TODO: use changeSelect
      changeInput(select, 'deployment');

      // when
      await act(() => {
        commandStack.undo();
      });

      // then
      expect(getBusinessObject(task).get('camunda:formRefBinding')).to.equal(originalValue);

      expect(select.value).to.equal(originalValue);
    }));

  });


  describe('camunda:formRefVersion', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_FormRef');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = domQuery('input[name=formRefVersion]', container);

      // then
      expect(input).to.exist;
      expect(input.value).to.equal(getBusinessObject(task).get('camunda:formRefVersion'));
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_FormKey');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = domQuery('input[name=formRefVersion]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_FormRef');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = domQuery('input[name=formRefVersion]', container);

      changeInput(input, 'newValue');

      // then
      expect(getBusinessObject(task).get('camunda:formRefVersion')).to.equal('newValue');

      expect(input.value).to.equal('newValue');
    }));


    it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_FormRef');

      const originalValue = getBusinessObject(task).get('camunda:formRefVersion');

      await act(() => {
        selection.select(task);
      });

      const input = domQuery('input[name=formRefVersion]', container);

      changeInput(input, 'newValue');

      // when
      await act(() => {
        commandStack.undo();
      });

      // then
      expect(getBusinessObject(task).get('camunda:formRefVersion')).to.equal(originalValue);

      expect(input.value).to.equal(originalValue);
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