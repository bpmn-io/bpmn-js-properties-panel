import { expect } from 'chai';

import { getZeebeEntryId } from '../../../../src/provider/zeebe/utils/EntryIdUtil';

import { BpmnModdle } from 'bpmn-moddle';

import ZeebeBpmnModdle from 'zeebe-bpmn-moddle/resources/zeebe.json';


describe('provider/zeebe - EntryIdUtil', function() {

  const moddle = new BpmnModdle({
    zeebe: ZeebeBpmnModdle
  });

  function createElement(type, properties) {
    return moddle.create(type, properties);
  }

  function withExtensionElements(values) {
    return createElement('bpmn:ExtensionElements', { values });
  }


  describe('#getZeebeEntryId', function() {

    describe('zeebe:Input', function() {

      it('should resolve source', function() {

        // given
        const input = createElement('zeebe:Input', { source: '=foo', target: 'bar' });

        const ioMapping = createElement('zeebe:IoMapping', {
          inputParameters: [ input ]
        });

        const serviceTask = createElement('bpmn:ServiceTask', {
          id: 'ServiceTask_1',
          extensionElements: withExtensionElements([ ioMapping ])
        });

        // when
        const entryId = getZeebeEntryId(serviceTask, [
          'extensionElements', 'values', 0, 'inputParameters', 0, 'source'
        ]);

        // then
        expect(entryId).to.eql('ServiceTask_1-input-0-source');
      });


      it('should resolve target using the collection index', function() {

        // given
        const inputs = [
          createElement('zeebe:Input', { source: '=1', target: 'a' }),
          createElement('zeebe:Input', { source: '=2', target: 'b' })
        ];

        const ioMapping = createElement('zeebe:IoMapping', {
          inputParameters: inputs
        });

        const serviceTask = createElement('bpmn:ServiceTask', {
          id: 'ServiceTask_1',
          extensionElements: withExtensionElements([ ioMapping ])
        });

        // when
        const entryId = getZeebeEntryId(serviceTask, [
          'extensionElements', 'values', 0, 'inputParameters', 1, 'target'
        ]);

        // then
        expect(entryId).to.eql('ServiceTask_1-input-1-target');
      });

    });


    describe('zeebe:Output', function() {

      it('should resolve source', function() {

        // given
        const output = createElement('zeebe:Output', { source: '=foo', target: 'bar' });

        const ioMapping = createElement('zeebe:IoMapping', {
          outputParameters: [ output ]
        });

        const serviceTask = createElement('bpmn:ServiceTask', {
          id: 'ServiceTask_1',
          extensionElements: withExtensionElements([ ioMapping ])
        });

        // when
        const entryId = getZeebeEntryId(serviceTask, [
          'extensionElements', 'values', 0, 'outputParameters', 0, 'source'
        ]);

        // then
        expect(entryId).to.eql('ServiceTask_1-output-0-source');
      });

    });


    describe('zeebe:Header', function() {

      it('should resolve key and value', function() {

        // given
        const header = createElement('zeebe:Header', { key: 'foo', value: 'bar' });

        const taskHeaders = createElement('zeebe:TaskHeaders', {
          values: [ header ]
        });

        const task = createElement('bpmn:ServiceTask', {
          id: 'ServiceTask_1',
          extensionElements: withExtensionElements([ taskHeaders ])
        });

        // when
        const keyEntryId = getZeebeEntryId(task, [
          'extensionElements', 'values', 0, 'values', 0, 'key'
        ]);

        const valueEntryId = getZeebeEntryId(task, [
          'extensionElements', 'values', 0, 'values', 0, 'value'
        ]);

        // then
        expect(keyEntryId).to.eql('ServiceTask_1-header-0-key');
        expect(valueEntryId).to.eql('ServiceTask_1-header-0-value');
      });

    });


    describe('zeebe:Property', function() {

      it('should resolve name and value', function() {

        // given
        const property = createElement('zeebe:Property', { name: 'foo', value: 'bar' });

        const properties = createElement('zeebe:Properties', {
          properties: [ property ]
        });

        const task = createElement('bpmn:ServiceTask', {
          id: 'ServiceTask_1',
          extensionElements: withExtensionElements([ properties ])
        });

        // when
        const nameEntryId = getZeebeEntryId(task, [
          'extensionElements', 'values', 0, 'properties', 0, 'name'
        ]);

        const valueEntryId = getZeebeEntryId(task, [
          'extensionElements', 'values', 0, 'properties', 0, 'value'
        ]);

        // then
        expect(nameEntryId).to.eql('ServiceTask_1-extensionProperty-0-name');
        expect(valueEntryId).to.eql('ServiceTask_1-extensionProperty-0-value');
      });

    });


    describe('zeebe:TaskDefinition', function() {

      it('should resolve type and retries', function() {

        // given
        const taskDefinition = createElement('zeebe:TaskDefinition', { type: 'foo', retries: '3' });

        const task = createElement('bpmn:ServiceTask', {
          id: 'ServiceTask_1',
          extensionElements: withExtensionElements([ taskDefinition ])
        });

        // when
        const typeEntryId = getZeebeEntryId(task, [
          'extensionElements', 'values', 0, 'type'
        ]);

        const retriesEntryId = getZeebeEntryId(task, [
          'extensionElements', 'values', 0, 'retries'
        ]);

        // then
        expect(typeEntryId).to.eql('taskDefinitionType');
        expect(retriesEntryId).to.eql('taskDefinitionRetries');
      });

    });


    describe('zeebe:CalledDecision', function() {

      it('should resolve decisionId and resultVariable', function() {

        // given
        const calledDecision = createElement('zeebe:CalledDecision', {
          decisionId: 'foo',
          resultVariable: 'bar'
        });

        const businessRuleTask = createElement('bpmn:BusinessRuleTask', {
          id: 'BusinessRuleTask_1',
          extensionElements: withExtensionElements([ calledDecision ])
        });

        // when
        const decisionIdEntryId = getZeebeEntryId(businessRuleTask, [
          'extensionElements', 'values', 0, 'decisionId'
        ]);

        const resultVariableEntryId = getZeebeEntryId(businessRuleTask, [
          'extensionElements', 'values', 0, 'resultVariable'
        ]);

        // then
        expect(decisionIdEntryId).to.eql('decisionId');
        expect(resultVariableEntryId).to.eql('resultVariable');
      });


      it('should resolve bindingType and versionTag', function() {

        // given
        const calledDecision = createElement('zeebe:CalledDecision', {
          bindingType: 'versionTag',
          versionTag: 'v1'
        });

        const businessRuleTask = createElement('bpmn:BusinessRuleTask', {
          id: 'BusinessRuleTask_1',
          extensionElements: withExtensionElements([ calledDecision ])
        });

        // when
        const bindingTypeEntryId = getZeebeEntryId(businessRuleTask, [
          'extensionElements', 'values', 0, 'bindingType'
        ]);

        const versionTagEntryId = getZeebeEntryId(businessRuleTask, [
          'extensionElements', 'values', 0, 'versionTag'
        ]);

        // then
        expect(bindingTypeEntryId).to.eql('bindingType');
        expect(versionTagEntryId).to.eql('versionTag');
      });

    });


    describe('zeebe:CalledElement', function() {

      it('should resolve processId and propagateAllChildVariables', function() {

        // given
        const calledElement = createElement('zeebe:CalledElement', {
          processId: 'foo',
          propagateAllChildVariables: false
        });

        const callActivity = createElement('bpmn:CallActivity', {
          id: 'CallActivity_1',
          extensionElements: withExtensionElements([ calledElement ])
        });

        // when
        const processIdEntryId = getZeebeEntryId(callActivity, [
          'extensionElements', 'values', 0, 'processId'
        ]);

        const propagateEntryId = getZeebeEntryId(callActivity, [
          'extensionElements', 'values', 0, 'propagateAllChildVariables'
        ]);

        // then
        expect(processIdEntryId).to.eql('targetProcessId');
        expect(propagateEntryId).to.eql('propagateAllChildVariables');
      });


      it('should resolve bindingType and versionTag', function() {

        // given
        const calledElement = createElement('zeebe:CalledElement', {
          bindingType: 'versionTag',
          versionTag: 'v1'
        });

        const callActivity = createElement('bpmn:CallActivity', {
          id: 'CallActivity_1',
          extensionElements: withExtensionElements([ calledElement ])
        });

        // when
        const bindingTypeEntryId = getZeebeEntryId(callActivity, [
          'extensionElements', 'values', 0, 'bindingType'
        ]);

        const versionTagEntryId = getZeebeEntryId(callActivity, [
          'extensionElements', 'values', 0, 'versionTag'
        ]);

        // then
        expect(bindingTypeEntryId).to.eql('bindingType');
        expect(versionTagEntryId).to.eql('versionTag');
      });


      it('should resolve businessId', function() {

        // given
        const calledElement = createElement('zeebe:CalledElement', { businessId: 'foo' });

        const callActivity = createElement('bpmn:CallActivity', {
          id: 'CallActivity_1',
          extensionElements: withExtensionElements([ calledElement ])
        });

        // when
        const entryId = getZeebeEntryId(callActivity, [
          'extensionElements', 'values', 0, 'businessId'
        ]);

        // then
        expect(entryId).to.eql('businessId');
      });

    });


    describe('zeebe:Script', function() {

      it('should resolve expression and resultVariable', function() {

        // given
        const script = createElement('zeebe:Script', {
          expression: '=foo',
          resultVariable: 'bar'
        });

        const scriptTask = createElement('bpmn:ScriptTask', {
          id: 'ScriptTask_1',
          extensionElements: withExtensionElements([ script ])
        });

        // when
        const expressionEntryId = getZeebeEntryId(scriptTask, [
          'extensionElements', 'values', 0, 'expression'
        ]);

        const resultVariableEntryId = getZeebeEntryId(scriptTask, [
          'extensionElements', 'values', 0, 'resultVariable'
        ]);

        // then
        expect(expressionEntryId).to.eql('scriptExpression');
        expect(resultVariableEntryId).to.eql('resultVariable');
      });

    });


    describe('zeebe:AssignmentDefinition', function() {

      it('should resolve assignee, candidateGroups and candidateUsers', function() {

        // given
        const assignmentDefinition = createElement('zeebe:AssignmentDefinition', {
          assignee: 'foo',
          candidateGroups: 'bar',
          candidateUsers: 'baz'
        });

        const userTask = createElement('bpmn:UserTask', {
          id: 'UserTask_1',
          extensionElements: withExtensionElements([ assignmentDefinition ])
        });

        // when
        const assigneeEntryId = getZeebeEntryId(userTask, [
          'extensionElements', 'values', 0, 'assignee'
        ]);

        const candidateGroupsEntryId = getZeebeEntryId(userTask, [
          'extensionElements', 'values', 0, 'candidateGroups'
        ]);

        const candidateUsersEntryId = getZeebeEntryId(userTask, [
          'extensionElements', 'values', 0, 'candidateUsers'
        ]);

        // then
        expect(assigneeEntryId).to.eql('assignmentDefinitionAssignee');
        expect(candidateGroupsEntryId).to.eql('assignmentDefinitionCandidateGroups');
        expect(candidateUsersEntryId).to.eql('assignmentDefinitionCandidateUsers');
      });

    });


    describe('zeebe:TaskSchedule', function() {

      it('should resolve dueDate and followUpDate', function() {

        // given
        const taskSchedule = createElement('zeebe:TaskSchedule', {
          dueDate: '=foo',
          followUpDate: '=bar'
        });

        const userTask = createElement('bpmn:UserTask', {
          id: 'UserTask_1',
          extensionElements: withExtensionElements([ taskSchedule ])
        });

        // when
        const dueDateEntryId = getZeebeEntryId(userTask, [
          'extensionElements', 'values', 0, 'dueDate'
        ]);

        const followUpDateEntryId = getZeebeEntryId(userTask, [
          'extensionElements', 'values', 0, 'followUpDate'
        ]);

        // then
        expect(dueDateEntryId).to.eql('taskScheduleDueDate');
        expect(followUpDateEntryId).to.eql('taskScheduleFollowUpDate');
      });

    });


    describe('zeebe:JobPriorityDefinition', function() {

      it('should resolve priority', function() {

        // given
        const jobPriorityDefinition = createElement('zeebe:JobPriorityDefinition', { priority: '50' });

        const serviceTask = createElement('bpmn:ServiceTask', {
          id: 'ServiceTask_1',
          extensionElements: withExtensionElements([ jobPriorityDefinition ])
        });

        // when
        const entryId = getZeebeEntryId(serviceTask, [
          'extensionElements', 'values', 0, 'priority'
        ]);

        // then
        expect(entryId).to.eql('jobPriorityDefinitionPriority');
      });

    });


    describe('zeebe:PriorityDefinition', function() {

      it('should resolve priority', function() {

        // given
        const priorityDefinition = createElement('zeebe:PriorityDefinition', { priority: '50' });

        const userTask = createElement('bpmn:UserTask', {
          id: 'UserTask_1',
          extensionElements: withExtensionElements([ priorityDefinition ])
        });

        // when
        const entryId = getZeebeEntryId(userTask, [
          'extensionElements', 'values', 0, 'priority'
        ]);

        // then
        expect(entryId).to.eql('priorityDefinitionPriority');
      });

    });


    describe('zeebe:VersionTag', function() {

      it('should resolve value', function() {

        // given
        const versionTag = createElement('zeebe:VersionTag', { value: 'v1' });

        const process = createElement('bpmn:Process', {
          id: 'Process_1',
          extensionElements: withExtensionElements([ versionTag ])
        });

        // when
        const entryId = getZeebeEntryId(process, [
          'extensionElements', 'values', 0, 'value'
        ]);

        // then
        expect(entryId).to.eql('versionTag');
      });

    });


    describe('zeebe:AdHoc', function() {

      it('should resolve outputCollection and outputElement', function() {

        // given
        const adHoc = createElement('zeebe:AdHoc', {
          outputCollection: '=foo',
          outputElement: '=bar'
        });

        const adHocSubProcess = createElement('bpmn:AdHocSubProcess', {
          id: 'AdHocSubProcess_1',
          extensionElements: withExtensionElements([ adHoc ])
        });

        // when
        const outputCollectionEntryId = getZeebeEntryId(adHocSubProcess, [
          'extensionElements', 'values', 0, 'outputCollection'
        ]);

        const outputElementEntryId = getZeebeEntryId(adHocSubProcess, [
          'extensionElements', 'values', 0, 'outputElement'
        ]);

        // then
        expect(outputCollectionEntryId).to.eql('adHocOutputCollection');
        expect(outputElementEntryId).to.eql('adHocOutputElement');
      });


      it('should resolve activeElementsCollection', function() {

        // given
        const adHoc = createElement('zeebe:AdHoc', { activeElementsCollection: '=foo' });

        const adHocSubProcess = createElement('bpmn:AdHocSubProcess', {
          id: 'AdHocSubProcess_1',
          extensionElements: withExtensionElements([ adHoc ])
        });

        // when
        const entryId = getZeebeEntryId(adHocSubProcess, [
          'extensionElements', 'values', 0, 'activeElementsCollection'
        ]);

        // then
        expect(entryId).to.eql('activeElements-activeElementsCollection');
      });

    });


    describe('bpmn:Error', function() {

      it('should resolve errorCode', function() {

        // given
        const error = createElement('bpmn:Error', { errorCode: 'foo' });

        const errorEventDefinition = createElement('bpmn:ErrorEventDefinition', { errorRef: error });

        const endEvent = createElement('bpmn:EndEvent', {
          id: 'EndEvent_1',
          eventDefinitions: [ errorEventDefinition ]
        });

        // when
        const entryId = getZeebeEntryId(endEvent, [
          'eventDefinitions', 0, 'errorRef', 'errorCode'
        ]);

        // then
        expect(entryId).to.eql('errorCode');
      });

    });


    describe('bpmn:Escalation', function() {

      it('should resolve escalationCode', function() {

        // given
        const escalation = createElement('bpmn:Escalation', { escalationCode: 'foo' });

        const escalationEventDefinition = createElement('bpmn:EscalationEventDefinition', {
          escalationRef: escalation
        });

        const endEvent = createElement('bpmn:EndEvent', {
          id: 'EndEvent_1',
          eventDefinitions: [ escalationEventDefinition ]
        });

        // when
        const entryId = getZeebeEntryId(endEvent, [
          'eventDefinitions', 0, 'escalationRef', 'escalationCode'
        ]);

        // then
        expect(entryId).to.eql('escalationCode');
      });

    });


    describe('bpmn:Message', function() {

      it('should resolve name', function() {

        // given
        const message = createElement('bpmn:Message', { name: 'foo' });

        const messageEventDefinition = createElement('bpmn:MessageEventDefinition', { messageRef: message });

        const startEvent = createElement('bpmn:StartEvent', {
          id: 'StartEvent_1',
          eventDefinitions: [ messageEventDefinition ]
        });

        // when
        const entryId = getZeebeEntryId(startEvent, [
          'eventDefinitions', 0, 'messageRef', 'name'
        ]);

        // then
        expect(entryId).to.eql('messageName');
      });


      it('should resolve subscription correlation key', function() {

        // given
        const subscription = createElement('zeebe:Subscription', { correlationKey: '=foo' });

        const message = createElement('bpmn:Message', {
          name: 'foo',
          extensionElements: withExtensionElements([ subscription ])
        });

        const messageEventDefinition = createElement('bpmn:MessageEventDefinition', { messageRef: message });

        const startEvent = createElement('bpmn:StartEvent', {
          id: 'StartEvent_1',
          eventDefinitions: [ messageEventDefinition ]
        });

        // when
        const entryId = getZeebeEntryId(startEvent, [
          'eventDefinitions', 0, 'messageRef', 'extensionElements', 'values', 0, 'correlationKey'
        ]);

        // then
        expect(entryId).to.eql('messageSubscriptionCorrelationKey');
      });

    });


    describe('bpmn:Signal', function() {

      it('should resolve name', function() {

        // given
        const signal = createElement('bpmn:Signal', { name: 'foo' });

        const signalEventDefinition = createElement('bpmn:SignalEventDefinition', { signalRef: signal });

        const throwEvent = createElement('bpmn:IntermediateThrowEvent', {
          id: 'IntermediateThrowEvent_1',
          eventDefinitions: [ signalEventDefinition ]
        });

        // when
        const entryId = getZeebeEntryId(throwEvent, [
          'eventDefinitions', 0, 'signalRef', 'name'
        ]);

        // then
        expect(entryId).to.eql('signalName');
      });

    });


    describe('zeebe:IoMapping (group)', function() {

      it('should resolve inputParameters collection to the inputs group', function() {

        // given
        const ioMapping = createElement('zeebe:IoMapping', {
          inputParameters: [ createElement('zeebe:Input', { source: '=foo', target: 'bar' }) ]
        });

        const serviceTask = createElement('bpmn:ServiceTask', {
          id: 'ServiceTask_1',
          extensionElements: withExtensionElements([ ioMapping ])
        });

        // when
        const entryId = getZeebeEntryId(serviceTask, [
          'extensionElements', 'values', 0, 'inputParameters'
        ]);

        // then
        expect(entryId).to.eql('inputs');
      });


      it('should resolve outputParameters collection to the outputs group', function() {

        // given
        const ioMapping = createElement('zeebe:IoMapping', {
          outputParameters: [ createElement('zeebe:Output', { source: '=foo', target: 'bar' }) ]
        });

        const serviceTask = createElement('bpmn:ServiceTask', {
          id: 'ServiceTask_1',
          extensionElements: withExtensionElements([ ioMapping ])
        });

        // when
        const entryId = getZeebeEntryId(serviceTask, [
          'extensionElements', 'values', 0, 'outputParameters'
        ]);

        // then
        expect(entryId).to.eql('outputs');
      });

    });


    describe('zeebe:ExecutionListener', function() {

      function withExecutionListener(listener) {
        const executionListeners = createElement('zeebe:ExecutionListeners', {
          listeners: [ listener ]
        });

        return createElement('bpmn:ServiceTask', {
          id: 'ServiceTask_1',
          extensionElements: withExtensionElements([ executionListeners ])
        });
      }

      it('should resolve eventType', function() {

        // given
        const listener = createElement('zeebe:ExecutionListener', {
          eventType: 'start',
          type: 'foo'
        });

        const serviceTask = withExecutionListener(listener);

        // when
        const entryId = getZeebeEntryId(serviceTask, [
          'extensionElements', 'values', 0, 'listeners', 0, 'eventType'
        ]);

        // then
        expect(entryId).to.eql('ServiceTask_1-executionListener-0-eventType');
      });


      it('should resolve type as the listenerType', function() {

        // given
        const listener = createElement('zeebe:ExecutionListener', {
          eventType: 'start',
          type: 'foo'
        });

        const serviceTask = withExecutionListener(listener);

        // when
        const entryId = getZeebeEntryId(serviceTask, [
          'extensionElements', 'values', 0, 'listeners', 0, 'type'
        ]);

        // then
        expect(entryId).to.eql('ServiceTask_1-executionListener-0-listenerType');
      });


      it('should resolve retries', function() {

        // given
        const listener = createElement('zeebe:ExecutionListener', {
          eventType: 'start',
          type: 'foo',
          retries: '5'
        });

        const serviceTask = withExecutionListener(listener);

        // when
        const entryId = getZeebeEntryId(serviceTask, [
          'extensionElements', 'values', 0, 'listeners', 0, 'retries'
        ]);

        // then
        expect(entryId).to.eql('ServiceTask_1-executionListener-0-retries');
      });


      it('should resolve a nested header key', function() {

        // given
        const header = createElement('zeebe:Header', { key: 'foo', value: 'bar' });

        const listener = createElement('zeebe:ExecutionListener', {
          eventType: 'start',
          type: 'foo',
          headers: createElement('zeebe:TaskHeaders', { values: [ header ] })
        });

        const serviceTask = withExecutionListener(listener);

        // when
        const entryId = getZeebeEntryId(serviceTask, [
          'extensionElements', 'values', 0, 'listeners', 0, 'headers', 'values', 0, 'key'
        ]);

        // then
        expect(entryId).to.eql('ServiceTask_1-executionListener-0-headers-header-0-key');
      });

    });


    describe('zeebe:TaskListener', function() {

      it('should resolve eventType', function() {

        // given
        const listener = createElement('zeebe:TaskListener', {
          eventType: 'assigning',
          type: 'foo'
        });

        const taskListeners = createElement('zeebe:TaskListeners', {
          listeners: [ listener ]
        });

        const userTask = createElement('bpmn:UserTask', {
          id: 'UserTask_1',
          extensionElements: withExtensionElements([ taskListeners ])
        });

        // when
        const entryId = getZeebeEntryId(userTask, [
          'extensionElements', 'values', 0, 'listeners', 0, 'eventType'
        ]);

        // then
        expect(entryId).to.eql('UserTask_1-taskListener-0-eventType');
      });

    });


    describe('bpmn:TimerEventDefinition', function() {

      it('should resolve the value when the expression is present', function() {

        // given
        const timerEventDefinition = createElement('bpmn:TimerEventDefinition', {
          timeDuration: createElement('bpmn:FormalExpression', { body: 'PT1H' })
        });

        const catchEvent = createElement('bpmn:IntermediateCatchEvent', {
          id: 'IntermediateCatchEvent_1',
          eventDefinitions: [ timerEventDefinition ]
        });

        // when
        const entryId = getZeebeEntryId(catchEvent, [
          'eventDefinitions', 0, 'timeDuration'
        ]);

        // then
        expect(entryId).to.eql('timerEventDefinitionValue');
      });


      it('should return null when the expression is absent', function() {

        // given
        const timerEventDefinition = createElement('bpmn:TimerEventDefinition', {});

        const catchEvent = createElement('bpmn:IntermediateCatchEvent', {
          id: 'IntermediateCatchEvent_1',
          eventDefinitions: [ timerEventDefinition ]
        });

        // when
        const entryId = getZeebeEntryId(catchEvent, [
          'eventDefinitions', 0, 'timeDuration'
        ]);

        // then
        expect(entryId).to.be.null;
      });

    });


    describe('bpmn:Process', function() {

      it('should resolve isExecutable', function() {

        // given
        const process = createElement('bpmn:Process', {
          id: 'Process_1',
          isExecutable: true
        });

        // when
        const entryId = getZeebeEntryId(process, [ 'isExecutable' ]);

        // then
        expect(entryId).to.eql('isExecutable');
      });

    });


    describe('bpmn:Error (name)', function() {

      it('should resolve name', function() {

        // given
        const error = createElement('bpmn:Error', { name: 'foo' });

        const errorEventDefinition = createElement('bpmn:ErrorEventDefinition', { errorRef: error });

        const endEvent = createElement('bpmn:EndEvent', {
          id: 'EndEvent_1',
          eventDefinitions: [ errorEventDefinition ]
        });

        // when
        const entryId = getZeebeEntryId(endEvent, [
          'eventDefinitions', 0, 'errorRef', 'name'
        ]);

        // then
        expect(entryId).to.eql('errorName');
      });

    });


    describe('bpmn:Escalation (name)', function() {

      it('should resolve name', function() {

        // given
        const escalation = createElement('bpmn:Escalation', { name: 'foo' });

        const escalationEventDefinition = createElement('bpmn:EscalationEventDefinition', {
          escalationRef: escalation
        });

        const throwEvent = createElement('bpmn:IntermediateThrowEvent', {
          id: 'IntermediateThrowEvent_1',
          eventDefinitions: [ escalationEventDefinition ]
        });

        // when
        const entryId = getZeebeEntryId(throwEvent, [
          'eventDefinitions', 0, 'escalationRef', 'name'
        ]);

        // then
        expect(entryId).to.eql('escalationName');
      });

    });


    describe('bpmn:LinkEventDefinition', function() {

      it('should resolve name', function() {

        // given
        const linkEventDefinition = createElement('bpmn:LinkEventDefinition', { name: 'foo' });

        const throwEvent = createElement('bpmn:IntermediateThrowEvent', {
          id: 'IntermediateThrowEvent_1',
          eventDefinitions: [ linkEventDefinition ]
        });

        // when
        const entryId = getZeebeEntryId(throwEvent, [
          'eventDefinitions', 0, 'name'
        ]);

        // then
        expect(entryId).to.eql('linkName');
      });

    });


    describe('bpmn:CompensateEventDefinition', function() {

      it('should resolve waitForCompletion and activityRef', function() {

        // given
        const compensateEventDefinition = createElement('bpmn:CompensateEventDefinition', {
          waitForCompletion: true
        });

        const throwEvent = createElement('bpmn:IntermediateThrowEvent', {
          id: 'IntermediateThrowEvent_1',
          eventDefinitions: [ compensateEventDefinition ]
        });

        // then
        expect(getZeebeEntryId(throwEvent, [
          'eventDefinitions', 0, 'waitForCompletion'
        ])).to.eql('waitForCompletion');

        expect(getZeebeEntryId(throwEvent, [
          'eventDefinitions', 0, 'activityRef'
        ])).to.eql('activityRef');
      });

    });


    describe('bpmn:AdHocSubProcess', function() {

      it('should resolve cancelRemainingInstances', function() {

        // given
        const adHocSubProcess = createElement('bpmn:AdHocSubProcess', {
          id: 'AdHocSubProcess_1',
          cancelRemainingInstances: false
        });

        // when
        const entryId = getZeebeEntryId(adHocSubProcess, [ 'cancelRemainingInstances' ]);

        // then
        expect(entryId).to.eql('cancelRemainingInstances');
      });

    });


    describe('unsupported paths', function() {

      it('should return null for an unrecognized node type', function() {

        // given
        const task = createElement('bpmn:ServiceTask', { id: 'ServiceTask_1', name: 'foo' });

        // when
        const entryId = getZeebeEntryId(task, [ 'name' ]);

        // then
        expect(entryId).to.be.null;
      });


      it('should return null for an unrecognized field on a known node type', function() {

        // given
        const input = createElement('zeebe:Input', { source: '=foo', target: 'bar' });

        const ioMapping = createElement('zeebe:IoMapping', {
          inputParameters: [ input ]
        });

        const serviceTask = createElement('bpmn:ServiceTask', {
          id: 'ServiceTask_1',
          extensionElements: withExtensionElements([ ioMapping ])
        });

        // when
        const entryId = getZeebeEntryId(serviceTask, [
          'extensionElements', 'values', 0, 'inputParameters', 0, 'unknownField'
        ]);

        // then
        expect(entryId).to.be.null;
      });


      it('should return null for a path pointing to a missing property', function() {

        // given
        const serviceTask = createElement('bpmn:ServiceTask', { id: 'ServiceTask_1' });

        // when
        const entryId = getZeebeEntryId(serviceTask, [
          'extensionElements', 'values', 0, 'inputParameters', 0, 'source'
        ]);

        // then
        expect(entryId).to.be.null;
      });


      it('should return null for an empty path', function() {

        // given
        const serviceTask = createElement('bpmn:ServiceTask', { id: 'ServiceTask_1' });

        // when
        const entryId = getZeebeEntryId(serviceTask, []);

        // then
        expect(entryId).to.be.null;
      });


      it('should return null when the path is not an array', function() {

        // given
        const serviceTask = createElement('bpmn:ServiceTask', { id: 'ServiceTask_1' });

        // when
        const entryId = getZeebeEntryId(serviceTask, null);

        // then
        expect(entryId).to.be.null;
      });

    });

  });

});
