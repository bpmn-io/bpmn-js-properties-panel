import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  isEventSubProcess
} from 'bpmn-js/lib/util/DiUtil';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

import {
  getMessage
} from '../../bpmn/utils/EventDefinitionUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  getExtensionElementsList
} from '../../../utils/ExtensionElementsUtil';


export function MessageProps(props) {
  const {
    element
  } = props;

  const message = getMessage(element);

  if (!message || !canHaveSubscriptionCorrelationKey(element)) {
    return [];
  }

  const entries = [
    {
      id: 'messageSubscriptionCorrelationKey',
      component: <SubscriptionCorrelationKey element={ element } />,
      isEdited: isTextFieldEntryEdited
    },
  ];

  return entries;
}

function SubscriptionCorrelationKey(props) {
  const { element } = props;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getCorrelationKey(element);
  };

  const setValue = (value) => {
    const commands = [];

    const message = getMessage(element);

    let extensionElements = message.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        message,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: message,
          properties: { extensionElements }
        }
      });
    }

    // (2) ensure subscription
    let subscription = getSubscription(element);

    if (!subscription) {
      subscription = createElement(
        'zeebe:Subscription',
        { },
        extensionElements,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), subscription ]
          }
        }
      });
    }

    // (3) update subscription correlation key
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: subscription,
        properties: { correlationKey: value }
      }
    });

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return TextFieldEntry({
    element,
    id: 'messageSubscriptionCorrelationKey',
    label: translate('Subscription correlation key'),
    getValue,
    setValue,
    debounce
  });
}


// helper ///////////////////////

function canHaveSubscriptionCorrelationKey(element) {

  // (1) allow for receive task
  if (is(element, 'bpmn:ReceiveTask')) {
    return true;
  }

  // (2) allow for non start events
  if (!is(element, 'bpmn:StartEvent')) {
    return true;
  }

  // (3) allow for start events inside event sub processes
  if (is(element, 'bpmn:StartEvent') && isEventSubProcess(element.parent)) {
    return true;
  }

  return false;
}

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
