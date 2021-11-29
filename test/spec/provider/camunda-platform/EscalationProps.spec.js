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
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import {
  getEscalationEventDefinition
} from 'src/provider/bpmn/utils/EventDefinitionUtil';

import diagramXML from './EscalationProps.bpmn';


describe('provider/camunda-platform - EscalationProps', function() {

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

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    moddleExtensions,
    debounceInput: false
  }));


  describe('#escalationCodeVariable', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const input = domQuery('input[name=escalationCodeVariable]', container);

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
      const input = domQuery('input[name=escalationCodeVariable]', container);

      // then
      expect(input.value).to.eql(
        getEscalationEventDefinition(escalationEvent).get('camunda:escalationCodeVariable')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('EscalationStartEvent_1');

      await act(() => {
        selection.select(escalationEvent);
      });

      // when
      const input = domQuery('input[name=escalationCodeVariable]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getEscalationEventDefinition(escalationEvent).get('camunda:escalationCodeVariable')
      ).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const escalationEvent = elementRegistry.get('EscalationStartEvent_1');

        const originalValue =
          getEscalationEventDefinition(escalationEvent).get('camunda:escalationCodeVariable');

        await act(() => {
          selection.select(escalationEvent);
        });
        const input = domQuery('input[name=escalationCodeVariable]', container);
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
