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

import processDiagramXML from './VersionTagProps-process.bpmn';
import collaborationDiagramXML from './VersionTagProps-collaboration.bpmn';


describe('provider/camunda-platform - VersionTagProps', function() {

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


  describe('bpmn:Process#versionTag', function() {

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
      const versionTagInput = domQuery('input[name=versionTag]', container);

      // then
      expect(versionTagInput).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const process = elementRegistry.get('Process_1');

      await act(() => {
        selection.select(process);
      });

      // when
      const versionTagInput = domQuery('input[name=versionTag]', container);

      // then
      expect(versionTagInput.value).to.eql(
        getBusinessObject(process).get('camunda:versionTag'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const process = elementRegistry.get('Process_1');

      await act(() => {
        selection.select(process);
      });

      // when
      const versionTagInput = domQuery('input[name=versionTag]', container);
      changeInput(versionTagInput, 'v0.3.0');

      // then
      expect(getBusinessObject(process).get('camunda:versionTag'))
        .to.eql('v0.3.0');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const process = elementRegistry.get('Process_1');

        const originalValue = getBusinessObject(process).get('camunda:versionTag');

        await act(() => {
          selection.select(process);
        });
        const versionTagInput = domQuery('input[name=versionTag]', container);
        changeInput(versionTagInput, 'v0.3.0');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(versionTagInput.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:Participant#processRef.camunda:versionTag', function() {

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
      const participant = elementRegistry.get('Participant_empty');

      await act(() => {
        selection.select(participant);
      });

      // when
      const versionTagInput = domQuery('input[name=versionTag]', container);

      // then
      expect(versionTagInput).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const versionTagInput = domQuery('input[name=versionTag]', container);

      // then
      expect(versionTagInput.value).to.eql(
        getProcess(participant).get('camunda:versionTag'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const versionTagInput = domQuery('input[name=versionTag]', container);
      changeInput(versionTagInput, 'v0.3.0');

      // then
      expect(getProcess(participant).get('camunda:versionTag'))
        .to.eql('v0.3.0');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const participant = elementRegistry.get('Participant_1');

        const originalValue = getProcess(participant).get('camunda:versionTag');

        await act(() => {
          selection.select(participant);
        });
        const versionTagInput = domQuery('input[name=versionTag]', container);
        changeInput(versionTagInput, 'v0.3.0');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(versionTagInput.value).to.eql(originalValue);
      })
    );

  });

});


// helper //////////////////

function getProcess(participant) {
  return getBusinessObject(participant).get('processRef');
}