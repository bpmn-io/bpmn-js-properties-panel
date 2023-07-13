import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

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

// these properties can't live without the generic BPMN error props
import BpmnPropertiesProvider from 'src/provider/bpmn';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import TooltipProvider from 'src/contextProvider/zeebe/TooltipProvider';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  getError
} from 'src/provider/bpmn/utils/EventDefinitionUtil';

import diagramXML from './ErrorProps.bpmn';
import { setEditorValue } from '../../../TestHelper';


describe('provider/zeebe - ErrorProps', function() {

  const testModules = [
    CoreModule,
    SelectionModule,
    ModelingModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
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
    propertiesPanel: {
      tooltip: TooltipProvider
    },
    debounceInput: false
  }));


  describe('bpmn:Error#errorCode', function() {

    it('should display (text)', inject(async function(elementRegistry, selection) {

      // given
      const errorEvent = elementRegistry.get('ErrorEventNoExpression');

      await act(() => {
        selection.select(errorEvent);
      });

      // when
      const errorCodeInput = domQuery('input[name=errorCode]', container);

      // then
      expect(errorCodeInput).to.exist;
    }));


    it('should display (FEEL expression)', inject(async function(elementRegistry, selection) {

      // given
      const errorEvent = elementRegistry.get('ErrorThrowEventExpression');

      await act(() => {
        selection.select(errorEvent);
      });

      // when
      const errorCodeInput = domQuery('[name=errorCode]', container);

      // then
      expect(errorCodeInput).to.exist;
    }));


    it('should display expression-like as text (catch event)', inject(async function(elementRegistry, selection) {

      // given
      const errorEvent = elementRegistry.get('ErrorEventWithExpression');

      await act(() => {
        selection.select(errorEvent);
      });

      // when
      const errorCodeInput = domQuery('input[name=errorCode]', container);

      // then
      expect(errorCodeInput).to.exist;
    }));


    it('should display FEEL icon for throw event', inject(async function(elementRegistry, selection) {

      // given
      const errorEvent = elementRegistry.get('ErrorThrowEventExpression');

      await act(() => {
        selection.select(errorEvent);
      });

      // when
      const errorCodeIcon = domQuery('[data-entry-id="errorCode"] .bio-properties-panel-feel-icon', container);

      // then
      expect(errorCodeIcon).to.exist;
    }));


    it('should NOT display FEEL icon for catch event', inject(async function(elementRegistry, selection) {

      // given
      const errorEvent = elementRegistry.get('ErrorEventWithExpression');

      await act(() => {
        selection.select(errorEvent);
      });

      // when
      const errorCodeIcon = domQuery('[data-entry-id="errorCode"] .bio-properties-panel-feel-icon', container);

      // then
      expect(errorCodeIcon).not.to.exist;
    }));


    it('should update (text)', inject(async function(elementRegistry, selection) {

      // given
      const errorEvent = elementRegistry.get('ErrorEventNoExpression');

      await act(() => {
        selection.select(errorEvent);
      });

      // when
      const errorCodeInput = domQuery('input[name=errorCode]', container);
      await act(() => {
        changeInput(errorCodeInput, 'newValue');
      });

      // then
      expect(getError(errorEvent).get('errorCode')).to.eql('newValue');
    }));


    it('should update (FEEL expression)', inject(async function(elementRegistry, selection) {

      // given
      const errorEvent = elementRegistry.get('ErrorThrowEventExpression');

      await act(() => {
        selection.select(errorEvent);
      });

      // when
      const errorCodeInput = domQuery('[name=errorCode] [role=textbox]', container);
      await setEditorValue(errorCodeInput, 'newValue');

      // then
      expect(getError(errorEvent).get('errorCode')).to.eql('=newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const errorEvent = elementRegistry.get('ErrorEventNoExpression');
        const originalValue = getError(errorEvent).get('errorCode');

        await act(() => {
          selection.select(errorEvent);
        });
        const errorCodeInput = domQuery('input[name=errorCode]', container);
        changeInput(errorCodeInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(errorCodeInput.value).to.eql(originalValue);
      })
    );


    it('should not blow up on empty error code', inject(async function(elementRegistry, selection) {

      // given
      const errorEvent = elementRegistry.get('ErrorEventNoExpression');

      await act(() => {
        selection.select(errorEvent);
      });

      // when
      const errorCodeInput = domQuery('input[name=errorCode]', container);
      await act(() => {
        changeInput(errorCodeInput, '');
      });

      // then
      expect(getError(errorEvent).get('errorCode')).to.eql(undefined);
    }));

  });
});
