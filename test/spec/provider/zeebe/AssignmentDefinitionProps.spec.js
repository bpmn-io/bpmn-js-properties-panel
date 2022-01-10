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

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

import diagramXML from './AssignmentDefinitionProps.bpmn';


describe('provider/zeebe - AssignmentDefinitionProps', function() {

  const testModules = [
    CoreModule,
    SelectionModule,
    ModelingModule,
    BpmnPropertiesPanel,
    ZeebePropertiesProvider
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
      const assigneeInput = domQuery('input[name=assignmentDefinitionAssignee]', container);

      // then
      const assignmentDefinition = getAssignmentDefinition(userTask);
      expect(assigneeInput).to.exist;
      expect(assigneeInput.value).to.equal(assignmentDefinition.get('assignee'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('UserTask_1');

      await act(() => {
        selection.select(userTask);
      });

      // when
      const assigneeInput = domQuery('input[name=assignmentDefinitionAssignee]', container);
      changeInput(assigneeInput, 'newValue');

      // then
      expect(getAssignmentDefinition(userTask).get('assignee')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const userTask = elementRegistry.get('UserTask_1');
        const originalValue = getAssignmentDefinition(userTask).get('assignee');

        await act(() => {
          selection.select(userTask);
        });
        const assigneeInput = domQuery('input[name=assignmentDefinitionAssignee]', container);
        changeInput(assigneeInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(assigneeInput.value).to.eql(originalValue);
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


});


// helper //////////////////

function getAssignmentDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:AssignmentDefinition')[0];
}
