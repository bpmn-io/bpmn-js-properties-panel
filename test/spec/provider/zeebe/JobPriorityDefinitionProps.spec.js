import { expect } from 'chai';
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
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import { getJobPriorityDefinition } from 'src/provider/zeebe/properties/JobPriorityDefinitionProps';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import ZeebePropertiesProvider from 'src/provider/zeebe';

import BehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './JobPriorityDefinitionProps.bpmn';
import { setEditorValue } from '../../../TestHelper';
import { getExtensionElementsList } from '../../../../src/utils/ExtensionElementsUtil';


describe('provider/zeebe - JobPriorityDefinitionProps', function() {

  const testModules = [
    CoreModule,
    SelectionModule,
    ModelingModule,
    BpmnPropertiesPanel,
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


  describe('display', function() {

    it('should display for process', inject(async function(elementRegistry, selection) {

      // given
      const process = elementRegistry.get('Process_1');

      await act(() => {
        selection.select(process);
      });

      // when
      const entry = domQuery('[data-entry-id="jobPriorityDefinitionPriority"]', container);

      // then
      expect(entry).to.exist;

      // static number renders as number input
      const input = domQuery('input[name=jobPriorityDefinitionPriority]', entry);
      expect(input).to.exist;
      expect(input.value).to.equal('50');
    }));


    it('should display for service task', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const entry = domQuery('[data-entry-id="jobPriorityDefinitionPriority"]', container);

      // then
      expect(entry).to.exist;

      const jobPriorityDefinition = getJobPriorityDefinition(serviceTask);
      const feelExpression = jobPriorityDefinition.get('priority').substring(1);

      const input = domQuery('[role="textbox"]', entry);
      expect(input.textContent).to.equal(feelExpression);
    }));


    it('should NOT display for business rule task without zeebe:TaskDefinition',
      inject(async function(elementRegistry, selection) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_NoJobWorker');

        await act(() => {
          selection.select(businessRuleTask);
        });

        // when
        const entry = domQuery('[data-entry-id="jobPriorityDefinitionPriority"]', container);

        // then
        expect(entry).to.not.exist;
      })
    );


    it('should display for business rule task with zeebe:TaskDefinition',
      inject(async function(elementRegistry, selection) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_JobWorker');

        await act(() => {
          selection.select(businessRuleTask);
        });

        // when
        const entry = domQuery('[data-entry-id="jobPriorityDefinitionPriority"]', container);

        // then
        expect(entry).to.exist;
      })
    );


    it('should NOT display for user task', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const entry = domQuery('[data-entry-id="jobPriorityDefinitionPriority"]', container);

      // then
      expect(entry).to.not.exist;
    }));


    it('should NOT display for message end event', inject(async function(elementRegistry, selection) {

      // given
      const messageEndEvent = elementRegistry.get('MessageEndEvent_1');

      await act(() => {
        selection.select(messageEndEvent);
      });

      // when
      const entry = domQuery('[data-entry-id="jobPriorityDefinitionPriority"]', container);

      // then
      expect(entry).to.not.exist;
    }));


    it('should NOT display for message throw event', inject(async function(elementRegistry, selection) {

      // given
      const messageThrowEvent = elementRegistry.get('MessageThrowEvent_1');

      await act(() => {
        selection.select(messageThrowEvent);
      });

      // when
      const entry = domQuery('[data-entry-id="jobPriorityDefinitionPriority"]', container);

      // then
      expect(entry).to.not.exist;
    }));

  });


  describe('update', function() {

    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const priorityInput = domQuery('[data-entry-id="jobPriorityDefinitionPriority"] [role="textbox"]', container);

      await setEditorValue(priorityInput, '90');

      // then
      expect(getJobPriorityDefinition(serviceTask).get('priority')).to.eql('=90');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getJobPriorityDefinition(serviceTask).get('priority');

        await act(() => {
          selection.select(serviceTask);
        });
        const priorityInput = domQuery('[data-entry-id="jobPriorityDefinitionPriority"] [role="textbox"]', container);
        await setEditorValue(priorityInput, '90');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect('=' + priorityInput.textContent).to.eql(originalValue);
      })
    );

  });


  describe('create', function() {

    it('should create job priority definition (service task)',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_2');

        // assume
        expect(getJobPriorityDefinition(serviceTask)).not.to.exist;

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const priorityInput = domQuery('input[name=jobPriorityDefinitionPriority]', container);
        changeInput(priorityInput, '90');

        // then
        expect(getJobPriorityDefinition(serviceTask)).to.exist;
        expect(getJobPriorityDefinition(serviceTask).get('priority')).to.eql('90');
      })
    );


    it('should create extension elements and job priority definition (service task)',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_3');

        // assume
        expect(getBusinessObject(serviceTask).get('extensionElements')).not.to.exist;

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const priorityInput = domQuery('input[name=jobPriorityDefinitionPriority]', container);
        changeInput(priorityInput, '90');

        // then
        expect(getBusinessObject(serviceTask).get('extensionElements')).to.exist;
        expect(getJobPriorityDefinition(serviceTask).get('priority')).to.eql('90');
      })
    );


    it('should create job priority definition (process)',
      inject(async function(elementRegistry, selection) {

        // given
        const process = elementRegistry.get('Process_1');

        // remove existing definition first
        const businessObject = getBusinessObject(process);
        const extensionElements = businessObject.get('extensionElements');
        extensionElements.values = extensionElements.values.filter(
          v => v.$type !== 'zeebe:JobPriorityDefinition'
        );

        // assume
        expect(getJobPriorityDefinition(process)).not.to.exist;

        await act(() => {
          selection.select(process);
        });

        // when
        const priorityInput = domQuery('input[name=jobPriorityDefinitionPriority]', container);
        changeInput(priorityInput, '50');

        // then
        expect(getJobPriorityDefinition(process)).to.exist;
        expect(getJobPriorityDefinition(process).get('priority')).to.eql('50');
      })
    );

  });


  describe('remove', function() {

    it('should remove job priority definition when emptied',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        await act(() => {
          selection.select(serviceTask);
        });

        // assume
        expect(getJobPriorityDefinition(serviceTask)).to.exist;

        // when
        const priorityInput = domQuery('[data-entry-id="jobPriorityDefinitionPriority"] [role="textbox"]', container);
        await setEditorValue(priorityInput, '');

        // then
        expect(getJobPriorityDefinition(serviceTask)).not.to.exist;

        // keep other extension elements
        expect(getExtensionElementsList(getBusinessObject(serviceTask), 'zeebe:TaskDefinition')).to.have.length(1);
      })
    );

  });

});
