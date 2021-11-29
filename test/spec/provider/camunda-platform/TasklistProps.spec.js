import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  clickInput,
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

import processDiagramXML from './TasklistProps-process.bpmn';
import collaborationDiagramXML from './TasklistProps-collaboration.bpmn';


describe('provider/camunda-platform - TasklistProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CamundaPlatformPropertiesProvider,
    CoreModule,
    ModelingModule,
    SelectionModule
  ];

  let container;

  const moddleExtensions = {
    camunda: camundaModdleExtensions
  };


  describe('bpmn:Process#camunda:isStartableInTasklist', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(processDiagramXML, {
      modules: testModules,
      moddleExtensions
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const startableInput = domQuery('input[name=isStartableInTasklist]', container);

      // then
      expect(startableInput).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const process = elementRegistry.get('Process_1');

      await act(() => {
        selection.select(process);
      });

      // when
      const startableInput = domQuery('input[name=isStartableInTasklist]', container);

      // then
      expect(startableInput.checked).to.eql(
        getBusinessObject(process).get('camunda:isStartableInTasklist'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const process = elementRegistry.get('Process_1');

      await act(() => {
        selection.select(process);
      });

      // when
      const startableInput = domQuery('input[name=isStartableInTasklist]', container);
      clickInput(startableInput);

      // then
      expect(getBusinessObject(process).get('camunda:isStartableInTasklist')).to.be.true;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const process = elementRegistry.get('Process_1');

        const originalValue = getBusinessObject(process).get('camunda:isStartableInTasklist');

        await act(() => {
          selection.select(process);
        });
        const startableInput = domQuery('input[name=isStartableInTasklist]', container);
        clickInput(startableInput);

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(startableInput.checked).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:Participant#processRef.camunda:isStartableInTasklist', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(collaborationDiagramXML, {
      modules: testModules,
      moddleExtensions
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_empty');

      await act(() => {
        selection.select(participant);
      });

      // when
      const startableInput = domQuery('input[name=isStartableInTasklist]', container);

      // then
      expect(startableInput).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const startableInput = domQuery('input[name=isStartableInTasklist]', container);

      // then
      expect(startableInput.checked).to.eql(
        getProcess(participant).get('camunda:isStartableInTasklist'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const startableInput = domQuery('input[name=isStartableInTasklist]', container);
      clickInput(startableInput);

      // then
      expect(getProcess(participant).get('camunda:isStartableInTasklist')).to.be.true;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const participant = elementRegistry.get('Participant_1');

        const originalValue = getProcess(participant).get('camunda:isStartableInTasklist');

        await act(() => {
          selection.select(participant);
        });
        const startableInput = domQuery('input[name=isStartableInTasklist]', container);
        clickInput(startableInput);

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(startableInput.checked).to.eql(originalValue);
      })
    );

  });

});


// helper //////////////////

function getProcess(participant) {
  return getBusinessObject(participant).get('processRef');
}