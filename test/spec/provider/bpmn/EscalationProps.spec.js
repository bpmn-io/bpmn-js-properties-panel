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

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';

import {
  getEscalation
} from 'src/provider/bpmn/utils/EventDefinitionUtil';

import diagramXML from './EscalationProps.bpmn';


describe('provider/bpmn - EscalationProps', function() {

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


  describe('#escalationRef', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const select = domQuery('select[name=escalationRef]', container);

      // then
      expect(select).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const escalationElements = [
        elementRegistry.get('EscalationStartEvent_1'),
        elementRegistry.get('EscalationBoundaryEvent_1'),
        elementRegistry.get('EscalationEndEvent_1'),
        elementRegistry.get('EscalationIntermediateEvent_1')
      ];

      escalationElements.forEach(async (element) => {

        // when
        await act(() => {
          selection.select(element);
        });

        // then
        const select = domQuery('select[name=escalationRef]', container);
        expect(select.value).to.eql(getEscalation(element).get('id'));
      });

    }));


    it('should display select options in correct order', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('EscalationStartEvent_1');

      await act(() => {
        selection.select(escalationEvent);
      });

      // when
      const select = domQuery('select[name=escalationRef]', container);

      // then
      expect(asOptionNamesList(select)).to.eql([
        '<none>',
        'Create new ...',
        'Escalation_1',
        'Escalation_2',
        'Escalation_3'
      ]);
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('EscalationStartEvent_1');

      await act(() => {
        selection.select(escalationEvent);
      });

      // when
      const select = domQuery('select[name=escalationRef]', container);
      changeInput(select, 'Escalation_2');

      // then
      expect(getEscalation(escalationEvent).get('id')).to.eql('Escalation_2');
    }));


    it('should create new escalation', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('EscalationBoundaryEvent_1');

      await act(() => {
        selection.select(escalationEvent);
      });

      // assume
      expect(getEscalation(escalationEvent)).to.not.exist;

      // when
      const select = domQuery('select[name=escalationRef]', container);
      changeInput(select, 'create-new');

      // then
      expect(getEscalation(escalationEvent)).to.exist;
    }));


    it('should remove escalation reference', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('EscalationStartEvent_1');

      await act(() => {
        selection.select(escalationEvent);
      });

      // assume
      expect(getEscalation(escalationEvent)).to.exist;

      // when
      const select = domQuery('select[name=escalationRef]', container);
      changeInput(select, '');

      // then
      expect(getEscalation(escalationEvent)).to.not.exist;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const escalationEvent = elementRegistry.get('EscalationStartEvent_1');
        const originalValue = getEscalation(escalationEvent).get('id');

        await act(() => {
          selection.select(escalationEvent);
        });
        const select = domQuery('select[name=escalationRef]', container);
        changeInput(select, 'Escalation_2');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(select.value).to.eql(originalValue);
      })
    );

  });


  describe('#escalationRef.name', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('EscalationBoundaryEvent_1');

      await act(() => {
        selection.select(escalationEvent);
      });

      // when
      const input = domQuery('input[name=escalationName]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('EscalationStartEvent_1');

      await act(() => {
        selection.select(escalationEvent);
      });

      // when
      const input = domQuery('input[name=escalationName]', container);

      // then
      expect(input.value).to.eql(getEscalation(escalationEvent).get('name'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('EscalationStartEvent_1');

      await act(() => {
        selection.select(escalationEvent);
      });

      // when
      const input = domQuery('input[name=escalationName]', container);
      changeInput(input, 'newValue');

      // then
      expect(getEscalation(escalationEvent).get('name')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const escalationEvent = elementRegistry.get('EscalationStartEvent_1');
        const originalValue = getEscalation(escalationEvent).get('name');

        await act(() => {
          selection.select(escalationEvent);
        });
        const input = domQuery('input[name=escalationName]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );


    it('should NOT blow up on empty escalation name', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('EscalationStartEvent_1');

      await act(() => {
        selection.select(escalationEvent);
      });

      // when
      const input = domQuery('input[name=escalationName]', container);
      await act(() => {
        changeInput(input, '');
      });

      // then
      expect(getEscalation(escalationEvent).get('name')).to.eql(undefined);
    }));

  });


  describe('#escalationRef.escalationCode', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('EscalationBoundaryEvent_1');

      await act(() => {
        selection.select(escalationEvent);
      });

      // when
      const input = domQuery('input[name=escalationCode]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('EscalationStartEvent_1');

      await act(() => {
        selection.select(escalationEvent);
      });

      // when
      const input = domQuery('input[name=escalationCode]', container);

      // then
      expect(input.value).to.eql(getEscalation(escalationEvent).get('escalationCode'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('EscalationStartEvent_1');

      await act(() => {
        selection.select(escalationEvent);
      });

      // when
      const input = domQuery('input[name=escalationCode]', container);
      changeInput(input, 'newValue');

      // then
      expect(getEscalation(escalationEvent).get('escalationCode')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const escalationEvent = elementRegistry.get('EscalationStartEvent_1');
        const originalValue = getEscalation(escalationEvent).get('escalationCode');

        await act(() => {
          selection.select(escalationEvent);
        });
        const input = domQuery('input[name=escalationCode]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );


    it('should NOT blow up on empty escalationCode', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('EscalationStartEvent_1');

      await act(() => {
        selection.select(escalationEvent);
      });

      // when
      const input = domQuery('input[name=escalationCode]', container);
      await act(() => {
        changeInput(input, '');
      });

      // then
      expect(getEscalation(escalationEvent).get('escalationCode')).to.eql(undefined);
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
