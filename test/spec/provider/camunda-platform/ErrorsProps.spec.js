import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  clickInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

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

import diagramXML from './ErrorsProps.bpmn';


describe('provider/camunda-platform - ErrorProps', function() {

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


  describe('bpmn:Task', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task');

      await act(() => {
        selection.select(task);
      });

      // when
      const fieldInjectionGroup = getGroup(container, 'CamundaPlatform__Errors');

      // then
      expect(fieldInjectionGroup).not.to.exist;
    }));

  });


  describe('bpmn:ServiceTask - Java Class', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_JavaClass');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const fieldInjectionGroup = getGroup(container, 'CamundaPlatform__Errors');

      // then
      expect(fieldInjectionGroup).not.to.exist;
    }));

  });


  describe('bpmn:ServiceTask - External', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_External');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const errorsGroup = getGroup(container, 'CamundaPlatform__Errors'),
            addErrorButton = getAddFieldButton(container);

      // then
      expect(errorsGroup).to.exist;
      expect(addErrorButton).to.exist;
    }));


    describe('label', function() {

      it('should show the name as label', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_Error');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const errorHeaderLabel = getErrorItemLabel(container, 0);

        // then
        expect(errorHeaderLabel.innerText).to.eql('myBusinessException');
      }));


      it('should show the name and error code as label', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_ErrorCode');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const errorHeaderLabel = getErrorItemLabel(container, 0);

        // then
        expect(errorHeaderLabel.innerText).to.eql('myOtherBusinessException (code = com.company.MyOtherBusinessException)');
      }));


      it('should show placeholder label if no name', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_ErrorEventDefinition');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const fieldInjectionHeaderLabel = getErrorItemLabel(container, 0);

        // then
        expect(fieldInjectionHeaderLabel.innerText).to.eql('<no reference>');
      }));


      it('should show placeholder label if only code is set',
        inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_ErrorEventDefinitionCodeNoName');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const fieldInjectionHeaderLabel = getErrorItemLabel(container, 0);

          // then
          expect(fieldInjectionHeaderLabel.innerText).to.eql('<unnamed> (code = 404)');
        })
      );

    });


    describe('add', function() {

      it('should execute', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_External'),
              businessObject = getServiceTaskLikeBusinessObject(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        const addErrorButton = getAddFieldButton(container);

        // assume
        let errors = getExtensionElementsList(businessObject, 'camunda:ErrorEventDefinition');
        expect(errors).to.have.length(0);

        // when
        await clickInput(addErrorButton);
        await clickInput(addErrorButton);

        // then
        errors = getExtensionElementsList(businessObject, 'camunda:ErrorEventDefinition');

        expect(errors).to.have.length(2);
      }));


      it('should react to external change', inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_External'),
              businessObject = getServiceTaskLikeBusinessObject(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        const addErrorButton = getAddFieldButton(container);

        await clickInput(addErrorButton);

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        const errors = getExtensionElementsList(businessObject, 'camunda:ErrorEventDefinition');

        expect(errors).to.have.length(0);
      }));


      it('should re-use existing extensionElements', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_Error'),
              businessObject = getServiceTaskLikeBusinessObject(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        const addErrorButton = getAddFieldButton(container);

        // assume
        let errors = getExtensionElementsList(businessObject, 'camunda:ErrorEventDefinition');

        expect(errors).to.exist;
        expect(errors).to.have.length(1);

        // when
        await clickInput(addErrorButton);

        // then
        errors = getExtensionElementsList(businessObject, 'camunda:ErrorEventDefinition');

        expect(errors).to.exist;
        expect(errors).to.have.length(2);
      }));


      it('should add new error to bottom', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_ErrorCode');

        await act(() => {
          selection.select(serviceTask);
        });

        const addErrorButton = getAddFieldButton(container);

        // when
        await clickInput(addErrorButton);

        // then
        const errorHeaderLabel = getErrorItemLabel(container, 0);

        expect(errorHeaderLabel.innerHTML).to.equal(
          'myOtherBusinessException (code = com.company.MyOtherBusinessException)'
        );
      }));


      it('should autoOpen newly added error', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_ErrorCode');

        await act(() => {
          selection.select(serviceTask);
        });

        const addErrorButton = getAddFieldButton(container);

        // when
        await clickInput(addErrorButton);

        // then
        const addedErrorDiv = domQuery('[data-entry-id="ServiceTask_ErrorCode-error-1"]', container);

        expect(addedErrorDiv.classList.contains('open')).to.be.true;
      }));

    });


    describe('remove', function() {

      it('should execute', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_ErrorEventDefinition'),
              businessObject = getServiceTaskLikeBusinessObject(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        const removeErrorButton = getRemoveFieldButton(container, 0);

        // assume
        let errors = getExtensionElementsList(businessObject, 'camunda:ErrorEventDefinition');
        expect(errors).to.have.length(1);

        // when
        await clickInput(removeErrorButton);

        // then
        errors = getExtensionElementsList(businessObject, 'camunda:ErrorEventDefinition');

        expect(errors).to.have.length(0);
      }));


      it('should react to external change', inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_ErrorEventDefinition'),
              businessObject = getServiceTaskLikeBusinessObject(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        const removeErrorButton = getRemoveFieldButton(container, 0);

        await clickInput(removeErrorButton);

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        const fieldInjections = getExtensionElementsList(businessObject, 'camunda:ErrorEventDefinition');

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
  return domQuery('[data-group-id="group-CamundaPlatform__Errors"] .bio-properties-panel-add-entry', container);
}

function getRemoveFieldButton(container, id) {
  return domQuery(`[data-entry-id*="-error-${id}"] .bio-properties-panel-remove-entry`, container);
}

function getErrorItemLabel(container, id) {
  return domQuery(`[data-entry-id*="-error-${id}"] .bio-properties-panel-collapsible-entry-header-title`, container);
}
