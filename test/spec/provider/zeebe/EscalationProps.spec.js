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

// these properties can't live without the generic BPMN escalation props
import BpmnPropertiesProvider from 'src/provider/bpmn';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import TooltipProvider from 'src/contextProvider/zeebe/TooltipProvider';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  getEscalation
} from 'src/provider/bpmn/utils/EventDefinitionUtil';

import diagramXML from './EscalationProps.bpmn';
import { setEditorValue } from '../../../TestHelper';


describe('provider/zeebe - EscalationProps', function() {

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


  describe('bpmn:Escalation#escalationCode', function() {

    it('should display (text)', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('CatchEscalationWithStatic');

      await act(() => {
        selection.select(escalationEvent);
      });

      // when
      const escalationCodeInput = domQuery('input[name=escalationCode]', container);

      // then
      expect(escalationCodeInput).to.exist;
    }));


    it('should display (FEEL expression)', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('ThrowEscalationWithExpression');

      await act(() => {
        selection.select(escalationEvent);
      });

      // when
      const escalationCodeInput = domQuery('[name=escalationCode]', container);

      // then
      expect(escalationCodeInput).to.exist;
    }));


    it('should display expresion-like as text (catch event)', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('CatchEscalationWithExpression');

      await act(() => {
        selection.select(escalationEvent);
      });

      // when
      const escalationCodeInput = domQuery('input[name=escalationCode]', container);

      // then
      expect(escalationCodeInput).to.exist;
    }));


    it('should display FEEL icon for throw event', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('ThrowEscalationWithStatic');

      await act(() => {
        selection.select(escalationEvent);
      });

      // when
      const escalationCodeIcon = domQuery('[data-entry-id="escalationCode"] .bio-properties-panel-feel-icon', container);

      // then
      expect(escalationCodeIcon).to.exist;
    }));


    it('should NOT display FEEL icon for catch event', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('CatchEscalationWithStatic');

      await act(() => {
        selection.select(escalationEvent);
      });

      // when
      const escalationCodeIcon = domQuery('[data-entry-id="escalationCode"] .bio-properties-panel-feel-icon', container);

      // then
      expect(escalationCodeIcon).not.to.exist;
    }));


    it('should update (text)', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('CatchEscalationWithStatic');

      await act(() => {
        selection.select(escalationEvent);
      });

      // when
      const escalationCodeInput = domQuery('input[name=escalationCode]', container);
      await act(() => {
        changeInput(escalationCodeInput, 'newValue');
      });

      // then
      expect(getEscalation(escalationEvent).get('escalationCode')).to.eql('newValue');
    }));


    it('should update (FEEL expression)', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('ThrowEscalationWithExpression');

      await act(() => {
        selection.select(escalationEvent);
      });

      // when
      const escalationCodeInput = domQuery('[name=escalationCode] [role=textbox]', container);
      await setEditorValue(escalationCodeInput, 'newValue');

      // then
      expect(getEscalation(escalationEvent).get('escalationCode')).to.eql('=newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const escalationEvent = elementRegistry.get('CatchEscalationWithStatic');
        const originalValue = getEscalation(escalationEvent).get('escalationCode');

        await act(() => {
          selection.select(escalationEvent);
        });
        const escalationCodeInput = domQuery('input[name=escalationCode]', container);
        changeInput(escalationCodeInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(escalationCodeInput.value).to.eql(originalValue);
      })
    );


    it('should not blow up on empty escalation code', inject(async function(elementRegistry, selection) {

      // given
      const escalationEvent = elementRegistry.get('CatchEscalationWithStatic');

      await act(() => {
        selection.select(escalationEvent);
      });

      // when
      const escalationCodeInput = domQuery('input[name=escalationCode]', container);
      await act(() => {
        changeInput(escalationCodeInput, '');
      });

      // then
      expect(getEscalation(escalationEvent).get('escalationCode')).to.eql(undefined);
    }));

  });
});
