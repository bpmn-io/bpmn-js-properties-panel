import TestContainer from 'mocha-test-container-support';

import {
  act, waitFor
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  inject
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';
import BpmnPropertiesProvider from 'src/provider/bpmn';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import processDiagramXML from './CamundaPlatformPropertiesProvider-Process.bpmn';
import collaborationDiagramXML from './CamundaPlatformPropertiesProvider-Collaboration.bpmn';


describe('<CamundaPlatformPropertiesProvider>', function() {

  const testModules = [
    BpmnPropertiesPanel,
    CoreModule,
    ModelingModule,
    SelectionModule,
    CamundaPlatformPropertiesProvider
  ];

  const moddleExtensions = {
    camunda: camundaModdleExtensions
  };


  describe('basics', function() {

    beforeEach(bootstrapPropertiesPanel(processDiagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should render', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      // then
      await act(() => {
        selection.select(task);
      });
    }));
  });


  describe('groups', function() {

    describe('process', function() {

      let container;

      beforeEach(function() {
        container = TestContainer.get(this);
      });

      beforeEach(bootstrapPropertiesPanel(processDiagramXML, {
        modules: testModules,
        moddleExtensions,
        debounceInput: false
      }));


      it('should show candidate starter group', inject(async function(elementRegistry, selection) {

        // given
        const process = elementRegistry.get('Process_1');

        await act(() => {
          selection.select(process);
        });

        // when
        const candidateStarterGroup = getGroup(container, 'CamundaPlatform__CandidateStarter');

        // then
        expect(candidateStarterGroup).to.exist;
      }));


      it('should NOT show candidate starter group', inject(async function(elementRegistry, selection) {

        // given
        const process = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(process);
        });

        // when
        const candidateStarterGroup = getGroup(container, 'CamundaPlatform__CandidateStarter');

        // then
        expect(candidateStarterGroup).not.to.exist;
      }));


      it('should show field injections group', inject(async function(elementRegistry, selection) {

        // given
        const elements = [
          elementRegistry.get('FieldInjectionServiceTask_1'),
          elementRegistry.get('FieldInjectionBusinessRuleTask_1'),
          elementRegistry.get('FieldInjectionSendMessageTask_1'),
          elementRegistry.get('FieldInjectionIntermediateMessageThrowEvent_1')
        ];

        for (const element of elements) {
          await act(() => {
            selection.select(element);
          });

          // when
          const fieldInjectionGroup = getGroup(container, 'CamundaPlatform__FieldInjection');

          // then
          expect(fieldInjectionGroup).to.exist;
        }
      }));


      it('should NOT show field injections group', inject(async function(elementRegistry, selection) {

        // given
        const elements = [
          elementRegistry.get('FieldInjectionCallActivity_1'),
          elementRegistry.get('FieldInjectionIntermediateMessageCatchEvent_1')
        ];

        for (const element of elements) {
          await act(() => {
            selection.select(element);
          });

          // when
          const fieldInjectionGroup = getGroup(container, 'CamundaPlatform__FieldInjection');

          // then
          expect(fieldInjectionGroup).not.to.exist;
        }
      }));


      it('should show history group', inject(async function(elementRegistry, selection) {

        // given
        const process = elementRegistry.get('Process_1');

        await act(() => {
          selection.select(process);
        });

        // when
        const historyGroup = getGroup(container, 'CamundaPlatform__HistoryCleanup');

        // then
        expect(historyGroup).to.exist;
      }));


      it('should NOT show history group', inject(async function(elementRegistry, selection) {

        // given
        const process = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(process);
        });

        // when
        const historyGroup = getGroup(container, 'CamundaPlatform__HistoryCleanup');

        // then
        expect(historyGroup).not.to.exist;
      }));


      it('should show tasklist group', inject(async function(elementRegistry, selection) {

        // given
        const process = elementRegistry.get('Process_1');

        await act(() => {
          selection.select(process);
        });

        // when
        const tasklistGroup = getGroup(container, 'CamundaPlatform__Tasklist');

        // then
        expect(tasklistGroup).to.exist;
      }));


      it('should NOT show tasklist group', inject(async function(elementRegistry, selection) {

        // given
        const process = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(process);
        });

        // when
        const tasklistGroup = getGroup(container, 'CamundaPlatform__Tasklist');

        // then
        expect(tasklistGroup).not.to.exist;
      }));


      it('should show job execution group', inject(async function(elementRegistry, selection) {

        // given
        const elements = [
          elementRegistry.get('Process_1'),
          elementRegistry.get('JobExecutionServiceTask_1'),
          elementRegistry.get('JobExecutionTimerStartEvent_1'),
          elementRegistry.get('JobExecutionTimerCatchEvent_1'),
          elementRegistry.get('JobExecutionScriptTask_1'),
          elementRegistry.get('JobExecutionTimerBoundaryEvent_1')
        ];

        for (const element of elements) {
          await act(() => {
            selection.select(element);
          });

          // when
          const jobExecutionGroup = getGroup(container, 'CamundaPlatform__JobExecution');

          // then
          expect(jobExecutionGroup).to.exist;
        }
      }));


      it('should NOT show job execution group', inject(async function(elementRegistry, selection) {

        // given
        const elements = [
          elementRegistry.get('JobExecutionServiceTask_2'),
          elementRegistry.get('JobExecutionUserTask_1'),
          elementRegistry.get('JobExecution_Event1')
        ];

        for (const element of elements) {
          await act(() => {
            selection.select(element);
          });

          // when
          const jobExecution = getGroup(container, 'CamundaPlatform__JobExecution');

          // then
          expect(jobExecution).not.to.exist;
        }
      }));


      it('should show process variables group', inject(async function(elementRegistry, selection) {

        // given
        const process = elementRegistry.get('Process_1');

        // when
        await act(() => {
          selection.select(process);
        });

        // then

        // as of @bpmn-io/extract-process-variables@0.7.0, process variable extraction is async
        await waitFor(() => {
          const processVariablesGroup = getGroup(container, 'CamundaPlatform__ProcessVariables');

          expect(processVariablesGroup).to.exist;
        });

      }));


      it('should NOT show process variables group', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const processVariablesGroup = getGroup(container, 'CamundaPlatform__ProcessVariables');

        // then
        expect(processVariablesGroup).to.not.exist;
      }));


      it('should show external task group', inject(async function(elementRegistry, selection) {

        // given
        const elements = [
          elementRegistry.get('ExternalTaskServiceTask_2'),
          elementRegistry.get('Process_1'),
          elementRegistry.get('ExternalTaskBusinessRuleTask_1'),
          elementRegistry.get('ExternalTaskMessageEndEvent_1'),
          elementRegistry.get('ExternalTaskMessageIntermediateThrowEvent_1'),
          elementRegistry.get('ExternalTaskSendTask_1')
        ];

        for (const element of elements) {
          await act(() => {
            selection.select(element);
          });

          // when
          const externalTaskGroup = getGroup(container, 'CamundaPlatform__ExternalTask');

          // then
          expect(externalTaskGroup).to.exist;
        }
      }));


      it('should NOT show external task group', inject(async function(elementRegistry, selection) {

        // given
        const elements = [
          elementRegistry.get('ExternalTaskServiceTask_1'),
          elementRegistry.get('ExternalTaskSendTask_2')
        ];

        for (const element of elements) {
          await act(() => {
            selection.select(element);
          });

          // when
          const externalTaskGroup = getGroup(container, 'CamundaPlatform__ExternalTask');

          // then
          expect(externalTaskGroup).to.not.exist;
        }
      }));


      it('should show asynchronous continuations group', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const asynchronousContinuationsGroup = getGroup(container, 'CamundaPlatform__AsynchronousContinuations');

        // then
        expect(asynchronousContinuationsGroup).to.exist;
      }));


      it('should NOT show asynchronous continuations group', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Group_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const asynchronousContinuationsGroup = getGroup(container, 'CamundaPlatform__AsynchronousContinuations');

        // then
        expect(asynchronousContinuationsGroup).to.not.exist;
      }));


      it('should show user assignment group', inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_1');

        await act(() => {
          selection.select(userTask);
        });

        // when
        const userAssignmentGroup = getGroup(container, 'CamundaPlatform__UserAssignment');

        // then
        expect(userAssignmentGroup).to.exist;
      }));


      it('should NOT show user assignment group', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const userAssignmentGroup = getGroup(container, 'CamundaPlatform__UserAssignment');

        // then
        expect(userAssignmentGroup).not.to.exist;
      }));


      it('should show start initiator group', inject(async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1');

        await act(() => {
          selection.select(startEvent);
        });

        // when
        const startInitiatorGroup = getGroup(container, 'CamundaPlatform__StartInitiator');

        // then
        expect(startInitiatorGroup).to.exist;
      }));


      it('should NOT show start initiator group', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const startInitiatorGroup = getGroup(container, 'CamundaPlatform__StartInitiator');

        // then
        expect(startInitiatorGroup).to.not.exist;
      }));


      it('should show script group', inject(async function(elementRegistry, selection) {

        // given
        const scriptTask = elementRegistry.get('ScriptTask_1');

        await act(() => {
          selection.select(scriptTask);
        });

        // when
        const scriptGroup = getGroup(container, 'CamundaPlatform__Script');

        // then
        expect(scriptGroup).to.exist;
      }));


      it('should NOT show script group', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const scriptGroup = getGroup(container, 'CamundaPlatform__Script');

        // then
        expect(scriptGroup).to.not.exist;
      }));


      it('should show implementation group', inject(async function(elementRegistry, selection) {

        // given
        const elements = [
          elementRegistry.get('ExternalTaskServiceTask_1'),
          elementRegistry.get('MessageEndEvent_1'),
          elementRegistry.get('MessageIntermediateThrowEvent_1')
        ];

        for (const element of elements) {
          await act(() => {
            selection.select(element);
          });

          // when
          const implementationGroup = getGroup(container, 'CamundaPlatform__Implementation');

          // then
          expect(implementationGroup).to.exist;
        }
      }));


      it('should NOT show implementation group', inject(async function(elementRegistry, selection) {

        // given
        const elements = [
          elementRegistry.get('Group_1'),
          elementRegistry.get('MessageBoundaryEvent_1'),
          elementRegistry.get('MessageIntermediateCatchEvent_1'),
          elementRegistry.get('SignalIntermediateThrowEvent_1')
        ];

        for (const element of elements) {
          await act(() => {
            selection.select(element);
          });

          // when
          const implementationGroup = getGroup(container, 'CamundaPlatform__Implementation');

          // then
          expect(implementationGroup).to.not.exist;
        }
      }));


      it('should show form group', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('UserTask_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const formGroup = getGroup(container, 'CamundaPlatform__Form');

        // then
        expect(formGroup).to.exist;
      }));


      it('should NOT show form group', inject(async function(elementRegistry, selection) {

        // given
        const group = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(group);
        });

        // when
        const formGroup = getGroup(container, 'CamundaPlatform__Form');

        // then
        expect(formGroup).to.not.exist;
      }));


      it('should show errors group', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('ExternalServiceTask');

        await act(() => {
          selection.select(task);
        });

        // when
        const formKeyGroup = getGroup(container, 'CamundaPlatform__Errors');

        // then
        expect(formKeyGroup).to.exist;
      }));


      it('should NOT show errors group', inject(async function(elementRegistry, selection) {

        // given
        const group = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(group);
        });

        // when
        const formKeyGroup = getGroup(container, 'CamundaPlatform__Errors');

        // then
        expect(formKeyGroup).to.not.exist;
      }));


      it('should show in mapping group', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const inMappingGroup = getGroup(container, 'CamundaPlatform__InMapping');

        // then
        expect(inMappingGroup).to.exist;
      }));


      it('should NOT show in mapping group', inject(async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1');

        await act(() => {
          selection.select(startEvent);
        });

        // when
        const inMappingGroup = getGroup(container, 'CamundaPlatform__InMapping');

        // then
        expect(inMappingGroup).to.not.exist;
      }));


      it('should show out mapping group', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const outMappingGroup = getGroup(container, 'CamundaPlatform__OutMapping');

        // then
        expect(outMappingGroup).to.exist;
      }));


      it('should NOT show out mapping group', inject(async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1');

        await act(() => {
          selection.select(startEvent);
        });

        // when
        const outMappingGroup = getGroup(container, 'CamundaPlatform__OutMapping');

        // then
        expect(outMappingGroup).to.not.exist;
      }));


      it('should show in mapping propagation group', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const inMappingPropagationGroup = getGroup(container, 'CamundaPlatform__InMappingPropagation');

        // then
        expect(inMappingPropagationGroup).to.exist;
      }));


      it('should NOT show in mapping propagation group', inject(async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1');

        await act(() => {
          selection.select(startEvent);
        });

        // when
        const inMappingPropagationGroup = getGroup(container, 'CamundaPlatform__InMappingPropagation');

        // then
        expect(inMappingPropagationGroup).to.not.exist;
      }));


      it('should show out mapping propagation group', inject(async function(elementRegistry, selection) {

        // given
        const callActivity = elementRegistry.get('CallActivity_1');

        await act(() => {
          selection.select(callActivity);
        });

        // when
        const outMappingPropagationGroup = getGroup(container, 'CamundaPlatform__OutMappingPropagation');

        // then
        expect(outMappingPropagationGroup).to.exist;
      }));


      it('should NOT show out mapping propagation group', inject(async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1');

        await act(() => {
          selection.select(startEvent);
        });

        // when
        const outMappingPropagationGroup = getGroup(container, 'CamundaPlatform__OutMappingPropagation');

        // then
        expect(outMappingPropagationGroup).to.not.exist;
      }));


      it('should show input group', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const inputGroup = getGroup(container, 'CamundaPlatform__Input');

        // then
        expect(inputGroup).to.exist;
      }));


      it('should NOT show input group', inject(async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1');

        await act(() => {
          selection.select(startEvent);
        });

        // when
        const inputGroup = getGroup(container, 'CamundaPlatform__Input');

        // then
        expect(inputGroup).to.not.exist;
      }));


      it('should show output group', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const outputGroup = getGroup(container, 'CamundaPlatform__Output');

        // then
        expect(outputGroup).to.exist;
      }));


      it('should NOT show output group', inject(async function(elementRegistry, selection) {

        // given
        const endEvent = elementRegistry.get('EndEvent_1');

        await act(() => {
          selection.select(endEvent);
        });

        // when
        const outputGroup = getGroup(container, 'CamundaPlatform__Output');

        // then
        expect(outputGroup).to.not.exist;
      }));


      it('should show formData group', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('UserTask_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const formKeyGroup = getGroup(container, 'CamundaPlatform__FormData');

        // then
        expect(formKeyGroup).to.exist;
      }));


      it('should NOT show formData group', inject(async function(elementRegistry, selection) {

        // given
        const group = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(group);
        });

        // when
        const formKeyGroup = getGroup(container, 'CamundaPlatform__FormData');

        // then
        expect(formKeyGroup).to.not.exist;

      }));


      it('should show execution listener group', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const executionListenerGroup = getGroup(container, 'CamundaPlatform__ExecutionListener');

        // then
        expect(executionListenerGroup).to.exist;
      }));


      it('should NOT show execution listener group', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Group_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const executionListenerGroup = getGroup(container, 'CamundaPlatform__ExecutionListener');

        // then
        expect(executionListenerGroup).not.to.exist;
      }));


      it('should show connector input group', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_connector');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const connectorInputGroup = getGroup(container, 'CamundaPlatform__ConnectorInput');

        // then
        expect(connectorInputGroup).to.exist;
      }));


      it('should NOT show connector input group', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_external');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const connectorInputGroup = getGroup(container, 'CamundaPlatform__ConnectorInput');

        // then
        expect(connectorInputGroup).to.not.exist;
      }));


      it('should show connector output group', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_connector');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const connectorOutputGroup = getGroup(container, 'CamundaPlatform__ConnectorOutput');

        // then
        expect(connectorOutputGroup).to.exist;
      }));


      it('should NOT show output group', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_external');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const connectorOutputGroup = getGroup(container, 'CamundaPlatform__ConnectorOutput');

        // then
        expect(connectorOutputGroup).to.not.exist;
      }));


      it('should show condition group', inject(async function(elementRegistry, selection) {

        // given
        const elements = [
          elementRegistry.get('Flow_2'),
          elementRegistry.get('Flow_3'),
          elementRegistry.get('Flow_5'),
          elementRegistry.get('Flow_6')
        ];

        for (const element of elements) {
          await act(() => {
            selection.select(element);
          });

          // when
          const conditionGroup = getGroup(container, 'CamundaPlatform__Condition');

          // then
          expect(conditionGroup).to.exist;
        }
      }));


      it('should NOT show condition group', inject(async function(elementRegistry, selection) {

        // given
        const elements = [
          elementRegistry.get('Flow_1'),
          elementRegistry.get('Flow_4'),
          elementRegistry.get('Flow_7')
        ];

        for (const element of elements) {
          await act(() => {
            selection.select(element);
          });

          // when
          const conditionGroup = getGroup(container, 'CamundaPlatform__Condition');

          // then
          expect(conditionGroup).to.not.exist;
        }
      }));

    });


    describe('collaboration', function() {

      let container;

      beforeEach(function() {
        container = TestContainer.get(this);
      });

      beforeEach(bootstrapPropertiesPanel(collaborationDiagramXML, {
        modules: testModules,
        moddleExtensions,
        debounceInput: false
      }));


      it('should show candidate starter group', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const candidateStarterGroup = getGroup(container, 'CamundaPlatform__CandidateStarter');

        // then
        expect(candidateStarterGroup).to.exist;
      }));


      it('should NOT show candidate starter group', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_2');

        await act(() => {
          selection.select(participant);
        });

        // when
        const candidateStarterGroup = getGroup(container, 'CamundaPlatform__CandidateStarter');

        // then
        expect(candidateStarterGroup).not.to.exist;
      }));


      it('should show history group', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const historyGroup = getGroup(container, 'CamundaPlatform__HistoryCleanup');

        // then
        expect(historyGroup).to.exist;
      }));


      it('should NOT show history group', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_2');

        await act(() => {
          selection.select(participant);
        });

        // when
        const historyGroup = getGroup(container, 'CamundaPlatform__HistoryCleanup');

        // then
        expect(historyGroup).not.to.exist;
      }));


      it('should show tasklist group', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const tasklistGroup = getGroup(container, 'CamundaPlatform__Tasklist');

        // then
        expect(tasklistGroup).to.exist;
      }));


      it('should NOT show tasklist group', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_2');

        await act(() => {
          selection.select(participant);
        });

        // when
        const tasklistGroup = getGroup(container, 'CamundaPlatform__Tasklist');

        // then
        expect(tasklistGroup).not.to.exist;
      }));


      it('should show job execution group', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const jobExecutionGroup = getGroup(container, 'CamundaPlatform__JobExecution');

        // then
        expect(jobExecutionGroup).to.exist;
      }));


      it('should NOT show job execution group', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_2');

        await act(() => {
          selection.select(participant);
        });

        // when
        const jobExecutionGroup = getGroup(container, 'CamundaPlatform__JobExecution');

        // then
        expect(jobExecutionGroup).not.to.exist;
      }));


      it('should show process variables group', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        // when
        await act(() => {
          selection.select(participant);
        });

        // then

        // as of @bpmn-io/extract-process-variables@0.7.0, process variable extraction is async
        await waitFor(() => {
          const processVariablesGroup = getGroup(container, 'CamundaPlatform__ProcessVariables');

          expect(processVariablesGroup).to.exist;
        });

      }));


      it('should NOT show process variables group', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_2');

        await act(() => {
          selection.select(participant);
        });

        // when
        const processVariablesGroup = getGroup(container, 'CamundaPlatform__ProcessVariables');

        // then
        expect(processVariablesGroup).to.not.exist;
      }));


      it('should NOT show process variables group - no items', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_3');

        await act(() => {
          selection.select(participant);
        });

        // when
        const processVariablesGroup = getGroup(container, 'CamundaPlatform__ProcessVariables');

        // then
        expect(processVariablesGroup).to.not.exist;
      }));


      it('should show extension properties group', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const extensionPropertiesGroup = getGroup(container, 'CamundaPlatform__ExtensionProperties');

        // then
        expect(extensionPropertiesGroup).to.exist;
      }));


      it('should NOT show extension properties group', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_2');

        await act(() => {
          selection.select(participant);
        });

        // when
        const extensionPropertiesGroup = getGroup(container, 'CamundaPlatform__ExtensionProperties');

        // then
        expect(extensionPropertiesGroup).not.to.exist;
      }));


      it('should show external task group', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const externalTaskGroup = getGroup(container, 'CamundaPlatform__ExternalTask');

        // then
        expect(externalTaskGroup).to.exist;
      }));


      it('should NOT show external task group', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_2');

        await act(() => {
          selection.select(participant);
        });

        // when
        const externalTaskGroup = getGroup(container, 'CamundaPlatform__ExternalTask');

        // then
        expect(externalTaskGroup).not.to.exist;
      }));


      it('should show execution listener group', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const executionListenerGroup = getGroup(container, 'CamundaPlatform__ExecutionListener');

        // then
        expect(executionListenerGroup).to.exist;
      }));


      it('should NOT show execution listener group', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_2');

        await act(() => {
          selection.select(participant);
        });

        // when
        const executionListenerGroup = getGroup(container, 'CamundaPlatform__ExecutionListener');

        // then
        expect(executionListenerGroup).not.to.exist;
      }));

    });

  });


  describe('integration', function() {

    it('should work with BpmnPropertiesProvider', function() {

      // given
      const test = bootstrapPropertiesPanel(processDiagramXML, {
        modules: testModules.concat(BpmnPropertiesProvider),
        moddleExtensions,
        debounceInput: false
      });

      // then
      return test.call(this);
    });


    describe('update existing groups', function() {

      let container;

      beforeEach(function() {
        container = TestContainer.get(this);
      });

      beforeEach(bootstrapPropertiesPanel(processDiagramXML, {
        modules: testModules.concat(BpmnPropertiesProvider),
        moddleExtensions,
        debounceInput: false
      }));


      it('should extend multiInstance group', inject(async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('MultiInstanceTask_1');

        await act(() => {
          selection.select(element);
        });

        // when
        const multiInstanceGroups = getAllGroups(container, 'multiInstance');
        const completionConditionInput = domQuery('input[name=completionCondition]', multiInstanceGroups[0]);
        const elementVariableInput = domQuery('input[name="elementVariable"]', multiInstanceGroups[0]);

        // then
        expect(multiInstanceGroups).to.have.length(1);
        expect(completionConditionInput).to.exist;
        expect(elementVariableInput).to.exist;
      }));


      it('should show implementation group at correct position',
        inject(async function(elementRegistry, selection) {

          // given
          const element = elementRegistry.get('MessageIntermediateThrowEvent_1');

          await act(() => {
            selection.select(element);
          });

          // when
          const implementationGroup = getGroup(container, 'CamundaPlatform__Implementation');

          /**
           * - General
           * - Documentation
           * - Implementation
           */
          const expectedGroup = getGroupAt(container, 2);

          // then
          expect(expectedGroup).to.eql(implementationGroup);
        })
      );

    });


    describe('layout config', function() {

      let container;

      function expectOpen(id, open) {
        const group = getGroup(container, id);
        const header = domQuery('.bio-properties-panel-group-header', group);

        expect(header.classList.contains('open')).to.equal(open);
      }

      beforeEach(function() {
        container = TestContainer.get(this);
      });

      beforeEach(bootstrapPropertiesPanel(processDiagramXML, {
        modules: testModules.concat(BpmnPropertiesProvider),
        moddleExtensions,
        debounceInput: false,
        propertiesPanel: {
          layout: {
            groups: {
              'general': { open: true },
              'documentation': { open: false },
              'CamundaPlatform__UserAssignment': { open: true }
            }
          }
        }
      }));


      it('should pre-open configured groups', inject(
        async function(elementRegistry, selection) {

          // given
          const task = elementRegistry.get('UserTask_1');

          // when
          await act(() => {
            selection.select(task);
          });

          // then
          expectOpen('general', true);
          expectOpen('documentation', false);
          expectOpen('CamundaPlatform__UserAssignment', true);
          expectOpen('CamundaPlatform__Form', false);
        })
      );
    });

  });
});


// helpers /////////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getGroupAt(container, position) {
  const groups = domQueryAll('.bio-properties-panel-group', container);
  return groups.item(position);
}

function getAllGroups(container, id) {
  return domQueryAll(`[data-group-id="group-${id}"`, container);
}
