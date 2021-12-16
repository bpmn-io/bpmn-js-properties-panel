/* eslint-disable react-hooks/rules-of-hooks */
import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  useService
} from '../../hooks';

const DescriptionProvider = {

  conditionExpression: (element) => {
    const translate = useService('translate');

    return (
      <a href="https://docs.camunda.io/docs/reference/bpmn-processes/exclusive-gateways/exclusive-gateways#conditions" target="_blank" rel="noopener" title={ translate('Conditions documentation') }>
        { translate('How to define conditions') }
      </a>
    );
  },

  messageSubscriptionCorrelationKey: (element) => {
    const translate = useService('translate');

    if (is(element, 'bpmn:ReceiveTask')) {
      return (
        <a href="https://docs.camunda.io/docs/reference/bpmn-processes/receive-tasks/receive-tasks/#messages" target="_blank" rel="noopener" title={ translate('Receive task documentation') }>
          { translate('How to configure a receive task') }
        </a>
      );
    }

    return (
      <a href="https://docs.camunda.io/docs/reference/bpmn-processes/message-events/message-events/#messages" target="_blank" rel="noopener" title={ translate('Message event documentation') }>
        { translate('How to configure a message event') }
      </a>
    );
  },

  messageName: (element) => {
    const translate = useService('translate');

    if (is(element, 'bpmn:StartEvent') && !isInEventSubProcess(element)) {
      return (
        <a href="https://docs.camunda.io/docs/reference/bpmn-processes/message-events/message-events/#messages" target="_blank" rel="noopener" title={ translate('Message event documentation') }>
          { translate('How to configure a message event') }
        </a>
      );
    }
  },

  targetProcessId: (element) => {
    const translate = useService('translate');

    return (
      <a href="https://docs.camunda.io/docs/reference/bpmn-processes/call-activities/call-activities" target="_blank" rel="noopener" title={ translate('Call activity documentation') }>
        { translate('How to call another process') }
      </a>
    );
  },

  taskDefinitionType: (element) => {
    const translate = useService('translate');

    if (is(element, 'bpmn:ServiceTask')) {
      return (
        <a href="https://docs.camunda.io/docs/reference/bpmn-processes/service-tasks/service-tasks/#task-definition" target="_blank" rel="noopener" title={ translate('Service task documentation') }>
          { translate('How to configure a service task') }
        </a>
      );
    }

    if (is(element, 'bpmn:BusinessRuleTask')) {
      return (
        <a href="https://docs.camunda.io/docs/reference/bpmn-processes/business-rule-tasks/business-rule-tasks/#defining-a-task" target="_blank" rel="noopener" title={ translate('Business rule task documentation') }>
          { translate('How to configure a business rule task') }
        </a>
      );
    }

    if (is(element, 'bpmn:ScriptTask')) {
      return (
        <a href="https://docs.camunda.io/docs/reference/bpmn-processes/script-tasks/script-tasks/#defining-a-task" target="_blank" rel="noopener" title={ translate('Script task documentation') }>
          { translate('How to configure a script task') }
        </a>
      );
    }

    if (is(element, 'bpmn:SendTask')) {
      return (
        <a href="https://docs.camunda.io/docs/reference/bpmn-processes/send-tasks/send-tasks/#defining-a-task" target="_blank" rel="noopener" title={ translate('Send task documentation') }>
          { translate('How to configure a send task') }
        </a>
      );
    }
  },

  errorCode: (element) => {
    const translate = useService('translate');

    return (
      <a href="https://docs.camunda.io/docs/reference/bpmn-processes/error-events/error-events/#defining-the-error" target="_blank" rel="noopener" title={ translate('Error event documentation') }>
        { translate('How to configure an error event') }
      </a>
    );
  }
};

export default DescriptionProvider;

// helper ////////////

function isInEventSubProcess(element) {
  const bo = getBusinessObject(element),
        parent = bo.$parent;

  return is(parent, 'bpmn:SubProcess') && parent.triggeredByEvent;
}
