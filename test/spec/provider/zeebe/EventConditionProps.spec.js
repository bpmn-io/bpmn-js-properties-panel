import TestContainer from 'mocha-test-container-support';

import {
  act,
  fireEvent
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import BpmnPropertiesPanel from 'src/render';
import CoreModule from 'bpmn-js/lib/core';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import SelectionModule from 'diagram-js/lib/features/selection';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './EventConditionProps.bpmn';

import { getConditionalFilter } from '../../../../src/provider/zeebe/properties/EventConditionProps';


describe('provider/zeebe - EventConditionProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    CoreModule,
    ModelingModule,
    SelectionModule,
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


  describe('zeebe:EventConditionProps#variableNames', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Event_2');

      // when
      await act(() => {
        selection.select(element);
      });

      const input = domQuery('input[name=variableNames]', container);

      // then
      expect(input).to.exist;
    }));


    // TODO(@jarekdanielak)
    it.skip('should not display on root level');


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const element = elementRegistry.get('Event_1');

      await act(() => {
        selection.select(element);
      });

      // when
      const input = domQuery('input[name=variableNames]', container);
      fireEvent.change(input, { target: { value: 'foo,baz' } });

      // then
      const conditionalFilter = getConditionalFilter(element);
      expect(conditionalFilter.variableNames).to.eql('foo,baz');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const element = elementRegistry.get('Event_2');

        await act(() => {
          selection.select(element);
        });

        const input = domQuery('input[name=variableNames]', container);
        fireEvent.change(input, { target: { value: 'baz,bax' } });

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql('foo,bar');
      })
    );

  });


  // TODO(@jarekdanielak): Add tests when this field is implemented as a multi-select
  // for now, it's the same as variableNames
  describe.skip('zeebe:EventConditionProps#variableEvents');

});