import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  clickInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';

import {
  getCompensateActivity,
  getCompensateEventDefinition
} from 'src/provider/bpmn/utils/EventDefinitionUtil';

import diagramXML from './CompensationProps.bpmn';


describe('provider/bpmn - CompensationProps', function() {

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

  describe('#waitForCompletion', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const compensationEvent = elementRegistry.get('CompensationStartEvent_1');

      await act(() => {
        selection.select(compensationEvent);
      });

      // when
      const input = domQuery('input[name=waitForCompletion]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const compensationEvent = elementRegistry.get('CompensationEndEvent_1');

      await act(() => {
        selection.select(compensationEvent);
      });

      // when
      const input = domQuery('input[name=waitForCompletion]', container);

      // then
      expect(input.checked).to.eql(
        getCompensateEventDefinition(compensationEvent).get('waitForCompletion')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const compensationEvent = elementRegistry.get('CompensationEndEvent_1');

      await act(() => {
        selection.select(compensationEvent);
      });

      // when
      const input = domQuery('input[name=waitForCompletion]', container);
      clickInput(input);

      // then
      expect(
        getCompensateEventDefinition(compensationEvent).get('waitForCompletion')
      ).to.be.false;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const compensationEvent = elementRegistry.get('CompensationEndEvent_1');

        const originalValue =
          getCompensateEventDefinition(compensationEvent).get('waitForCompletion');

        await act(() => {
          selection.select(compensationEvent);
        });
        const input = domQuery('input[name=waitForCompletion]', container);
        clickInput(input);

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.checked).to.eql(originalValue);
      })
    );

  });


  describe('#activityRef', function() {

    it('should NOT display',
      inject(async function(elementRegistry, selection) {

        // given
        const compensationEvent = elementRegistry.get('CompensationBoundaryEvent_1');

        // when
        await act(() => {
          selection.select(compensationEvent);
        });

        // then
        const select = domQuery('select[name=activityRef]', container);

        expect(select).to.not.exist;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const compensationEvent = elementRegistry.get('CompensationEndEvent_1');

      await act(() => {
        selection.select(compensationEvent);
      });

      // when
      const select = domQuery('select[name=activityRef]', container);

      // then
      expect(select.value).to.eql(getCompensateActivity(compensationEvent).get('id'));
    }));


    describe('select options', function() {

      it('should display options - throwing compensation event',
        inject(async function(elementRegistry, selection) {

          // given
          const compensationEvent = elementRegistry.get('CompensationEndEvent_1');

          await act(() => {
            selection.select(compensationEvent);
          });

          // when
          const select = domQuery('select[name=activityRef]', container);

          // then
          expect(asOptionNamesList(select)).to.eql([
            '<none>',
            '(id=Task_3)',
            'Call Activity 1 (id=CallActivity_1)',
            'Sub Process 1 (id=SubProcess_1)',
            'Task 1 (id=Task_1)',
            'Task 2 (id=Task_2)'
          ]);
        })
      );


      it('should display options - throwing compensation event in a sub process',
        inject(async function(elementRegistry, selection) {

          // given
          const compensationEvent = elementRegistry.get('CompensationThrowEvent_2');

          await act(() => {
            selection.select(compensationEvent);
          });

          // when
          const select = domQuery('select[name=activityRef]', container);

          // then
          expect(asOptionNamesList(select)).to.eql([
            '<none>',
            'Task 4 (id=Task_4)'
          ]);
        })
      );


      it('should display options - throwing compensation event in an event sub process',
        inject(async function(elementRegistry, selection) {

          // given
          const compensationEvent = elementRegistry.get('CompensationThrowEvent_1');

          await act(() => {
            selection.select(compensationEvent);
          });

          // when
          const select = domQuery('select[name=activityRef]', container);

          // then
          expect(asOptionNamesList(select)).to.eql([
            '<none>',
            '(id=Task_3)',
            'Call Activity 1 (id=CallActivity_1)',
            'Sub Process 1 (id=SubProcess_1)',
            'Task 1 (id=Task_1)',
            'Task 2 (id=Task_2)',
            'Task 5 (id=Task_5)'
          ]);
        })
      );


      it('should NOT include compensation sub process',
        inject(async function(elementRegistry, selection) {

          // given
          const compensationEvent = elementRegistry.get('CompensationEndEvent_1');

          await act(() => {
            selection.select(compensationEvent);
          });

          // when
          const select = domQuery('select[name=activityRef]', container);

          // then
          expect(asOptionNamesList(select)).to.not.include(
            'Sub Process 3 (id=SubProcess_3)'
          );
        })
      );

    });


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const compensationEvent = elementRegistry.get('CompensationEndEvent_1');

      await act(() => {
        selection.select(compensationEvent);
      });

      // when
      const select = domQuery('select[name=activityRef]', container);
      changeInput(select, 'Task_2');

      // then
      expect(getCompensateActivity(compensationEvent).get('id')).to.eql('Task_2');
    }));


    it('should remove activity reference', inject(async function(elementRegistry, selection) {

      // given
      const compensationEvent = elementRegistry.get('CompensationEndEvent_1');

      await act(() => {
        selection.select(compensationEvent);
      });

      // assume
      expect(getCompensateActivity(compensationEvent)).to.exist;

      // when
      const select = domQuery('select[name=activityRef]', container);
      changeInput(select, '');

      // then
      expect(getCompensateActivity(compensationEvent)).to.not.exist;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const compensateEvent = elementRegistry.get('CompensationEndEvent_1');
        const originalValue = getCompensateActivity(compensateEvent).get('id');

        await act(() => {
          selection.select(compensateEvent);
        });
        const select = domQuery('select[name=activityRef]', container);
        changeInput(select, 'Task_2');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(select.value).to.eql(originalValue);
      })
    );
  });

});


// helper //////////////////

function asOptionNamesList(select) {
  const names = [];
  const options = domQueryAll('option', select);

  options.forEach(o => names.push(o.label));

  return names;
}
