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

// these properties can't live without the generic BPMN message props
import BpmnPropertiesProvider from 'src/provider/bpmn';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  getExtensionElementsList
} from 'src/provider/zeebe/utils/ExtensionElementsUtil';

import {
  getMessage
} from 'src/provider/bpmn/utils/EventDefinitionUtil';

import diagramXML from './MessageProps.bpmn';


describe('provider/zeebe - MessageProps', function() {

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
    debounceInput: false
  }));


  describe('bpmn:StartEvent#messageRef.subscription.correlationKey', function() {

    it('should NOT display for start event', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_2');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const correlationKeyInput = domQuery('input[name=messageSubscriptionCorrelationKey]', container);

      // then
      expect(correlationKeyInput).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const correlationKeyInput = domQuery('input[name=messageSubscriptionCorrelationKey]', container);

      // then
      expect(correlationKeyInput.value).to.eql(getCorrelationKey(startEvent));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const correlationKeyInput = domQuery('input[name=messageSubscriptionCorrelationKey]', container);
      changeInput(correlationKeyInput, 'newValue');

      // then
      expect(getCorrelationKey(startEvent)).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1');
        const originalValue = getCorrelationKey(startEvent);

        await act(() => {
          selection.select(startEvent);
        });
        const correlationKeyInput = domQuery('input[name=messageSubscriptionCorrelationKey]', container);
        changeInput(correlationKeyInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(correlationKeyInput.value).to.eql(originalValue);
      })
    );


    it('should create non existing extension elements',
      inject(async function(elementRegistry, selection) {

        // given
        const receiveTask = elementRegistry.get('ReceiveTask_empty');

        // assume
        expect(getMessage(receiveTask).get('extensionElements')).to.not.exist;

        await act(() => {
          selection.select(receiveTask);
        });

        // when
        const correlationKeyInput = domQuery('input[name=messageSubscriptionCorrelationKey]', container);
        changeInput(correlationKeyInput, 'newValue');

        // then
        expect(getMessage(receiveTask).get('extensionElements')).to.exist;
      })
    );


    it('should create non existing subscription',
      inject(async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('StartEvent_noSubscription');

        // assume
        expect(getSubscription(startEvent)).not.to.exist;

        await act(() => {
          selection.select(startEvent);
        });

        // when
        const correlationKeyInput = domQuery('input[name=messageSubscriptionCorrelationKey]', container);
        changeInput(correlationKeyInput, 'newValue');

        // then
        expect(getSubscription(startEvent)).to.exist;
      })
    );

  });

});


// helper //////////////////

function getCorrelationKey(element) {
  const subscription = getSubscription(element);

  return subscription ? subscription.get('correlationKey') : '';
}

function getSubscription(element) {
  const message = getMessage(element);
  const subscriptions = getSubscriptions(message);

  return subscriptions[0];
}

function getSubscriptions(message) {
  const extensionElements = getExtensionElementsList(message, 'zeebe:Subscription');
  return extensionElements;
}
