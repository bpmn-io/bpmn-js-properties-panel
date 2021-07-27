import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

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

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import diagramXML from './UserAssignmentProps.bpmn';


describe('provider/camunda-platform - UserAssignmentProps', function() {

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

  describe('bpmn:UserTask#camunda:assignee', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = domQuery('input[name=assignee]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const input = domQuery('input[name=assignee]', container);

      // then
      expect(input.value).to.eql(
        getBusinessObject(userTask).get('camunda:assignee')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const input = domQuery('input[name=assignee]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getBusinessObject(userTask).get('camunda:assignee')
      ).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const userTask = elementRegistry.get('UserTask_1');

        const originalValue = getBusinessObject(userTask).get('camunda:assignee');

        await act(() => {
          selection.select(userTask);
        });
        const input = domQuery('input[name=assignee]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:UserTask#camunda:candidateUsers', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = domQuery('input[name=candidateUsers]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const input = domQuery('input[name=candidateUsers]', container);

      // then
      expect(input.value).to.eql(
        getBusinessObject(userTask).get('camunda:candidateUsers')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const input = domQuery('input[name=candidateUsers]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getBusinessObject(userTask).get('camunda:candidateUsers')
      ).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const userTask = elementRegistry.get('UserTask_1');

        const originalValue = getBusinessObject(userTask).get('camunda:candidateUsers');

        await act(() => {
          selection.select(userTask);
        });
        const input = domQuery('input[name=candidateUsers]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:UserTask#camunda:candidateGroups', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = domQuery('input[name=candidateGroups]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const input = domQuery('input[name=candidateGroups]', container);

      // then
      expect(input.value).to.eql(
        getBusinessObject(userTask).get('camunda:candidateGroups')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const input = domQuery('input[name=candidateGroups]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getBusinessObject(userTask).get('camunda:candidateGroups')
      ).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const userTask = elementRegistry.get('UserTask_1');

        const originalValue = getBusinessObject(userTask).get('camunda:candidateGroups');

        await act(() => {
          selection.select(userTask);
        });
        const input = domQuery('input[name=candidateGroups]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:UserTask#camunda:dueDate', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = domQuery('input[name=dueDate]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const input = domQuery('input[name=dueDate]', container);

      // then
      expect(input.value).to.eql(
        getBusinessObject(userTask).get('camunda:dueDate')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const input = domQuery('input[name=dueDate]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getBusinessObject(userTask).get('camunda:dueDate')
      ).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const userTask = elementRegistry.get('UserTask_1');

        const originalValue = getBusinessObject(userTask).get('camunda:dueDate');

        await act(() => {
          selection.select(userTask);
        });
        const input = domQuery('input[name=dueDate]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:UserTask#camunda:followUpDate', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = domQuery('input[name=followUpDate]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const input = domQuery('input[name=followUpDate]', container);

      // then
      expect(input.value).to.eql(
        getBusinessObject(userTask).get('camunda:followUpDate')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const input = domQuery('input[name=followUpDate]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getBusinessObject(userTask).get('camunda:followUpDate')
      ).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const userTask = elementRegistry.get('UserTask_1');

        const originalValue = getBusinessObject(userTask).get('camunda:followUpDate');

        await act(() => {
          selection.select(userTask);
        });
        const input = domQuery('input[name=followUpDate]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:UserTask#camunda:priority', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = domQuery('input[name=priority]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const input = domQuery('input[name=priority]', container);

      // then
      expect(input.value).to.eql(
        getBusinessObject(userTask).get('camunda:priority')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const input = domQuery('input[name=priority]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getBusinessObject(userTask).get('camunda:priority')
      ).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const userTask = elementRegistry.get('UserTask_1');

        const originalValue = getBusinessObject(userTask).get('camunda:priority');

        await act(() => {
          selection.select(userTask);
        });
        const input = domQuery('input[name=priority]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );

  });

});
