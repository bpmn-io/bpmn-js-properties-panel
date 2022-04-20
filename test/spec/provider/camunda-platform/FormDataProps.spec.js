import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  clickInput,
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

import diagramXML from './FormDataProps.bpmn';


describe('provider/camunda-platform - FormDataProps', function() {

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


  describe('add', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('StartEvent_2');

      await act(() => {
        selection.select(event);
      });

      // when
      const formDataGroup = domQuery('div[data-group-id=group-CamundaPlatform__FormData]', container);

      // then
      expect(formDataGroup).to.not.exist;
    }));


    it('should NOT display if generated task not selected', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('Task_2');

      await act(() => {
        selection.select(event);
      });

      // when
      const formDataGroup = domQuery('div[data-group-id=group-CamundaPlatform__FormData]', container);

      // then
      expect(formDataGroup).to.not.exist;
    }));



    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(event);
      });

      // when
      const formDataGroup = domQuery('div[data-group-id=group-CamundaPlatform__FormData]', container);
      const addFormFieldButton = domQuery('.bio-properties-panel-add-entry', formDataGroup);

      // then
      expect(addFormFieldButton).to.exist;
    }));


    it('should add formField to existing formData', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(event);
      });

      // assume
      const formData = getFormData(event);
      expect(formData).to.exist;
      expect(formData.fields).to.have.length(1);

      // when
      const formDataGroup = domQuery('div[data-group-id=group-CamundaPlatform__FormData]', container);
      const addFormFieldButton = domQuery('.bio-properties-panel-add-entry', formDataGroup);
      clickInput(addFormFieldButton);

      // then
      expect(formData).to.exist;
      expect(formData.fields).to.have.length(2);
    }));


    it('should add formField to bottom', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const formDataGroup = domQuery('div[data-group-id=group-CamundaPlatform__FormData]', container);
      const addFormFieldButton = domQuery('.bio-properties-panel-add-entry', formDataGroup);
      clickInput(addFormFieldButton);

      // then
      const formFieldEntries = getFormFieldEntries(container);
      const bottomFormFieldHeader = domQuery('.bio-properties-panel-collapsible-entry-header-title',
        formFieldEntries[0]);

      expect(bottomFormFieldHeader.innerHTML).to.equal('&lt;empty&gt;');
    }));


    it('should autoOpen newly added formField', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const formDataGroup = domQuery('div[data-group-id=group-CamundaPlatform__FormData]', container);
      const addFormFieldButton = domQuery('.bio-properties-panel-add-entry', formDataGroup);
      clickInput(addFormFieldButton);

      // then
      const formFieldEntries = getFormFieldEntries(container);
      const collapsbileEntry = domQuery('.bio-properties-panel-collapsible-entry', formFieldEntries[0]);
      expect(collapsbileEntry.classList.contains('open')).to.be.true;
    }));

  });


  describe('remove', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('UserTask_3');

      await act(() => {
        selection.select(event);
      });

      // when
      const formDataGroup = domQuery('div[data-group-id=group-CamundaPlatform__FormData]', container);
      const formFieldRemoveButton = domQueryAll('.bio-properties-panel-remove-entry', formDataGroup)[0];

      // then
      expect(formFieldRemoveButton).to.exist;
    }));


    it('should not display', inject(async function(elementRegistry, selection) {

      // given
      const event = elementRegistry.get('StartEvent_2');

      await act(() => {
        selection.select(event);
      });

      // when
      const formDataGroup = domQuery('div[data-group-id=group-CamundaPlatform__FormData]', container);
      const formFieldRemoveButton = domQueryAll('.bio-properties-panel-remove-entry', formDataGroup)[0];

      // then
      expect(formFieldRemoveButton).to.not.exist;
    }));


    it('should remove formField - keeping formData', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_3');

      await act(() => {
        selection.select(task);
      });

      // assume
      expect(getFormFieldsList(task)).to.have.length(2);

      // when
      const formDataGroup = domQuery('div[data-group-id=group-CamundaPlatform__FormData]', container);
      const formFieldRemoveButton = domQueryAll('.bio-properties-panel-remove-entry', formDataGroup)[0];
      clickInput(formFieldRemoveButton);

      // then
      expect(getFormFieldsList(task)).to.have.length(1);
    }));


    describe('integration', function() {

      it('should remove business key', inject(async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('StartEvent_3');

        await act(() => {
          selection.select(startEvent);
        });

        // assume
        expect(getFormData(startEvent).get('camunda:businessKey')).to.equal('foo');

        // when
        const formDataGroup = domQuery('div[data-group-id=group-CamundaPlatform__FormData]', container);

        const formFieldRemoveButton = domQueryAll('.bio-properties-panel-remove-entry', formDataGroup)[ 0 ];

        clickInput(formFieldRemoveButton);

        // then
        expect(getFormData(startEvent).get('camunda:businessKey')).not.to.exist;
      }));

    });

  });


  describe('list entries', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_3');

      await act(() => {
        selection.select(task);
      });

      // then
      expect(getFormFieldEntries(container)).to.have.length(2);
    }));


    it('should update on external change', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('UserTask_3');

      await act(() => {
        selection.select(task);
      });

      // when
      const formDataGroup = domQuery('div[data-group-id=group-CamundaPlatform__FormData]', container);
      const formFieldRemoveButton = domQueryAll('.bio-properties-panel-remove-entry', formDataGroup)[0];
      clickInput(formFieldRemoveButton);

      // then
      expect(getFormFieldEntries(container)).to.have.length(1);
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

function getFormFieldEntries(container) {
  const formDataGroup = domQuery('div[data-group-id=group-CamundaPlatform__FormData]', container);

  return domQueryAll('.bio-properties-panel-list-item', formDataGroup);
}
