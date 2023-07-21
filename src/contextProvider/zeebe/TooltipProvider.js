/* eslint-disable react-hooks/rules-of-hooks */
import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  useService
} from '../../hooks';

const TooltipProvider = {

  'group-assignmentDefinition': (element) => {
    const translate = useService('translate');

    return (
      <a href="https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/#assignments" target="_blank" rel="noopener" title={ translate('User task documentation') }>
        { translate('How to configure a user task') }
      </a>
    );
  },

  'group-condition': (element) => {
    const translate = useService('translate');

    return (
      <a href="https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/#conditions" target="_blank" rel="noopener" title={ translate('Conditions documentation') }>
        { translate('How to define conditions') }
      </a>
    );
  },

  'group-businessRuleImplementation': (element) => {
    const translate = useService('translate');

    return (
      <a href="https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/#defining-a-task" target="_blank" rel="noopener" title={ translate('Business rule task documentation') }>
        { translate('How to configure a business rule task') }
      </a>
    );

  },

  'group-form': (element) => {
    const translate = useService('translate');

    return (
      <a href="https://docs.camunda.io/docs/guides/utilizing-forms/#connect-your-form-to-a-bpmn-diagram" target="_blank" rel="noopener" title={ translate('User task form documentation') }>
        { translate('How to link a form') }
      </a>
    );
  },

  'group-message': (element) => {
    const translate = useService('translate');

    if (is(element, 'bpmn:ReceiveTask')) {
      return (
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/receive-tasks/#messages" target="_blank" rel="noopener" title={ translate('Receive task documentation') }>
          { translate('How to configure a receive task') }
        </a>
      );
    }

    return (
      <a href="https://docs.camunda.io/docs/components/modeler/bpmn/message-events/#messages" target="_blank" rel="noopener" title={ translate('Message event documentation') }>
        { translate('How to configure a message event') }
      </a>
    );
  },

  'group-calledElement': (element) => {
    const translate = useService('translate');

    return (
      <a href="https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/" target="_blank" rel="noopener" title={ translate('Call activity documentation') }>
        { translate('How to call another process') }
      </a>
    );
  },

  'group-taskDefinition': (element) => {

    const translate = useService('translate');

    if (is(element, 'bpmn:ServiceTask')) {
      return (
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks/#task-definition" target="_blank" rel="noopener" title={ translate('Service task documentation') }>
          { translate('How to configure a service task') }
        </a>
      );
    }

    if (is(element, 'bpmn:BusinessRuleTask')) {
      return (
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/#defining-a-task" target="_blank" rel="noopener" title={ translate('Business rule task documentation') }>
          { translate('How to configure a business rule task') }
        </a>
      );
    }

    if (is(element, 'bpmn:ScriptTask')) {
      return (
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/script-tasks/#defining-a-task" target="_blank" rel="noopener" title={ translate('Script task documentation') }>
          { translate('How to configure a script task') }
        </a>
      );
    }

    if (is(element, 'bpmn:SendTask')) {
      return (
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/send-tasks/#defining-a-task" target="_blank" rel="noopener" title={ translate('Send task documentation') }>
          { translate('How to configure a send task') }
        </a>
      );
    }

    if (is(element, 'bpmn:ThrowEvent')) {
      return (
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/message-events/#message-throw-events" target="_blank" rel="noopener" title={ translate('Message throw event documentation') }>
          { translate('How to configure a message throw event') }
        </a>
      );
    }
  },

  'group-multiInstance': (element) => {
    const translate = useService('translate');

    return (
      <a href="https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/#defining-the-collection-to-iterate-over" target="_blank" rel="noopener" title={ translate('Multi instance documentation') }>
        { translate('How to configure a multi instance activity') }
      </a>
    );
  },

  'group-error': (element) => {
    const translate = useService('translate');

    return (
      <a href="https://docs.camunda.io/docs/components/modeler/bpmn/error-events/#defining-the-error" target="_blank" rel="noopener" title={ translate('Error event documentation') }>
        { translate('How to configure an error event') }
      </a>
    );
  },

  'group-inputs': (element) => {
    const translate = useService('translate');

    return (
      <a href="https://docs.camunda.io/docs/components/concepts/variables/#input-mappings" target="_blank" rel="noopener" title={ translate('Input mappings documentation') }>
        { translate('How to configure input variable mappings') }
      </a>
    );
  },

  'group-outputs': (element) => {
    const translate = useService('translate');

    return (
      <a href="https://docs.camunda.io/docs/components/concepts/variables/#output-mappings" target="_blank" rel="noopener" title={ translate('Output mappings documentation') }>
        { translate('How to configure output variable mappings') }
      </a>
    );
  }
};

export default TooltipProvider;
