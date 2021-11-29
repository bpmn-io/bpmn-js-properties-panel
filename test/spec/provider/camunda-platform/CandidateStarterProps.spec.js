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

import processDiagramXML from './CandidateStarterProps-Process.bpmn';
import collaborationDiagramXML from './CandidateStarterProps-Collaboration.bpmn';


describe('provider/camunda-platform - CandidateStarterProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CamundaPlatformPropertiesProvider,
    CoreModule,
    ModelingModule,
    SelectionModule
  ];

  let container;


  describe('process', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(processDiagramXML, {
      modules: testModules,
      debounceInput: false
    }));


    describe('bpmn:Process#camunda:candidateStarterGroups', function() {

      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const process = elementRegistry.get('Process_1');

        await act(() => {
          selection.select(process);
        });

        // when
        const candidateStarterGroupsInput = domQuery('input[name=candidateStarterGroups]', container);

        // then
        expect(candidateStarterGroupsInput.value).to.eql(
          getBusinessObject(process).get('camunda:candidateStarterGroups'));
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const process = elementRegistry.get('Process_1');

        await act(() => {
          selection.select(process);
        });

        // when
        const candidateStarterGroupsInput = domQuery('input[name=candidateStarterGroups]', container);
        changeInput(candidateStarterGroupsInput, 'group3');

        // then
        expect(getBusinessObject(process).get('camunda:candidateStarterGroups'))
          .to.eql('group3');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const process = elementRegistry.get('Process_1');

          const originalValue = getBusinessObject(process).get('camunda:candidateStarterGroups');

          await act(() => {
            selection.select(process);
          });
          const candidateStarterGroupsInput = domQuery('input[name=candidateStarterGroups]', container);
          changeInput(candidateStarterGroupsInput, 'group4');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(candidateStarterGroupsInput.value).to.eql(originalValue);
        })
      );

    });


    describe('bpmn:Process#camunda:candidateStarterUsers', function() {

      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const process = elementRegistry.get('Process_1');

        await act(() => {
          selection.select(process);
        });

        // when
        const candidateStarterGroupsInput = domQuery('input[name=candidateStarterUsers]', container);

        // then
        expect(candidateStarterGroupsInput.value).to.eql(
          getBusinessObject(process).get('camunda:candidateStarterUsers'));
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const process = elementRegistry.get('Process_1');

        await act(() => {
          selection.select(process);
        });

        // when
        const candidateStarterGroupsInput = domQuery('input[name=candidateStarterUsers]', container);
        changeInput(candidateStarterGroupsInput, 'user3');

        // then
        expect(getBusinessObject(process).get('camunda:candidateStarterUsers'))
          .to.eql('user3');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const process = elementRegistry.get('Process_1');

          const originalValue = getBusinessObject(process).get('camunda:candidateStarterUsers');

          await act(() => {
            selection.select(process);
          });
          const candidateStarterGroupsInput = domQuery('input[name=candidateStarterUsers]', container);
          changeInput(candidateStarterGroupsInput, 'user4');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(candidateStarterGroupsInput.value).to.eql(originalValue);
        })
      );

    });

  });


  describe('collaboration', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(collaborationDiagramXML, {
      modules: testModules,
      debounceInput: false
    }));


    describe('bpmn:Process#camunda:candidateStarterGroups', function() {

      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const candidateStarterGroupsInput = domQuery('input[name=candidateStarterGroups]', container);

        // then
        expect(candidateStarterGroupsInput.value).to.eql(
          getProcess(participant).get('camunda:candidateStarterGroups'));
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const candidateStarterGroupsInput = domQuery('input[name=candidateStarterGroups]', container);
        changeInput(candidateStarterGroupsInput, 'group3');

        // then
        expect(getProcess(participant).get('camunda:candidateStarterGroups'))
          .to.eql('group3');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const participant = elementRegistry.get('Participant_1');

          const originalValue = getProcess(participant).get('camunda:candidateStarterGroups');

          await act(() => {
            selection.select(participant);
          });
          const candidateStarterGroupsInput = domQuery('input[name=candidateStarterGroups]', container);
          changeInput(candidateStarterGroupsInput, 'group4');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(candidateStarterGroupsInput.value).to.eql(originalValue);
        })
      );

    });


    describe('bpmn:Process#camunda:candidateStarterUsers', function() {

      it('should display', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const candidateStarterGroupsInput = domQuery('input[name=candidateStarterUsers]', container);

        // then
        expect(candidateStarterGroupsInput.value).to.eql(
          getProcess(participant).get('camunda:candidateStarterUsers'));
      }));


      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const candidateStarterGroupsInput = domQuery('input[name=candidateStarterUsers]', container);
        changeInput(candidateStarterGroupsInput, 'user3');

        // then
        expect(getProcess(participant).get('camunda:candidateStarterUsers'))
          .to.eql('user3');
      }));


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const participant = elementRegistry.get('Participant_1');

          const originalValue = getProcess(participant).get('camunda:candidateStarterUsers');

          await act(() => {
            selection.select(participant);
          });
          const candidateStarterGroupsInput = domQuery('input[name=candidateStarterUsers]', container);
          changeInput(candidateStarterGroupsInput, 'user4');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(candidateStarterGroupsInput.value).to.eql(originalValue);
        })
      );

    });

  });

});


// helper //////////////////

function getProcess(participant) {
  return getBusinessObject(participant).get('processRef');
}
