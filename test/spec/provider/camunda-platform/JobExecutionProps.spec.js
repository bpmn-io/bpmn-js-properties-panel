import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  clickInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import BehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import processDiagramXML from './JobExecutionProps-Process.bpmn';
import collaborationDiagramXML from './JobExecutionProps-Collaboration.bpmn';


describe('provider/camunda-platform - JobExecutionProps', function() {

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


  describe('bpmn:Process#jobPriority', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(processDiagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const jobPriorityInput = domQuery('input[name=jobPriority]', container);

      // then
      expect(jobPriorityInput).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const process = elementRegistry.get('Process_1');

      await act(() => {
        selection.select(process);
      });

      // when
      const jobPriorityInput = domQuery('input[name=jobPriority]', container);

      // then
      expect(jobPriorityInput.value).to.eql(getJobPriority(process));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const process = elementRegistry.get('Process_1');

      await act(() => {
        selection.select(process);
      });

      // when
      const jobPriorityInput = domQuery('input[name=jobPriority]', container);
      changeInput(jobPriorityInput, '99');

      // then
      expect(getJobPriority(process)).to.eql('99');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const process = elementRegistry.get('Process_1');

        const originalValue = getJobPriority(process);

        await act(() => {
          selection.select(process);
        });
        const jobPriorityInput = domQuery('input[name=jobPriority]', container);
        changeInput(jobPriorityInput, '99');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(jobPriorityInput.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:Participant.processRef#jobPriority', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(collaborationDiagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_2');

      await act(() => {
        selection.select(participant);
      });

      // when
      const jobPriorityInput = domQuery('input[name=jobPriority]', container);

      // then
      expect(jobPriorityInput).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const jobPriorityInput = domQuery('input[name=jobPriority]', container);

      // then
      expect(jobPriorityInput.value).to.eql(getJobPriority(participant));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const jobPriorityInput = domQuery('input[name=jobPriority]', container);
      changeInput(jobPriorityInput, '99');

      // then
      expect(getJobPriority(participant)).to.eql('99');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const participant = elementRegistry.get('Participant_1');

        const originalValue = getJobPriority(participant);

        await act(() => {
          selection.select(participant);
        });
        const jobPriorityInput = domQuery('input[name=jobPriority]', container);
        changeInput(jobPriorityInput, '99');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(jobPriorityInput.value).to.eql(originalValue);
      })
    );

  });


  describe('camunda:JobPriorized#jobRetryTimeCycle', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(processDiagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const retryTimeCycleInput = domQuery('input[name=retryTimeCycle]', container);

      // then
      expect(retryTimeCycleInput).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_2');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const retryTimeCycleInput = domQuery('input[name=retryTimeCycle]', container);

      // then
      expect(retryTimeCycleInput.value).to.eql(getJobRetryTimeCycle(serviceTask));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_2');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const retryTimeCycleInput = domQuery('input[name=retryTimeCycle]', container);
      changeInput(retryTimeCycleInput, '99');

      // then
      expect(getJobRetryTimeCycle(serviceTask)).to.eql('99');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_2');

        const originalValue = getJobRetryTimeCycle(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });
        const retryTimeCycleInput = domQuery('input[name=retryTimeCycle]', container);
        changeInput(retryTimeCycleInput, '99');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(retryTimeCycleInput.value).to.eql(originalValue);
      })
    );


    it('should create new extensionElements and FailedJobRetryTimeCycle',
      inject(async function(elementRegistry, selection) {

        // given
        const businessRuleTask = elementRegistry.get('BusinessRuleTask_1');

        await act(() => {
          selection.select(businessRuleTask);
        });

        // assume
        const bo = getBusinessObject(businessRuleTask);
        expect(getExtensionElementsList(bo, 'camunda:FailedJobRetryTimeCycle'))
          .to.have.length(0);

        // when
        const retryTimeCycleInput = domQuery('input[name=retryTimeCycle]', container);
        changeInput(retryTimeCycleInput, '99');

        // then
        expect(getExtensionElementsList(bo, 'camunda:FailedJobRetryTimeCycle'))
          .to.have.length(1);
      }));


    it('should re-use extensionElements and FailedJobRetryTimeCycle',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_2');

        await act(() => {
          selection.select(serviceTask);
        });

        // assume
        const bo = getBusinessObject(serviceTask);
        expect(getExtensionElementsList(bo, 'camunda:FailedJobRetryTimeCycle'))
          .to.have.length(1);
        expect(getExtensionElementsList(bo)).to.have.length(2);

        // when
        const retryTimeCycleInput = domQuery('input[name=retryTimeCycle]', container);
        changeInput(retryTimeCycleInput, '99');

        // then
        expect(getExtensionElementsList(bo, 'camunda:FailedJobRetryTimeCycle'))
          .to.have.length(1);
        expect(getExtensionElementsList(bo)).to.have.length(2);
      }));


    describe('integration', function() {

      it('should remove retry time cycle when setting async before to false', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_3'),
              businessObject = getBusinessObject(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        expect(businessObject.get('asyncBefore')).to.be.true;

        // when
        const asyncBeforeCheckbox = domQuery('input[name=asynchronousContinuationBefore]', container);

        clickInput(asyncBeforeCheckbox);

        // then
        expect(businessObject.get('asyncBefore')).to.be.false;

        expect(getJobRetryTimeCycle(serviceTask)).not.to.exist;
      }));


      it('should remove retry time cycle when setting async after to false', inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_2'),
              businessObject = getBusinessObject(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        expect(businessObject.get('asyncAfter')).to.be.true;

        // when
        const asyncAfterCheckbox = domQuery('input[name=asynchronousContinuationAfter]', container);

        clickInput(asyncAfterCheckbox);

        // then
        expect(businessObject.get('asyncAfter')).to.be.false;

        expect(getJobRetryTimeCycle(serviceTask)).not.to.exist;
      }));

    });

  });

});


// helper //////////////////

function getJobPriority(element) {
  const businessObject = is(element, 'bpmn:Participant') ?
    getBusinessObject(element).get('processRef') :
    getBusinessObject(element);

  return businessObject.get('camunda:jobPriority');
}

function getJobRetryTimeCycle(element) {
  const businessObject = getBusinessObject(element);

  const failedJobRetryTimeCycleExtensionElements = getExtensionElementsList(businessObject, 'camunda:FailedJobRetryTimeCycle');

  if (!failedJobRetryTimeCycleExtensionElements || !failedJobRetryTimeCycleExtensionElements.length) {
    return null;
  }

  return failedJobRetryTimeCycleExtensionElements[ 0 ].get('body');
}
