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

import DescriptionProvider from 'src/contextProvider/zeebe/DescriptionProvider';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

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
    propertiesPanel: {
      description: DescriptionProvider
    },
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


    it('should display correct documentation for startEvents', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_2');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const documentationLink = domQuery('div[data-entry-id=messageName] a', container);

      // then
      expect(documentationLink).to.exist;
      expect(documentationLink.title).to.equal('Message event documentation');
    }));


    it('should display correct documentation for catchEvents', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_noSubscription');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const documentationLinkMessageName = domQuery('div[data-entry-id=messageName] a', container);
      const documentationLinkMessageCorrelation = domQuery('div[data-entry-id=messageSubscriptionCorrelationKey] a', container);

      // then
      expect(documentationLinkMessageName).to.not.exist;

      expect(documentationLinkMessageCorrelation).to.exist;
      expect(documentationLinkMessageCorrelation.title).to.equal('Message event documentation');
    }));


    it('should display correct documentation for startEvents in eventSubProcess', inject(async function(elementRegistry, selection) {

      // given
      const elements = [
        elementRegistry.get('StartEvent_1'),
        elementRegistry.get('StartEvent_3') ];

      for (const element of elements) {

        await act(() => {
          selection.select(element);
        });

        // when
        const documentationLinkMessageName = domQuery('div[data-entry-id=messageName] a', container);
        const documentationLinkMessageCorrelation = domQuery('div[data-entry-id=messageSubscriptionCorrelationKey] a', container);

        // then
        expect(documentationLinkMessageName).to.not.exist;

        expect(documentationLinkMessageCorrelation).to.exist;
        expect(documentationLinkMessageCorrelation.title).to.equal('Message event documentation');
      }
    }));


    it('should display correct documentation for receive tasks', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('ReceiveTask_empty');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const documentationLink = domQuery('div[data-entry-id=messageSubscriptionCorrelationKey] a', container);

      // then
      expect(documentationLink).to.exist;
      expect(documentationLink.title).to.equal('Receive task documentation');
    }));

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
