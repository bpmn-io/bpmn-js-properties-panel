import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  inject,
  clickInput
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

import executableDiagramXML from './ExecutableProps.bpmn';
import participantsDiagramXML from './ExecutableProps.participants.bpmn';


describe('provider/bpmn - ExecutableProps', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider
  ];

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  describe('bpmn:Process#isExecutable', function() {

    beforeEach(bootstrapPropertiesPanel(executableDiagramXML, {
      modules: testModules,
      debounceInput: false
    }));

    it('should NOT be displayed for start event',
      inject(async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1');

        // when
        await act(() => {
          selection.select(startEvent);
        });

        // then
        const executableInput = domQuery('input[name=isExecutable]', container);

        expect(executableInput).to.be.null;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const process = elementRegistry.get('Process_1');

      await act(() => {
        selection.select(process);
      });

      // when
      const executableIput = domQuery('input[name=isExecutable]', container);

      // then
      expect(executableIput.checked).to.eql(getBusinessObject(process).get('isExecutable'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const process = elementRegistry.get('Process_1');

      await act(() => {
        selection.select(process);
      });

      // when
      const executableInput = domQuery('input[name=isExecutable]', container);
      clickInput(executableInput);

      // then
      expect(getBusinessObject(process).get('isExecutable')).to.be.false;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const process = elementRegistry.get('Process_1');
        const originalValue = getBusinessObject(process).get('isExecutable');

        await act(() => {
          selection.select(process);
        });
        const executableInput = domQuery('input[name=isExecutable]', container);
        clickInput(executableInput);

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(executableInput.checked).to.eql(originalValue);
      })
    );
  });


  describe('bpmn:Participant#processRef.isExecutable', function() {

    beforeEach(bootstrapPropertiesPanel(participantsDiagramXML, {
      modules: testModules,
      debounceInput: false
    }));

    it('should NOT be displayed for empty participant',
      inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_empty');

        // when
        await act(() => {
          selection.select(participant);
        });

        // then
        const executableInput = domQuery('input[name=isExecutable]', container);

        expect(executableInput).to.be.null;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const executableInput = domQuery('input[name=isExecutable]', container);

      // then
      expect(executableInput.checked).to.eql(getProcess(participant).get('isExecutable'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const executableInput = domQuery('input[name=isExecutable]', container);
      clickInput(executableInput);

      // then
      expect(getProcess(participant).get('isExecutable')).to.be.false;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const participant = elementRegistry.get('Participant_1');
        const originalValue = getProcess(participant).get('isExecutable');

        await act(() => {
          selection.select(participant);
        });
        const executableInput = domQuery('input[name=isExecutable]', container);
        clickInput(executableInput);

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(executableInput.checked).to.eql(originalValue);
      })
    );

  });

});


// helper //////////////////

function getProcess(participant) {
  return getBusinessObject(participant).get('processRef');
}
