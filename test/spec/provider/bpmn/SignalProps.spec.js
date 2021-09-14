import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  EMPTY_OPTION,
  CREATE_NEW_OPTION
} from '../../../../src/provider/bpmn/properties/SignalProps';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';

import {
  getSignal
} from 'src/provider/bpmn/utils/EventDefinitionUtil';

import diagramXML from './SignalProps.bpmn';


describe('provider/bpmn - SignalProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CoreModule,
    ModelingModule,
    SelectionModule
  ];

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    debounceInput: false
  }));


  describe('#signalRef', function() {

    it('should NOT be displayed for normal elements',
      inject(async function(elementRegistry, selection) {

        // given
        const plainElements = [
          elementRegistry.get('StartEvent_1'),
          elementRegistry.get('BoundaryEvent_1'),
          elementRegistry.get('EndEvent_1'),
          elementRegistry.get('IntermediateThrowEvent_1')
        ];

        plainElements.forEach(async (ele) => {

          // when
          await act(() => {
            selection.select(ele);
          });

          // then
          const signalRefSelect = domQuery('select[name=signalRef]', container);
          expect(signalRefSelect).to.be.null;
        });

      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const signalElements = [
        elementRegistry.get('SignalStartEvent_1'),
        elementRegistry.get('SignalBoundaryEvent_1'),
        elementRegistry.get('SignalEndEvent_1'),
        elementRegistry.get('SignalThrowEvent_1'),
        elementRegistry.get('SignalCatchEvent_1')
      ];

      signalElements.forEach(async (ele) => {

        // when
        await act(() => {
          selection.select(ele);
        });

        // then
        const signalRefSelect = domQuery('select[name=signalRef]', container);
        expect(signalRefSelect.value).to.eql(getSignal(ele).get('id'));
      });
    }));


    it('should display select options in correct order', inject(async function(elementRegistry, selection) {

      // given
      const signalEvent = elementRegistry.get('SignalStartEvent_1');

      await act(() => {
        selection.select(signalEvent);
      });

      // when
      const signalRefSelect = domQuery('select[name=signalRef]', container);

      // then
      expect(asOptionNamesList(signalRefSelect)).to.eql([
        '<none>',
        'Create new ...',
        'signal1_name',
        'signal2_name',
        'signal3_name'
      ]);
    }));


    it('should create new signal', inject(async function(elementRegistry, selection) {

      // given
      const signalEvent = elementRegistry.get('SignalStartEvent_2');

      await act(() => {
        selection.select(signalEvent);
      });

      // assume
      expect(getSignal(signalEvent)).to.not.exist;

      // when
      const signalRefSelect = domQuery('select[name=signalRef]', container);
      changeInput(signalRefSelect, CREATE_NEW_OPTION);

      // then
      expect(getSignal(signalEvent)).to.exist;
    }));


    it('should remove signal reference', inject(async function(elementRegistry, selection) {

      // given
      const signalEvent = elementRegistry.get('SignalStartEvent_1');

      await act(() => {
        selection.select(signalEvent);
      });

      // assume
      expect(getSignal(signalEvent)).to.exist;

      // when
      const signalRefSelect = domQuery('select[name=signalRef]', container);
      changeInput(signalRefSelect, '');

      // then
      expect(getSignal(signalEvent)).to.not.exist;
    }));


    describe('update', function() {

      describe('<none> to signal', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const signalEvent = elementRegistry.get('SignalStartEvent_2');

          await act(() => {
            selection.select(signalEvent);
          });

          // when
          const signalRefSelect = domQuery('select[name=signalRef]', container);
          changeInput(signalRefSelect, 'signal2');

          // then
          expect(getSignal(signalEvent).get('id')).to.eql('signal2');

          expect(signalRefSelect.value).to.eql('signal2');
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const signalEvent = elementRegistry.get('SignalStartEvent_2');

            await act(() => {
              selection.select(signalEvent);
            });
            const signalRefSelect = domQuery('select[name=signalRef]', container);
            changeInput(signalRefSelect, 'signal2');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(getSignal(signalEvent)).not.to.exist;

            expect(signalRefSelect.value).to.eql(EMPTY_OPTION);
          })
        );

      });


      describe('signal to signal', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const signalEvent = elementRegistry.get('SignalStartEvent_1');

          await act(() => {
            selection.select(signalEvent);
          });

          // when
          const signalRefSelect = domQuery('select[name=signalRef]', container);
          changeInput(signalRefSelect, 'signal2');

          // then
          expect(getSignal(signalEvent).get('id')).to.eql('signal2');

          expect(signalRefSelect.value).to.eql('signal2');
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const signalEvent = elementRegistry.get('SignalStartEvent_1');
            const originalValue = getSignal(signalEvent).get('id');

            await act(() => {
              selection.select(signalEvent);
            });
            const signalRefSelect = domQuery('select[name=signalRef]', container);
            changeInput(signalRefSelect, 'signal2');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(getSignal(signalEvent).get('id')).to.eql(originalValue);

            expect(signalRefSelect.value).to.eql(originalValue);
          })
        );

      });

    });

  });

  describe('#signalRef.name', function() {

    it('should NOT be displayed for normal elements',
      inject(async function(elementRegistry, selection) {

        // given
        const plainElements = [
          elementRegistry.get('StartEvent_1'),
          elementRegistry.get('BoundaryEvent_1'),
          elementRegistry.get('EndEvent_1'),
          elementRegistry.get('IntermediateThrowEvent_1')
        ];

        plainElements.forEach(async (ele) => {

          // when
          await act(() => {
            selection.select(ele);
          });

          // then
          const signalNameInput = domQuery('input[name=signalName]', container);

          expect(signalNameInput).to.be.null;
        });
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const signalElements = [
        elementRegistry.get('SignalStartEvent_1'),
        elementRegistry.get('SignalBoundaryEvent_1'),
        elementRegistry.get('SignalEndEvent_1'),
        elementRegistry.get('SignalThrowEvent_1'),
        elementRegistry.get('SignalCatchEvent_1')
      ];

      signalElements.forEach(async (ele) => {
        await act(() => {
          selection.select(ele);
        });

        // when
        const signalNameInput = domQuery('input[name=signalName]', container);

        // then
        expect(signalNameInput.value).to.eql(getSignal(ele).get('name'));
      });
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const signalEvent = elementRegistry.get('SignalStartEvent_1');

      await act(() => {
        selection.select(signalEvent);
      });

      // when
      const signalNameInput = domQuery('input[name=signalName]', container);
      changeInput(signalNameInput, 'newValue');

      // then
      expect(getSignal(signalEvent).get('name')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const signalEvent = elementRegistry.get('SignalStartEvent_1');
        const originalValue = getSignal(signalEvent).get('name');

        await act(() => {
          selection.select(signalEvent);
        });
        const signalNameInput = domQuery('input[name=signalName]', container);
        changeInput(signalNameInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(signalNameInput.value).to.eql(originalValue);
      })
    );


    it('should not blow up on empty signal name', inject(async function(elementRegistry, selection) {

      // given
      const signalEvent = elementRegistry.get('SignalStartEvent_1');

      await act(() => {
        selection.select(signalEvent);
      });

      // when
      const signalNameInput = domQuery('input[name=signalName]', container);
      await act(() => {
        changeInput(signalNameInput, '');
      });

      // then
      expect(getSignal(signalEvent).get('name')).to.eql(undefined);
    }));

  });

});

// helper //////////////////////

function asOptionNamesList(select) {
  const names = [];
  const options = domQueryAll('option', select);

  options.forEach(o => names.push(o.label));

  return names;
}
