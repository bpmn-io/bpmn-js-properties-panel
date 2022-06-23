import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  clickInput,
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
  getServiceTaskLikeBusinessObject
} from 'src/provider/camunda-platform/utils/ImplementationTypeUtils';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda';

import diagramXML from './FieldInjectonProps.bpmn';


describe('provider/camunda-platform - FieldInjectionProps', function() {

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

  describe('within ExecutionListener', function() {

    it('should update field value', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_ExecutionListener');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const executionListenerGroup = domQuery('[data-group-id="group-CamundaPlatform__ExecutionListener"]', container);
      const valueInputField = domQuery('input[name*="value"]', executionListenerGroup);

      changeInput(valueInputField, 'newValue');

      // then
      const extensionElements = serviceTask.businessObject.extensionElements.values;
      expect(extensionElements).to.have.lengthOf(1);

      const executionListener = extensionElements[0];
      expect(executionListener.fields).to.have.lengthOf(1);
      expect(executionListener.fields[0].string).to.equal('newValue');

    }));


    it('should update field name', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_ExecutionListener');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const executionListenerGroup = domQuery('[data-group-id="group-CamundaPlatform__ExecutionListener"]', container);
      const valueInputField = domQuery('input[name*="name"]', executionListenerGroup);

      changeInput(valueInputField, 'newName');

      // then
      const extensionElements = serviceTask.businessObject.extensionElements.values;
      expect(extensionElements).to.have.lengthOf(1);

      const executionListener = extensionElements[0];
      expect(executionListener.fields).to.have.lengthOf(1);
      expect(executionListener.fields[0].name).to.equal('newName');

    }));

  });


  describe('bpmn:Task#camunda:Field', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const fieldInjectionGroup = getGroup(container, 'CamundaPlatform__FieldInjection');

      // then
      expect(fieldInjectionGroup).not.to.exist;
    }));

  });


  describe('bpmn:ServiceTask#camunda:Field', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const fieldInjectionGroup = getGroup(container, 'CamundaPlatform__FieldInjection'),
            addFieldInjectionButton = getAddFieldButton(container);

      // then
      expect(fieldInjectionGroup).to.exist;
      expect(addFieldInjectionButton).to.exist;
    }));


    describe('label', function() {

      it('should show the name as label', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_2');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const fieldInjectionHeaderLabel = getFieldInjectionItemLabel(container, 0);

        // then
        expect(fieldInjectionHeaderLabel.innerText).to.equal('some');
      }));


      it('should show dummy label if no name', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_3');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const fieldInjectionHeaderLabel = getFieldInjectionItemLabel(container, 0);

        // then
        expect(fieldInjectionHeaderLabel.innerText).to.equal('<empty>');
      }));

    });


    describe('add', function() {

      it('should execute', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1'),
              businessObject = getServiceTaskLikeBusinessObject(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        const addFieldInjectionButton = getAddFieldButton(container);

        // assume
        let fieldInjections = getExtensionElementsList(businessObject, 'camunda:Field');
        expect(fieldInjections).to.have.length(0);

        // when
        await clickInput(addFieldInjectionButton);
        await clickInput(addFieldInjectionButton);

        // then
        fieldInjections = getExtensionElementsList(businessObject, 'camunda:Field');
        expect(fieldInjections).to.have.length(2);

        // string is the default setting for camunda:Field
        expect(fieldInjections[0].string).to.equal('');
        expect(fieldInjections[0].expression).to.be.undefined;
        expect(fieldInjections[0].stringValue).to.be.undefined;
      }));


      it('should react to external change', inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1'),
              businessObject = getServiceTaskLikeBusinessObject(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        const addFieldInjectionButton = getAddFieldButton(container);

        await clickInput(addFieldInjectionButton);

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        const fieldInjections = getExtensionElementsList(businessObject, 'camunda:Field');
        expect(fieldInjections).to.have.length(0);
      }));


      it('should re-use existing extensionElements', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_3'),
              businessObject = getServiceTaskLikeBusinessObject(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        const addFieldInjectionButton = getAddFieldButton(container);

        // assume
        let camundaProperties = getExtensionElementsList(businessObject, 'camunda:Properties');
        expect(camundaProperties).to.exist;
        expect(camundaProperties[0].values).to.have.length(2);

        // when
        await clickInput(addFieldInjectionButton);

        // then
        camundaProperties = getExtensionElementsList(businessObject, 'camunda:Properties');
        expect(camundaProperties).to.exist;
        expect(camundaProperties[0].values).to.have.length(2);
      }));

    });


    describe('remove', function() {

      it('should execute', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_2'),
              businessObject = getServiceTaskLikeBusinessObject(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        const removeFieldInjectionButton = getRemoveFieldButton(container, 0);

        // assume
        let fieldInjections = getExtensionElementsList(businessObject, 'camunda:Field');
        expect(fieldInjections).to.have.length(1);

        // when
        await clickInput(removeFieldInjectionButton);

        // then
        fieldInjections = getExtensionElementsList(businessObject, 'camunda:Field');
        expect(fieldInjections).to.have.length(0);
      }));


      it('should react to external change', inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_2'),
              businessObject = getServiceTaskLikeBusinessObject(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        const removeFieldInjectionButton = getRemoveFieldButton(container, 0);

        await clickInput(removeFieldInjectionButton);

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        const fieldInjections = getExtensionElementsList(businessObject, 'camunda:Field');
        expect(fieldInjections).to.have.length(1);
      }));

    });

  });


  describe('bpmn:IntermediateMessageThrowEvent#camunda:Field', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const throwEvent = elementRegistry.get('MessageThrowEvent_1');

      await act(() => {
        selection.select(throwEvent);
      });

      // when
      const fieldInjectionGroup = getGroup(container, 'CamundaPlatform__FieldInjection'),
            addFieldInjectionButton = getAddFieldButton(container);

      // then
      expect(fieldInjectionGroup).to.exist;
      expect(addFieldInjectionButton).to.exist;
    }));


    describe('label', function() {

      it('should show the name as label', inject(async function(elementRegistry, selection) {

        // given
        const throwEvent = elementRegistry.get('MessageThrowEvent_2');

        await act(() => {
          selection.select(throwEvent);
        });

        // when
        const fieldInjectionHeaderLabel = getFieldInjectionItemLabel(container, 0);

        // then
        expect(fieldInjectionHeaderLabel.innerText).to.equal('some');
      }));


      it('should show dummy label if no name', inject(async function(elementRegistry, selection) {

        // given
        const throwEvent = elementRegistry.get('MessageThrowEvent_3');

        await act(() => {
          selection.select(throwEvent);
        });

        // when
        const fieldInjectionHeaderLabel = getFieldInjectionItemLabel(container, 0);

        // then
        expect(fieldInjectionHeaderLabel.innerText).to.equal('<empty>');
      }));

    });


    describe('add', function() {

      it('should execute', inject(async function(elementRegistry, selection) {

        // given
        const throwEvent = elementRegistry.get('MessageThrowEvent_1'),
              businessObject = getServiceTaskLikeBusinessObject(throwEvent);

        await act(() => {
          selection.select(throwEvent);
        });

        const addFieldInjectionButton = getAddFieldButton(container);

        // assume
        let fieldInjections = getExtensionElementsList(businessObject, 'camunda:Field');
        expect(fieldInjections).to.have.length(0);

        // when
        await clickInput(addFieldInjectionButton);
        await clickInput(addFieldInjectionButton);

        // then
        fieldInjections = getExtensionElementsList(businessObject, 'camunda:Field');
        expect(fieldInjections).to.have.length(2);

        // string is the default setting for camunda:Field
        expect(fieldInjections[0].string).to.equal('');
        expect(fieldInjections[0].expression).to.be.undefined;
        expect(fieldInjections[0].stringValue).to.be.undefined;
      }));


      it('should react to external change', inject(async function(elementRegistry, selection, commandStack) {

        // given
        const throwEvent = elementRegistry.get('MessageThrowEvent_1'),
              businessObject = getServiceTaskLikeBusinessObject(throwEvent);

        await act(() => {
          selection.select(throwEvent);
        });

        const addFieldInjectionButton = getAddFieldButton(container);

        await clickInput(addFieldInjectionButton);

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        const fieldInjections = getExtensionElementsList(businessObject, 'camunda:Field');
        expect(fieldInjections).to.have.length(0);
      }));


      it('should re-use existing extensionElements', inject(async function(elementRegistry, selection) {

        // given
        const throwEvent = elementRegistry.get('MessageThrowEvent_3'),
              businessObject = getBusinessObject(throwEvent);

        await act(() => {
          selection.select(throwEvent);
        });

        const addFieldInjectionButton = getAddFieldButton(container);

        // assume
        let camundaProperties = getExtensionElementsList(businessObject, 'camunda:Properties');
        expect(camundaProperties).to.exist;
        expect(camundaProperties[0].values).to.have.length(2);

        // when
        await clickInput(addFieldInjectionButton);

        // then
        camundaProperties = getExtensionElementsList(businessObject, 'camunda:Properties');
        expect(camundaProperties).to.exist;
        expect(camundaProperties[0].values).to.have.length(2);
      }));

    });


    describe('remove', function() {

      it('should execute', inject(async function(elementRegistry, selection) {

        // given
        const throwEvent = elementRegistry.get('MessageThrowEvent_2'),
              businessObject = getServiceTaskLikeBusinessObject(throwEvent);

        await act(() => {
          selection.select(throwEvent);
        });

        const removeFieldInjectionButton = getRemoveFieldButton(container, 0);

        // assume
        let fieldInjections = getExtensionElementsList(businessObject, 'camunda:Field');
        expect(fieldInjections).to.have.length(1);

        // when
        await clickInput(removeFieldInjectionButton);

        // then
        fieldInjections = getExtensionElementsList(businessObject, 'camunda:Field');
        expect(fieldInjections).to.have.length(0);
      }));


      it('should react to external change', inject(async function(elementRegistry, selection, commandStack) {

        // given
        const throwEvent = elementRegistry.get('MessageThrowEvent_2'),
              businessObject = getServiceTaskLikeBusinessObject(throwEvent);

        await act(() => {
          selection.select(throwEvent);
        });

        const removeFieldInjectionButton = getRemoveFieldButton(container, 0);

        await clickInput(removeFieldInjectionButton);

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        const fieldInjections = getExtensionElementsList(businessObject, 'camunda:Field');
        expect(fieldInjections).to.have.length(1);
      }));

    });

  });

});


// helper //////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getAddFieldButton(container) {
  return domQuery('[data-group-id="group-CamundaPlatform__FieldInjection"] .bio-properties-panel-add-entry', container);
}

function getRemoveFieldButton(container, id) {
  return domQuery(`[data-entry-id*="-fieldInjection-${id}"] .bio-properties-panel-remove-entry`, container);
}

function getFieldInjectionItemLabel(container, id) {
  return domQuery(`[data-entry-id*="-fieldInjection-${id}"] .bio-properties-panel-collapsible-entry-header-title`, container);
}
