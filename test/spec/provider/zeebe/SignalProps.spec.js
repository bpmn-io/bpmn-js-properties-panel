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
  getSignal
} from 'src/provider/bpmn/utils/EventDefinitionUtil';

import diagramXML from './SignalProps.bpmn';
import { setEditorValue } from '../../../TestHelper';


describe('provider/zeebe - SignalProps', function() {

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


  describe('bpmn:Signal#name', function() {

    [
      [ 'intermediate throw event', 'SignalIntermediateThrowEvent' ],
      [ 'end event', 'SignalEndEvent' ]
    ].forEach(([ label, id ]) => {

      it(`${ label } - should display (static)`, inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get(`${ id }_Static`);

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const signalNameInput = domQuery('input[name=signalName]', container);

        // then
        expect(signalNameInput).to.exist;
      }));


      it(`${ label } - should display (expression)`, inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get(`${ id }_Expression`);

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const signalNameInput = domQuery('[name=signalName]', container);

        // then
        expect(signalNameInput).to.exist;
      }));


      it(`${ label } - should display FEEL icon`, inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get(`${ id }_Static`);

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const signalNameIcon = domQuery('[data-entry-id="signalName"] .bio-properties-panel-feel-icon', container);

        // then
        expect(signalNameIcon).to.exist;
      }));


      it(`${ label } - should update (text)`, inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get(`${ id }_Static`);

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const signalNameInput = domQuery('input[name=signalName]', container);

        await act(() => {
          changeInput(signalNameInput, 'newValue');
        });

        // then
        expect(getSignal(signalEvent).get('name')).to.equal('newValue');
      }));


      it(`${ label } - should update (expression)`, inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get(`${ id }_Expression`);

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const signalNameInput = domQuery('[name=signalName] [role=textbox]', container);

        await setEditorValue(signalNameInput, 'newValue');

        // then
        expect(getSignal(signalEvent).get('name')).to.equal('=newValue');
      }));


      it(`${ label } - should update on external change`, inject(async function(elementRegistry, selection, commandStack) {

        // given
        const signalEvent = elementRegistry.get(`${ id }_Static`);

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
        expect(signalNameInput.value).to.equal(originalValue);
      }));


      it(`${ label } - should not blow up on empty error code`, inject(async function(elementRegistry, selection) {

        // given
        const signalEvent = elementRegistry.get(`${ id }_Static`);

        await act(() => {
          selection.select(signalEvent);
        });

        // when
        const signalNameInput = domQuery('input[name=signalName]', container);

        await act(() => {
          changeInput(signalNameInput, '');
        });

        // then
        expect(getSignal(signalEvent).get('name')).to.be.undefined;
      }));

    });

  });

});
