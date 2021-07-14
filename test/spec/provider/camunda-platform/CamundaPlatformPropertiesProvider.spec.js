import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
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
  });
});


// helpers /////////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}
