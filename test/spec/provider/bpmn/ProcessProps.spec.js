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

import diagramXML from './ProcessProps.bpmn';


describe('provider/bpmn - ProcessProps', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider
  ];

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    debounceInput: false
  }));


  describe('bpmn:Participant#processRef.name', function() {

    it('should NOT be displayed for empty participant',
      inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_Empty');

        // when
        await act(() => {
          selection.select(participant);
        });

        // then
        const processNameInput = domQuery('input[name=processName]', container);

        expect(processNameInput).to.be.null;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const processNameInput = domQuery('input[name=processName]', container);

      // then
      expect(processNameInput.value).to.eql(getProcess(participant).get('name'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const processNameInput = domQuery('input[name=processName]', container);
      changeInput(processNameInput, 'newValue');

      // then
      expect(getProcess(participant).get('name')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const participant = elementRegistry.get('Participant_1');
        const originalValue = getProcess(participant).get('name');

        await act(() => {
          selection.select(participant);
        });
        const processNameInput = domQuery('input[name=processName]', container);
        changeInput(processNameInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(processNameInput.value).to.eql(originalValue);
      })
    );
  });


  describe('bpmn:Participant#processRef.id', function() {

    it('should NOT be displayed for empty participant',
      inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_Empty');

        // when
        await act(() => {
          selection.select(participant);
        });

        // then
        const processIdInput = domQuery('input[name=processId]', container);

        expect(processIdInput).to.be.null;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const processIdInput = domQuery('input[name=processId]', container);

      // then
      expect(processIdInput.value).to.eql(getProcess(participant).get('id'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const processIdInput = domQuery('input[name=processId]', container);
      changeInput(processIdInput, 'newValue');

      // then
      expect(getProcess(participant).get('id')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const participant = elementRegistry.get('Participant_1');
        const originalValue = getProcess(participant).get('id');

        await act(() => {
          selection.select(participant);
        });
        const processIdInput = domQuery('input[name=processId]', container);
        changeInput(processIdInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(processIdInput.value).to.eql(originalValue);
      })
    );


    describe('validation', function() {

      it('should set invalid', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const processIdInput = domQuery('input[name=processId]', container);
        changeInput(processIdInput, '');
        await act(() => {});

        // then
        const error = domQuery('.bio-properties-panel-error', container);
        expect(error).to.exist;
      }));


      it('should NOT remove id', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const processIdInput = domQuery('input[name=processId]', container);
        changeInput(processIdInput, '');

        // then
        expect(getProcess(participant).get('id')).to.eql('Process_2');
      }));


      it('should NOT set existing id', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const processIdInput = domQuery('input[name=processId]', container);
        changeInput(processIdInput, 'Process_1');

        // then
        expect(getProcess(participant).get('id')).to.eql('Process_2');
      }));


      it('should NOT set with spaces', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const processIdInput = domQuery('input[name=processId]', container);
        changeInput(processIdInput, 'foo bar');

        // then
        expect(getProcess(participant).get('id')).to.eql('Process_2');
      }));


      it('should NOT set invalid QName', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const processIdInput = domQuery('input[name=processId]', container);
        changeInput(processIdInput, '::foo');

        // then
        expect(getProcess(participant).get('id')).to.eql('Process_2');
      }));


      it('should NOT set prefix', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const processIdInput = domQuery('input[name=processId]', container);
        changeInput(processIdInput, 'foo:Process_2');

        // then
        expect(getProcess(participant).get('id')).to.eql('Process_2');
      }));


      it('should NOT set invalid HTML characters', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const processIdInput = domQuery('input[name=processId]', container);
        changeInput(processIdInput, '<foo>');

        // then
        expect(getProcess(participant).get('id')).to.eql('Process_2');
      }));


      it('should NOT set expression', inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        // when
        const processIdInput = domQuery('input[name=processId]', container);
        changeInput(processIdInput, '${foo}');

        // then
        expect(getProcess(participant).get('id')).to.eql('Process_2');
      }));

    });

  });

});


// helper //////////////////

function getProcess(participant) {
  return getBusinessObject(participant).get('processRef');
}
