import TestContainer from 'mocha-test-container-support';

import {
  act
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

import ZeebePropertiesProvider from 'src/provider/zeebe';
import BpmnPropertiesProvider from 'src/provider/bpmn';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './ZeebePropertiesProvider.bpmn';


describe('<ZeebePropertiesProvider>', function() {

  const testModules = [
    BpmnPropertiesPanel,
    CoreModule,
    ModelingModule,
    SelectionModule,
    BpmnPropertiesProvider,
    ZeebePropertiesProvider
  ];

  const moddleExtensions = {
    zeebe: zeebeModdleExtensions
  };

  let container;


  describe('groups', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT show input group', inject(async function(elementRegistry, selection) {

      // given
      const elements = [
        elementRegistry.get('Task_1'),
        elementRegistry.get('Event_1')
      ];

      for (const ele of elements) {
        await act(() => {
          selection.select(ele);
        });

        // when
        const inputGroup = getGroup(container, 'inputs');

        // then
        expect(inputGroup).to.not.exist;
      }
    }));


    it('should show input group', inject(async function(elementRegistry, selection) {

      // given
      const elements = [
        elementRegistry.get('MessageThrow_1'),
        elementRegistry.get('MessageEnd_1'),
        elementRegistry.get('ServiceTask_1')
      ];

      for (const ele of elements) {
        await act(() => {
          selection.select(ele);
        });

        // when
        const inputGroup = getGroup(container, 'inputs');

        // then
        expect(inputGroup).to.exist;
      }
    }));


    it('should NOT show target group', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const targetGroup = getGroup(container, 'calledElement');

      // then
      expect(targetGroup).to.not.exist;
    }));


    it('should show target group', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('CallActivity_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const targetGroup = getGroup(container, 'calledElement');

      // then
      expect(targetGroup).to.exist;
    }));


    it('should NOT show output group', inject(async function(elementRegistry, selection) {

      // given
      const elements = [
        elementRegistry.get('Task_1'),
        elementRegistry.get('ErrorEndEvent_1')
      ];

      for (const ele of elements) {
        await act(() => {
          selection.select(ele);
        });

        // when
        const outputGroup = getGroup(container, 'outputs');

        // then
        expect(outputGroup).to.not.exist;
      }
    }));


    it('should show output group', inject(async function(elementRegistry, selection) {

      // given
      const elements = [
        elementRegistry.get('ServiceTask_1'),
        elementRegistry.get('Event_1')
      ];

      for (const ele of elements) {
        await act(() => {
          selection.select(ele);
        });

        // when
        const outputGroup = getGroup(container, 'outputs');

        // then
        expect(outputGroup).to.exist;
      }
    }));


    it('should NOT show header group', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const headerGroup = getGroup(container, 'headers');

      // then
      expect(headerGroup).to.not.exist;
    }));

    it('should show header group', inject(async function(elementRegistry, selection) {

      // given
      const elements = [
        elementRegistry.get('MessageThrow_1'),
        elementRegistry.get('MessageEnd_1'),
        elementRegistry.get('ScriptTask_1')
      ];

      for (const ele of elements) {
        await act(() => {
          selection.select(ele);
        });

        // when
        const headersGroup = getGroup(container, 'headers');

        // then
        expect(headersGroup).to.exist;
      }
    }));


    it('should not show header group', inject(async function(elementRegistry, selection) {

      // given
      const noneEndEvent = elementRegistry.get('Event_1');

      await act(() => {
        selection.select(noneEndEvent);
      });

      // when
      const headersGroup = getGroup(container, 'headers');

      // then
      expect(headersGroup).to.not.exist;
    }));


    it('should show taskDefinition group', inject(async function(elementRegistry, selection) {

      // given
      const elements = [
        elementRegistry.get('MessageThrow_1'),
        elementRegistry.get('MessageEnd_1'),
        elementRegistry.get('ServiceTask_1')
      ];

      for (const ele of elements) {
        await act(() => {
          selection.select(ele);
        });

        // when
        const taskDefinitionGroup = getGroup(container, 'taskDefinition');

        // then
        expect(taskDefinitionGroup).to.exist;
      }
    }));


    it('should not show taskDefinition group', inject(async function(elementRegistry, selection) {

      // given
      const elements = [
        elementRegistry.get('Event_1'),
        elementRegistry.get('Task_1')
      ];

      for (const ele of elements) {
        await act(() => {
          selection.select(ele);
        });

        // when
        const taskDefinitionGroup = getGroup(container, 'taskDefinition');

        // then
        expect(taskDefinitionGroup).to.not.exist;
      }
    }));


    it('should NOT show multi instance group', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const multiInstanceGroup = getGroup(container, 'multiInstance');

      // then
      expect(multiInstanceGroup).to.not.exist;
    }));


    it('should show multi instance group', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const multiInstanceGroup = getGroup(container, 'multiInstance');

      // then
      expect(multiInstanceGroup).to.exist;
    }));


    it('should NOT show condition group', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Flow_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const conditionGroup = getGroup(container, 'condition');

      // then
      expect(conditionGroup).to.not.exist;
    }));


    it('should show condition group', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('Flow_2');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const conditionGroup = getGroup(container, 'condition');

      // then
      expect(conditionGroup).to.exist;
    }));


    it('should NOT show output propagation group', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const outputPropagationGroup = getGroup(container, 'outputPropagation');

      // then
      expect(outputPropagationGroup).to.not.exist;
    }));


    it('should show output propagation group', inject(async function(elementRegistry, selection) {

      // given
      const callActivity = elementRegistry.get('CallActivity_1');

      await act(() => {
        selection.select(callActivity);
      });

      // when
      const outputPropagationGroup = getGroup(container, 'outputPropagation');

      // then
      expect(outputPropagationGroup).to.exist;
    }));


    it('should show timer event group', inject(async function(elementRegistry, selection) {

      // given
      const elements = [
        elementRegistry.get('TimerStartEvent_1'),
        elementRegistry.get('TimerBoundaryEvent_1'),
        elementRegistry.get('InterruptingTimerBoundaryEvent_1'),
        elementRegistry.get('IntermediateTimerICatchEvent_1')
      ];

      for (const ele of elements) {
        await act(() => {
          selection.select(ele);
        });

        // when
        const timerEvent = getGroup(container, 'timer');

        // then
        expect(timerEvent).to.exist;
      }
    }));


    it('should NOT show timer event group', inject(async function(elementRegistry, selection) {

      // given
      const elements = [
        elementRegistry.get('Task_1'),
        elementRegistry.get('IntermediateCatchEvent_1'),
        elementRegistry.get('BoundaryEvent_1')
      ];

      for (const ele of elements) {
        await act(() => {
          selection.select(ele);
        });

        // when
        const timerEvent = getGroup(container, 'timer');

        // then
        expect(timerEvent).not.to.exist;
      }
    }));


    it('should show groups for sendTasks', inject(async function(selection, elementRegistry) {

      // given
      const sendTask = elementRegistry.get('SendTask_1');

      // when
      await act(() => {
        selection.select(sendTask);
      });

      // then
      expect(getGroup(container, 'inputs')).to.exist;
      expect(getGroup(container, 'outputs')).to.exist;
      expect(getGroup(container, 'multiInstance')).to.exist;
      expect(getGroup(container, 'taskDefinition')).to.exist;
      expect(getGroup(container, 'headers')).to.exist;
    }));


    it('should show for scriptTasks with task definition', inject(async function(selection, elementRegistry) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_1');

      // when
      await act(() => {
        selection.select(scriptTask);
      });

      // then
      expectGroup(container, 'inputs').to.exist;
      expectGroup(container, 'outputs').to.exist;
      expectGroup(container, 'multiInstance').to.exist;
      expectGroup(container, 'scriptImplementation').to.exist;
      expectGroup(container, 'script').not.to.exist;
      expectGroup(container, 'taskDefinition').to.exist;
      expectGroup(container, 'headers').to.exist;
    }));


    it('should show for scriptTasks with script', inject(async function(selection, elementRegistry) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_2');

      // when
      await act(() => {
        selection.select(scriptTask);
      });

      // then
      expectGroup(container, 'inputs').to.exist;
      expectGroup(container, 'outputs').to.exist;
      expectGroup(container, 'multiInstance').to.exist;
      expectGroup(container, 'scriptImplementation').to.exist;
      expectGroup(container, 'script').to.exist;
      expectGroup(container, 'taskDefinition').not.to.exist;
      expectGroup(container, 'headers').not.to.exist;
    }));


    it('should show for scriptTasks without implementation', inject(async function(selection, elementRegistry) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_3');

      // when
      await act(() => {
        selection.select(scriptTask);
      });

      // then
      expectGroup(container, 'inputs').to.exist;
      expectGroup(container, 'outputs').to.exist;
      expectGroup(container, 'multiInstance').to.exist;
      expectGroup(container, 'scriptImplementation').to.exist;
      expectGroup(container, 'script').not.to.exist;
      expectGroup(container, 'taskDefinition').not.to.exist;
      expectGroup(container, 'headers').not.to.exist;
    }));


    it('should show for businessRuleTasks with taskDefinition', inject(async function(selection, elementRegistry) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_1');

      // when
      await act(() => {
        selection.select(businessRuleTask);
      });

      // then
      expect(getGroup(container, 'inputs')).to.exist;
      expect(getGroup(container, 'outputs')).to.exist;
      expect(getGroup(container, 'multiInstance')).to.exist;
      expect(getGroup(container, 'taskDefinition')).to.exist;
      expect(getGroup(container, 'headers')).to.exist;
      expect(getGroup(container, 'businessRuleImplementation')).to.exist;
      expect(getGroup(container, 'calledDecision')).to.not.exist;
    }));


    it('should show for businessRuleTasks with calledDecision', inject(async function(selection, elementRegistry) {

      // given
      const businessRuleTask = elementRegistry.get('BusinessRuleTask_2');

      // when
      await act(() => {
        selection.select(businessRuleTask);
      });

      // then
      expect(getGroup(container, 'inputs')).to.exist;
      expect(getGroup(container, 'outputs')).to.exist;
      expect(getGroup(container, 'multiInstance')).to.exist;
      expect(getGroup(container, 'taskDefinition')).to.not.exist;
      expect(getGroup(container, 'headers')).to.not.exist;
      expect(getGroup(container, 'businessRuleImplementation')).to.exist;
      expect(getGroup(container, 'calledDecision')).to.not.exist;
    }));


    it('should NOT show message group', inject(async function(elementRegistry, selection) {

      // given
      const elements = [
        elementRegistry.get('MessageThrow_1'),
        elementRegistry.get('MessageEnd_1')
      ];

      for (const ele of elements) {
        await act(() => {
          selection.select(ele);
        });

        // when
        const messageGroup = getGroup(container, 'message');

        // then
        expect(messageGroup).to.not.exist;
      }
    }));


    it('should show assignment definition group', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      // when
      await act(() => {
        selection.select(userTask);
      });

      // then
      expect(getGroup(container, 'assignmentDefinition')).to.exist;
    }));


    it('should NOT show assignment definition group', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      await act(() => {
        selection.select(task);
      });

      // then
      expect(getGroup(container, 'assignmentDefinition')).to.not.exist;
    }));


    it('should show escalation group', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('EscalationEvent');

      // when
      await act(() => {
        selection.select(userTask);
      });

      // then
      expect(getGroup(container, 'escalation')).to.exist;
    }));


    it('should NOT show escalation group', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      // when
      await act(() => {
        selection.select(task);
      });

      // then
      expect(getGroup(container, 'escalation')).to.not.exist;
    }));

  });


  describe('integration', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(diagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should work with BpmnPropertiesProvider', inject(async function(elementRegistry, selection) {

      // given
      const linkEvent = elementRegistry.get('LinkEvent_1');

      await act(() => {
        selection.select(linkEvent);
      });

      // when
      const linkGroup = getGroup(container, 'link');

      // then
      expect(linkGroup).to.exist;
    }));

    it('should overwrite timer event group', inject(async function(elementRegistry, selection) {

      // given
      const timerEvent = elementRegistry.get('TimerStartEvent_1');

      await act(() => {
        selection.select(timerEvent);
      });

      // when
      const timerEventGroups = getAllGroups(container, 'timer');
      const selectOptionTimeDate = domQuery('#bio-properties-panel-timerEventDefinitionType option[value="timeDate"]', timerEventGroups[0]);
      const selectOptionTimeDuration = domQuery('#bio-properties-panel-timerEventDefinitionType option[value="timeDuration"]', timerEventGroups[0]);

      // then
      expect(timerEventGroups).to.have.length(1);
      expect(selectOptionTimeDate).to.exist;
      expect(selectOptionTimeDuration).to.not.exist;
    }));


    it('should overwrite multiInstance group', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('ScriptTask_1');

      await act(() => {
        selection.select(element);
      });

      // when
      const multiInstanceGroups = getAllGroups(container, 'multiInstance');
      const completionConditionInput = domQuery('[name=completionCondition]', multiInstanceGroups[0]);
      const inputCollectionInput = domQuery('[name="multiInstance-inputCollection"]', multiInstanceGroups[0]);

      // then
      expect(multiInstanceGroups).to.have.length(1);
      expect(completionConditionInput).to.not.exist;
      expect(inputCollectionInput).to.exist;
    }));

  });

});


// helpers /////////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getAllGroups(container, id) {
  return domQueryAll(`[data-group-id="group-${id}"`, container);
}

function expectGroup(container, id) {
  return expect(getGroup(container, id), `Group: "${id}"`);
}
