import { expect } from 'chai';

import { getZeebeEntryId } from '../../../src/provider/zeebe/utils/EntryIdUtil';

import { BpmnModdle } from 'bpmn-moddle';

import ZeebeBpmnModdle from 'zeebe-bpmn-moddle/resources/zeebe';


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
