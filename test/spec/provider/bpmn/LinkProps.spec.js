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

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';

import {
  getLinkEventDefinition
} from 'src/provider/bpmn/utils/EventDefinitionUtil';

import diagramXML from './LinkProps.bpmn';


describe('provider/bpmn - LinkProps', function() {

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

  describe('bpmn:IntermediateCatchEvent#linkEventDefinition.name', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const input = domQuery('input[name=linkName]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const linkEvent = elementRegistry.get('LinkEvent_1');

      await act(() => {
        selection.select(linkEvent);
      });

      // when
      const input = domQuery('input[name=linkName]', container);

      // then
      expect(input.value).to.eql(
        getLinkEventDefinition(linkEvent).get('name')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const linkEvent = elementRegistry.get('LinkEvent_1');

      await act(() => {
        selection.select(linkEvent);
      });

      // when
      const input = domQuery('input[name=linkName]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getLinkEventDefinition(linkEvent).get('name')
      ).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const linkEvent = elementRegistry.get('LinkEvent_1');

        const originalValue = getLinkEventDefinition(linkEvent).get('name');

        await act(() => {
          selection.select(linkEvent);
        });
        const input = domQuery('input[name=linkName]', container);
        changeInput(input, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(input.value).to.eql(originalValue);
      })
    );

  });

});
