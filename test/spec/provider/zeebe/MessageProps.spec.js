import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject,
  mouseEnter
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

// these properties can't live without the generic BPMN message props
import BpmnPropertiesProvider from 'src/provider/bpmn';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import TooltipProvider from 'src/contextProvider/zeebe/TooltipProvider';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import BehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

import {
  getMessage
} from 'src/provider/bpmn/utils/EventDefinitionUtil';

import diagramXML from './MessageProps.bpmn';
import { setEditorValue } from '../../../TestHelper';


describe('provider/zeebe - MessageProps', function() {

  const testModules = [
    CoreModule,
    SelectionModule,
    ModelingModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    ZeebePropertiesProvider,
    BehaviorsModule
  ];

  const moddleExtensions = {
    zeebe: zeebeModdleExtensions
  };

  let container, clock;

  beforeEach(function() {
    container = TestContainer.get(this);
    clock = sinon.useFakeTimers();
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    moddleExtensions,
    propertiesPanel: {
      tooltip: TooltipProvider
    },
    debounceInput: false
  }));

  afterEach(function() {
    clock.restore();
  });

  function openTooltip() {
    return act(() => {
      const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);
      mouseEnter(wrapper);
      clock.tick(200);
    });
  }


  describe('bpmn:StartEvent#messageRef.name', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const messageNameInput = domQuery('input[name=messageName]', container);

      // then
      expect(messageNameInput.value).to.eql(getMessage(messageEvent).get('name'));
    }));


    it('should not display for Message <None>', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEvent_empty');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const messageNameInput = domQuery('input[name=messageName]', container);

      // then
      expect(messageNameInput).not.to.exist;
    }));


    it('should display feel icon', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const messageNameIcon = domQuery('[data-entry-id="messageName"] .bio-properties-panel-feel-icon', container);

      // then
      expect(messageNameIcon).to.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const messageNameInput = domQuery('input[name=messageName]', container);
      changeInput(messageNameInput, 'newValue');

      // then
      expect(getMessage(messageEvent).get('name')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const messageEvent = elementRegistry.get('StartEvent_1');
        const originalValue = getMessage(messageEvent).get('name');

        await act(() => {
          selection.select(messageEvent);
        });
        const messageNameInput = domQuery('input[name=messageName]', container);
        changeInput(messageNameInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(messageNameInput.value).to.eql(originalValue);
      })
    );


    it('should not blow up on empty message name', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const messageNameInput = domQuery('input[name=messageName]', container);
      await act(() => {
        changeInput(messageNameInput, '');
      });

      // then
      expect(getMessage(messageEvent).get('name')).to.eql(undefined);
    }));

  });


  describe('bpmn:IntermediateEvent#messageRef.name', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('IntermediateEvent_1');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const messageNameInput = domQuery('input[name=messageName]', container);

      // then
      expect(messageNameInput.value).to.eql(getMessage(messageEvent).get('name'));
    }));


    it('should not display for Message <None>', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('IntermediateEvent_empty');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const messageNameInput = domQuery('input[name=messageName]', container);

      // then
      expect(messageNameInput).not.to.exist;
    }));


    it('should display feel icon', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('IntermediateEvent_1');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const messageNameIcon = domQuery('[data-entry-id="messageName"] .bio-properties-panel-feel-icon', container);

      // then
      expect(messageNameIcon).to.exist;
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('IntermediateEvent_1');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const messageNameInput = domQuery('input[name=messageName]', container);
      changeInput(messageNameInput, 'newValue');

      // then
      expect(getMessage(messageEvent).get('name')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const messageEvent = elementRegistry.get('IntermediateEvent_1');
        const originalValue = getMessage(messageEvent).get('name');

        await act(() => {
          selection.select(messageEvent);
        });
        const messageNameInput = domQuery('input[name=messageName]', container);
        changeInput(messageNameInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(messageNameInput.value).to.eql(originalValue);
      })
    );


    it('should not blow up on empty message name', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('IntermediateEvent_1');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const messageNameInput = domQuery('input[name=messageName]', container);
      await act(() => {
        changeInput(messageNameInput, '');
      });

      // then
      expect(getMessage(messageEvent).get('name')).to.eql(undefined);
    }));

  });


  describe('bpmn:StartEvent#messageRef.subscription.correlationKey', function() {

    it('should NOT display for start event', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_2');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const correlationKeyInput = domQuery('[name=messageSubscriptionCorrelationKey] [role="textbox"]', container);

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
      const correlationKeyInput = domQuery('[name=messageSubscriptionCorrelationKey] [role="textbox"]', container);

      // then
      expect('=' + correlationKeyInput.textContent).to.eql(getCorrelationKey(startEvent));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const correlationKeyInput = domQuery('[name=messageSubscriptionCorrelationKey] [role="textbox"]', container);
      await setEditorValue(correlationKeyInput, 'newValue');

      // then
      expect(getCorrelationKey(startEvent)).to.eql('=newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1');
        const originalValue = getCorrelationKey(startEvent);

        await act(() => {
          selection.select(startEvent);
        });
        const correlationKeyInput = domQuery('[name=messageSubscriptionCorrelationKey] [role="textbox"]', container);
        await setEditorValue(correlationKeyInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect('=' + correlationKeyInput.textContent).to.eql(originalValue);
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
        const correlationKeyInput = domQuery('[name=messageSubscriptionCorrelationKey] [role="textbox"]', container);
        await setEditorValue(correlationKeyInput, 'newValue');

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
        const correlationKeyInput = domQuery('[name=messageSubscriptionCorrelationKey] [role="textbox"]', container);
        await setEditorValue(correlationKeyInput, 'newValue');

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
      await openTooltip();

      const documentationLinkGroup = domQuery('.bio-properties-panel-tooltip-content a', container);

      // then
      expect(documentationLinkGroup).to.exist;
      expect(documentationLinkGroup.title).to.equal('Message event documentation');
    }));


    it('should display correct documentation for catchEvents', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_noSubscription');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      await openTooltip();

      const documentationLinkMessageName = domQuery('div[data-entry-id=messageName] a', container);
      const documentationLinkMessageCorrelation = domQuery('div[data-entry-id=messageSubscriptionCorrelationKey] a', container);
      const documentationLinkGroup = domQuery('.bio-properties-panel-tooltip-content a', container);


      // then
      expect(documentationLinkMessageName).to.not.exist;
      expect(documentationLinkMessageCorrelation).to.not.exist;

      expect(documentationLinkGroup).to.exist;
      expect(documentationLinkGroup.title).to.equal('Message event documentation');
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
        await openTooltip();

        const documentationLinkMessageName = domQuery('div[data-entry-id=messageName] a', container);
        const documentationLinkMessageCorrelation = domQuery('div[data-entry-id=messageSubscriptionCorrelationKey] a', container);
        const documentationLinkGroup = domQuery('.bio-properties-panel-tooltip-content a', container);

        // then
        expect(documentationLinkMessageName).to.not.exist;
        expect(documentationLinkMessageCorrelation).to.not.exist;

        expect(documentationLinkGroup).to.exist;
        expect(documentationLinkGroup.title).to.equal('Message event documentation');
      }
    }));


    it('should display correct documentation for receive tasks', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('ReceiveTask_empty');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      await openTooltip();

      const documentationLinkGroups = domQueryAll('.bio-properties-panel-tooltip-content a', container);

      // then
      expect(documentationLinkGroups).to.exist;
      expect(documentationLinkGroups).to.have.length(2);
      expect(documentationLinkGroups[0].title).to.equal('Send task documentation');
      expect(documentationLinkGroups[1].title).to.equal('Receive task documentation');
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
