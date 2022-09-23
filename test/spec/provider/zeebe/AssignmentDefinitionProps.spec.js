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

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import ZeebePropertiesProvider from 'src/provider/zeebe';

import BehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

import diagramXML from './AssignmentDefinitionProps.bpmn';
import { setEditorValue } from '../../../TestHelper';


describe('provider/zeebe - AssignmentDefinitionProps', function() {

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


  describe('bpmn:UserTask#assignmentDefinition.assignee', function() {

    it('should NOT display for service task', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const assigneeInput = domQuery('input[name=assignmentDefinitionAssignee]', container);

      // then
      expect(assigneeInput).to.not.exist;
    }));


    it('should display for user task', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const entry = domQuery('[data-entry-id="assignmentDefinitionAssignee"]', container);

      // then
      expect(entry).to.exist;

      // is FEEL input
      const input = domQuery('[role="textbox"]', entry);
      expect(input).to.exist;

      const assignmentDefinition = getAssignmentDefinition(userTask);
      const feelExpression = assignmentDefinition.get('assignee').substring(1);

      expect(input.textContent).to.equal(feelExpression);
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const assigneeInput = domQuery('[role="textbox"]', container);

      await setEditorValue(assigneeInput, 'newValue');

      // then
      // keep FEEL configuration
      expect(getAssignmentDefinition(userTask).get('assignee')).to.eql('=newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const userTask = elementRegistry.get('UserTask_1');
        const originalValue = getAssignmentDefinition(userTask).get('assignee');

        await act(() => {
          selection.select(userTask);
        });
        const assigneeInput = domQuery('[role="textbox"]', container);
        await setEditorValue(assigneeInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect('=' + assigneeInput.textContent).to.eql(originalValue);
      })
    );


    it('should create non existing extension elements and assignment definition',
      inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_2');

        // assume
        expect(getBusinessObject(userTask).get('extensionElements')).to.not.exist;

        await act(() => {
          selection.select(userTask);
        });

        // when
        const assigneeInput = domQuery('input[name=assignmentDefinitionAssignee]', container);
        changeInput(assigneeInput, 'newValue');

        // then
        expect(getBusinessObject(userTask).get('extensionElements')).to.exist;
      })
    );


    it('should re-use existing extension elements, creating new assignment definition',
      inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_3');

        // assume
        expect(getBusinessObject(userTask).get('extensionElements')).to.exist;
        expect(getAssignmentDefinition(userTask)).not.to.exist;

        await act(() => {
          selection.select(userTask);
        });

        // when
        const assigneeInput = domQuery('input[name=assignmentDefinitionAssignee]', container);
        changeInput(assigneeInput, 'newValue');

        // then
        const extensionElements = getBusinessObject(userTask).get('extensionElements');
        expect(getAssignmentDefinition(userTask).get('assignee')).to.eql('newValue');
        expect(extensionElements.values).to.have.length(2);
      })
    );

  });


  describe('bpmn:UserTask#assignmentDefinition.candidateGroups', function() {

    it('should NOT display for service task', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const candidateGroupsInput = domQuery('input[name=assignmentDefinitionCandidateGroups]', container);

      // then
      expect(candidateGroupsInput).to.not.exist;
    }));


    it('should display for user task', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const candidateGroupsInput = domQuery('input[name=assignmentDefinitionCandidateGroups]', container);

      // then
      const assignmentDefinition = getAssignmentDefinition(userTask);
      expect(candidateGroupsInput).to.exist;
      expect(candidateGroupsInput.value).to.equal(assignmentDefinition.get('candidateGroups'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const candidateGroupsInput = domQuery('input[name=assignmentDefinitionCandidateGroups]', container);
      changeInput(candidateGroupsInput, 'newValue');

      // then
      expect(getAssignmentDefinition(userTask).get('candidateGroups')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const userTask = elementRegistry.get('UserTask_1');
        const originalValue = getAssignmentDefinition(userTask).get('candidateGroups');

        await act(() => {
          selection.select(userTask);
        });
        const candidateGroupsInput = domQuery('input[name=assignmentDefinitionCandidateGroups]', container);
        changeInput(candidateGroupsInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(candidateGroupsInput.value).to.eql(originalValue);
      })
    );


    it('should create non existing extension elements and assignment definition',
      inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_2');

        // assume
        expect(getBusinessObject(userTask).get('extensionElements')).to.not.exist;

        await act(() => {
          selection.select(userTask);
        });

        // when
        const candidateGroupsInput = domQuery('input[name=assignmentDefinitionCandidateGroups]', container);
        changeInput(candidateGroupsInput, 'newValue');

        // then
        expect(getBusinessObject(userTask).get('extensionElements')).to.exist;
      })
    );


    it('should re-use existing extension elements, creating new assignment definition',
      inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_3');

        // assume
        expect(getBusinessObject(userTask).get('extensionElements')).to.exist;
        expect(getAssignmentDefinition(userTask)).not.to.exist;

        await act(() => {
          selection.select(userTask);
        });

        // when
        const candidateGroupsInput = domQuery('input[name=assignmentDefinitionCandidateGroups]', container);
        changeInput(candidateGroupsInput, 'newValue');

        // then
        const extensionElements = getBusinessObject(userTask).get('extensionElements');
        expect(getAssignmentDefinition(userTask).get('candidateGroups')).to.eql('newValue');
        expect(extensionElements.values).to.have.length(2);
      })
    );

  });


  describe('bpmn:UserTask#assignmentDefinition.candidateUsers', function() {

    it('should NOT display for service task', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const candidateUsersInput = domQuery('input[name=assignmentDefinitionCandidateUsers]', container);

      // then
      expect(candidateUsersInput).to.not.exist;
    }));


    it('should display for user task', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const candidateUsersInput = domQuery('input[name=assignmentDefinitionCandidateUsers]', container);

      // then
      const assignmentDefinition = getAssignmentDefinition(userTask);
      expect(candidateUsersInput).to.exist;
      expect(candidateUsersInput.value).to.equal(assignmentDefinition.get('candidateUsers'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const candidateUsersInput = domQuery('input[name=assignmentDefinitionCandidateUsers]', container);
      changeInput(candidateUsersInput, 'newValue');

      // then
      expect(getAssignmentDefinition(userTask).get('candidateUsers')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const userTask = elementRegistry.get('UserTask_1');
        const originalValue = getAssignmentDefinition(userTask).get('candidateUsers');

        await act(() => {
          selection.select(userTask);
        });
        const candidateUsersInput = domQuery('input[name=assignmentDefinitionCandidateUsers]', container);
        changeInput(candidateUsersInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(candidateUsersInput.value).to.eql(originalValue);
      })
    );


    it('should create non existing extension elements and assignment definition',
      inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_2');

        // assume
        expect(getBusinessObject(userTask).get('extensionElements')).to.not.exist;

        await act(() => {
          selection.select(userTask);
        });

        // when
        const candidateUsersInput = domQuery('input[name=assignmentDefinitionCandidateUsers]', container);
        changeInput(candidateUsersInput, 'newValue');

        // then
        expect(getBusinessObject(userTask).get('extensionElements')).to.exist;
      })
    );


    it('should re-use existing extension elements, creating new assignment definition',
      inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_3');

        // assume
        expect(getBusinessObject(userTask).get('extensionElements')).to.exist;
        expect(getAssignmentDefinition(userTask)).not.to.exist;

        await act(() => {
          selection.select(userTask);
        });

        // when
        const candidateUsersInput = domQuery('input[name=assignmentDefinitionCandidateUsers]', container);
        changeInput(candidateUsersInput, 'newValue');

        // then
        const extensionElements = getBusinessObject(userTask).get('extensionElements');
        expect(getAssignmentDefinition(userTask).get('candidateUsers')).to.eql('newValue');
        expect(extensionElements.values).to.have.length(2);
      })
    );

  });


  describe('integration', function() {

    describe('removing assignment definition when empty', function() {

      it('removing assignee', inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_4');

        await act(() => {
          selection.select(userTask);
        });

        // when
        const assigneeInput = domQuery('input[name=assignmentDefinitionAssignee]', container);

        changeInput(assigneeInput, '');

        // then
        expect(getAssignmentDefinition(userTask)).not.to.exist;
      }));


      it('removing candidate groups', inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_5');

        await act(() => {
          selection.select(userTask);
        });

        // when
        const candidateGroupsInput = domQuery('input[name=assignmentDefinitionCandidateGroups]', container);

        changeInput(candidateGroupsInput, '');

        // then
        expect(getAssignmentDefinition(userTask)).not.to.exist;
      }));


      it('removing candidate users', inject(async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('UserTask_6');

        await act(() => {
          selection.select(userTask);
        });

        // when
        const candidateUsersInput = domQuery('input[name=assignmentDefinitionCandidateUsers]', container);

        changeInput(candidateUsersInput, '');

        // then
        expect(getAssignmentDefinition(userTask)).not.to.exist;
      }));

    });

  });

});


// helper //////////////////

function getAssignmentDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:AssignmentDefinition')[0];
}
