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

import { getTaskSchedule } from 'src/provider/zeebe/properties/TaskScheduleProps';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import ZeebePropertiesProvider from 'src/provider/zeebe';

import BehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './TaskScheduleProps.bpmn';
import { setEditorValue } from '../../../TestHelper';


describe('provider/zeebe - TaskScheduleProps', function() {

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


  describe('zeebe:dueDate', function() {

    it('should NOT display for service task', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const dueDateInput = domQuery('input[name=taskScheduleDueDate]', container);

      // then
      expect(dueDateInput).to.not.exist;
    }));


    it('should display for user task', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const entry = domQuery('[data-entry-id="taskScheduleDueDate"]', container);

      // then
      expect(entry).to.exist;

      // is FEEL input
      const input = domQuery('[role="textbox"]', entry);
      expect(input).to.exist;

      const taskSchedule = getTaskSchedule(userTask);
      const feelExpression = taskSchedule.get('dueDate').substring(1);

      expect(input.textContent).to.equal(feelExpression);
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const dueDateInput = domQuery('[data-entry-id="taskScheduleDueDate"] [role="textbox"]', container);

      await setEditorValue(dueDateInput, 'newValue');

      // then
      // keep FEEL configuration
      expect(getTaskSchedule(userTask).get('dueDate')).to.eql('=newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const userTask = elementRegistry.get('UserTask_1');
        const originalValue = getTaskSchedule(userTask).get('dueDate');

        await act(() => {
          selection.select(userTask);
        });
        const dueDateInput = domQuery('[data-entry-id="taskScheduleDueDate"] [role="textbox"]', container);
        await setEditorValue(dueDateInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect('=' + dueDateInput.textContent).to.eql(originalValue);
      })
    );


    it('should create non existing extension elements and task schedule',
      inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_2');

        // assume
        expect(getBusinessObject(userTask).get('extensionElements')).to.not.exist;

        await act(() => {
          selection.select(userTask);
        });

        // when
        const dueDateInput = domQuery('input[name=taskScheduleDueDate]', container);
        changeInput(dueDateInput, 'newValue');

        // then
        expect(getBusinessObject(userTask).get('extensionElements')).to.exist;
      })
    );


    it('should re-use existing extension elements, creating new task schedule',
      inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_3');

        // assume
        expect(getBusinessObject(userTask).get('extensionElements')).to.exist;
        expect(getTaskSchedule(userTask)).not.to.exist;

        await act(() => {
          selection.select(userTask);
        });

        // when
        const dueDateInput = domQuery('input[name=taskScheduleDueDate]', container);
        changeInput(dueDateInput, 'newValue');

        // then
        const extensionElements = getBusinessObject(userTask).get('extensionElements');
        expect(getTaskSchedule(userTask).get('dueDate')).to.eql('newValue');
        expect(extensionElements.values).to.have.length(2);
      })
    );

  });


  describe('zeebe:followUpDate', function() {

    it('should NOT display for service task', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const followUpDate = domQuery('input[name=taskScheduleFollowUpDate]', container);

      // then
      expect(followUpDate).to.not.exist;
    }));


    it('should display for user task', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const entry = domQuery('[data-entry-id="taskScheduleFollowUpDate"]', container);

      // then
      expect(entry).to.exist;

      // is FEEL input
      const input = domQuery('[role="textbox"]', entry);
      expect(input).to.exist;

      const taskSchedule = getTaskSchedule(userTask);
      const feelExpression = taskSchedule.get('followUpDate').substring(1);

      expect(input.textContent).to.equal(feelExpression);
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const followUpDateInput = domQuery('[data-entry-id="taskScheduleFollowUpDate"] [role="textbox"]', container);

      await setEditorValue(followUpDateInput, 'newValue');

      // then
      // keep FEEL configuration
      expect(getTaskSchedule(userTask).get('followUpDate')).to.eql('=newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const userTask = elementRegistry.get('UserTask_1');
        const originalValue = getTaskSchedule(userTask).get('followUpDate');

        await act(() => {
          selection.select(userTask);
        });
        const followUpDateInput = domQuery('[data-entry-id="taskScheduleFollowUpDate"] [role="textbox"]', container);
        await setEditorValue(followUpDateInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect('=' + followUpDateInput.textContent).to.eql(originalValue);
      })
    );


    it('should create non existing extension elements and task schedule',
      inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_2');

        // assume
        expect(getBusinessObject(userTask).get('extensionElements')).to.not.exist;

        await act(() => {
          selection.select(userTask);
        });

        // when
        const followUpDateInput = domQuery('input[name=taskScheduleFollowUpDate]', container);
        changeInput(followUpDateInput, 'newValue');

        // then
        expect(getBusinessObject(userTask).get('extensionElements')).to.exist;
      })
    );


    it('should re-use existing extension elements, creating new task schedule',
      inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_3');

        // assume
        expect(getBusinessObject(userTask).get('extensionElements')).to.exist;
        expect(getTaskSchedule(userTask)).not.to.exist;

        await act(() => {
          selection.select(userTask);
        });

        // when
        const followUpDateInput = domQuery('input[name=taskScheduleFollowUpDate]', container);
        changeInput(followUpDateInput, 'newValue');

        // then
        const extensionElements = getBusinessObject(userTask).get('extensionElements');
        expect(getTaskSchedule(userTask).get('followUpDate')).to.eql('newValue');
        expect(extensionElements.values).to.have.length(2);
      })
    );

  });


  describe('integration', function() {

    describe('removing task schedule when empty', function() {

      it('removing zeebe:dueDate', inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_4');

        await act(() => {
          selection.select(userTask);
        });

        // when
        const dueDateInput = domQuery('[data-entry-id="taskScheduleDueDate"] [role="textbox"]', container);

        await setEditorValue(dueDateInput, '');

        // then
        expect(getTaskSchedule(userTask)).not.to.exist;
      }));


      it('removing zeebe:followUpDate', inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_5');

        await act(() => {
          selection.select(userTask);
        });

        // when
        const followUpDateInput = domQuery('[data-entry-id="taskScheduleFollowUpDate"] [role="textbox"]', container);

        await setEditorValue(followUpDateInput, '');

        // then
        expect(getTaskSchedule(userTask)).not.to.exist;
      }));

    });

  });

});