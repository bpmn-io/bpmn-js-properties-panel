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
  getError,
  getErrorEventDefinition
} from 'src/provider/bpmn/utils/EventDefinitionUtil';

import diagramXML from './ErrorProps.bpmn';


describe('provider/camunda-platform - ErrorProps', function() {

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

  describe('bpmn:StartEvent#errorRef.camunda:errorMessage', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const input = domQuery('input[name=errorMessage]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should NOT display - no errorRef', inject(async function(elementRegistry, selection) {

      // given
      const boundaryEvent = elementRegistry.get('ErrorBoundaryEvent_noError');

      await act(() => {
        selection.select(boundaryEvent);
      });

      // when
      const input = domQuery('input[name=errorMessage]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('ErrorStartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const input = domQuery('input[name=errorMessage]', container);

      // then
      expect(input.value).to.eql(
        getError(startEvent).get('camunda:errorMessage')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('ErrorStartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const input = domQuery('input[name=errorMessage]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getError(startEvent).get('camunda:errorMessage')
      ).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const startEvent = elementRegistry.get('ErrorStartEvent_1');

        const originalValue = getError(startEvent).get('camunda:errorMessage');

        await act(() => {
          selection.select(startEvent);
        });
        const input = domQuery('input[name=errorMessage]', container);
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


  describe('bpmn:StartEvent#errorCodeVariable', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const endEvent = elementRegistry.get('ErrorEndEvent_1');

      await act(() => {
        selection.select(endEvent);
      });

      // when
      const input = domQuery('input[name=errorCodeVariable]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('ErrorStartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const input = domQuery('input[name=errorCodeVariable]', container);

      // then
      expect(input.value).to.eql(
        getErrorEventDefinition(startEvent).get('camunda:errorCodeVariable')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('ErrorStartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const input = domQuery('input[name=errorCodeVariable]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getErrorEventDefinition(startEvent).get('camunda:errorCodeVariable')
      ).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const startEvent = elementRegistry.get('ErrorStartEvent_1');

        const originalValue = getErrorEventDefinition(startEvent).get('camunda:errorCodeVariable');

        await act(() => {
          selection.select(startEvent);
        });
        const input = domQuery('input[name=errorCodeVariable]', container);
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


  describe('bpmn:StartEvent#errorMessageVariable', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const endEvent = elementRegistry.get('ErrorEndEvent_1');

      await act(() => {
        selection.select(endEvent);
      });

      // when
      const input = domQuery('input[name=errorMessageVariable]', container);

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('ErrorStartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const input = domQuery('input[name=errorMessageVariable]', container);

      // then
      expect(input.value).to.eql(
        getErrorEventDefinition(startEvent).get('camunda:errorMessageVariable')
      );
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('ErrorStartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const input = domQuery('input[name=errorMessageVariable]', container);
      changeInput(input, 'newValue');

      // then
      expect(
        getErrorEventDefinition(startEvent).get('camunda:errorMessageVariable')
      ).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const startEvent = elementRegistry.get('ErrorStartEvent_1');

        const originalValue = getErrorEventDefinition(startEvent).get('camunda:errorMessageVariable');

        await act(() => {
          selection.select(startEvent);
        });
        const input = domQuery('input[name=errorMessageVariable]', container);
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
