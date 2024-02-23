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
      <div>
        { translate('Define who the task is assigned to. One or all of the following attributes can be specified simultaneously. ')}
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/#assignments" target="_blank" rel="noopener" title={ translate('User task documentation') }>
          { translate('Learn more.') }
        </a>
      </div>
    );
  },

  'group-condition': (element) => {
    const translate = useService('translate');

    return (
      <div>
        { translate('Define a boolean condition expression that defines when this flow is taken. ')}
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/#conditions" target="_blank" rel="noopener" title={ translate('Conditions documentation') }>
          { translate('Learn how to define conditions.') }
        </a>
      </div>
    );
  },

  'group-businessRuleImplementation': (element) => {
    const translate = useService('translate');

    return (
      <div>
        { translate('Evaluate a business rule, for example a DMN. To add a custom implementation, use a job worker. ')}
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/#defining-a-task" target="_blank" rel="noopener" title={ translate('Business rule task documentation') }>
          { translate('Learn more.') }
        </a>
      </div>
    );

  },

  'group-scriptImplementation': (element) => {
    const translate = useService('translate');

    return (
      <div>
        { translate('Implement a script task using an inline FEEL expression. To add a custom implementation, use a job worker. ')}
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/script-tasks/#defining-a-script-task" target="_blank" rel="noopener" title={ translate('Script task documentation') }>
          { translate('Learn more.') }
        </a>
      </div>
    );
  },

  'group-form': (element) => {
    const translate = useService('translate');

    return (
      <div>
        { translate('Link or embed a form created with the Camunda Forms editor. To associate a custom form, application, or URL to the user task, specify a form key. ')}
        <a href="https://docs.camunda.io/docs/guides/utilizing-forms/#connect-your-form-to-a-bpmn-diagram" target="_blank" rel="noopener" title={ translate('User task form documentation') }>
          { translate('Learn more.') }
        </a>
      </div>
    );
  },

  'group-message': (element) => {
    const translate = useService('translate');

    if (is(element, 'bpmn:ReceiveTask')) {
      return (
        <div>
          { translate('Define the name of the message (e.g. ')}<code>Money collected</code>{translate(') and the ')}<code>correlationKey</code>{translate(' expression (e.g. ')}<code>= orderId</code>{translate(')')}{translate(' to subscribe to. ')}
          {translate('Learn more how to ')}
          <a href="https://docs.camunda.io/docs/components/modeler/bpmn/send-tasks" target="_blank" rel="noopener" title={ translate('Send task documentation') }>
            { translate('send ') }
          </a>
          {translate('and ')}
          <a href="https://docs.camunda.io/docs/components/modeler/bpmn/receive-tasks" target="_blank" rel="noopener" title={ translate('Receive task documentation') }>
            { translate('receive messages. ') }
          </a>
        </div>
      );
    }

    return (
      <div>
        { translate('Define the name of the message (e.g. ')}<code>Money collected</code>{translate(') and the ')}<code>correlationKey</code>{translate(' expression (e.g. ')}<code>= orderId</code>{translate(')')}{translate(' to subscribe to. ')}
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/message-events/#messages" target="_blank" rel="noopener" title={ translate('Message event documentation') }>
          { translate('Learn more.') }
        </a>
      </div>
    );
  },

  'group-calledElement': (element) => {
    const translate = useService('translate');

    return (
      <div>
        { translate('Define the ID of the process to call (e.g. ')} <code>shipping-process</code>
        {translate(' or ')}<code>= "shipping-" + tenantId</code> {translate('). ')}
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/" target="_blank" rel="noopener" title={ translate('Call activity documentation') }>
          { translate('Learn more.') }
        </a>
      </div>
    );
  },

  'group-taskDefinition': (element) => {

    const translate = useService('translate');

    if (is(element, 'bpmn:ServiceTask')) {
      return (
        <div>{translate('Specify which job workers handle the task work to execute a service (e.g. ')}<code>order-items</code>{translate('). ')}
          <a href="https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks" target="_blank" rel="noopener" title={ translate('Service task documentation') }>
            { translate('Learn more.') }
          </a>
        </div>
      );
    }

    if (is(element, 'bpmn:BusinessRuleTask')) {
      return (
        <div>{translate('Specify which job workers handle the task work to evaluate business rules. ')}
          <a href="https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/#job-worker-implementation" target="_blank" rel="noopener" title={ translate('Business rule task documentation') }>
            { translate('Learn more.') }
          </a>
        </div>
      );
    }

    if (is(element, 'bpmn:ScriptTask')) {
      return (
        <div>{translate('Specify which job workers handle the task work to execute a script. ')}
          <a href="https://docs.camunda.io/docs/components/modeler/bpmn/script-tasks/#defining-a-task" target="_blank" rel="noopener" title={ translate('Script task documentation') }>
            { translate('Learn more.') }
          </a>
        </div>
      );
    }

    if (is(element, 'bpmn:SendTask')) {
      return (
        <div>{translate('Specify which job workers handle the task work to send a message (e.g. ')}<code>kafka</code>{translate(' or ')}<code>mail</code>{translate('). ')}
          <a href="https://docs.camunda.io/docs/components/modeler/bpmn/send-tasks/#defining-a-task" target="_blank" rel="noopener" title={ translate('Send task documentation') }>
            { translate('Learn more.') }
          </a>
        </div>
      );
    }

    if (is(element, 'bpmn:ThrowEvent')) {
      return (
        <div>{translate('Specify which job workers handle the event work. ')}
          <a href="https://docs.camunda.io/docs/components/modeler/bpmn/message-events/#message-throw-events" target="_blank" rel="noopener" title={ translate('Message throw event documentation') }>
            { translate('Learn more.') }
          </a>
        </div>
      );
    }
  },

  'group-multiInstance': (element) => {
    const translate = useService('translate');

    return (
      <div>
        {translate('Execute this task for each element of a given collection. ')}
        <br />
        {translate('Define an input collection expression that defines the collection to iterate over (e.g. ')}<code>= items</code>{translate('). ')}
        {translate('To collect the output define the output collection and the output element expressions. ')}
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/#defining-the-collection-to-iterate-over" target="_blank" rel="noopener" title={ translate('Multi instance documentation') }>
          { translate('Learn more.') }
        </a>
      </div>
    );
  },

  'group-error': (element) => {
    const translate = useService('translate');

    return (
      <div>
        {translate('Define an error code (e.g. ')}<code>order-not-found</code>{translate('). ')}
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/error-events/#defining-the-error" target="_blank" rel="noopener" title={ translate('Error event documentation') }>
          { translate('Learn more.') }
        </a>
      </div>
    );
  },

  'group-inputs': (element) => {
    const translate = useService('translate');

    return (
      <div>
        { translate('Create a new local variable in the scope of this task. ')}
        <a href="https://docs.camunda.io/docs/components/concepts/variables/#input-mappings" target="_blank" rel="noopener" title={ translate('Input mappings documentation') }>
          { translate('Learn more.') }
        </a>
      </div>
    );
  },

  'group-outputs': (element) => {
    const translate = useService('translate');

    return (
      <div>
        { translate('Customize how result variables are merged into the global scope of the process instance. ')}
        <a href="https://docs.camunda.io/docs/components/concepts/variables/#output-mappings" target="_blank" rel="noopener" title={ translate('Output mappings documentation') }>
          { translate('Learn more.') }
        </a>
      </div>
    );
  },
  'taskDefinitionRetries': (element) => {

    const translate = useService('translate');

    return (
      <div>
        <p>
          { translate('The number of times the engine tries executing this activity if a worker signals a failure. The default is three.') } { ' ' }
          <a href="https://docs.camunda.io/docs/next/components/best-practices/development/dealing-with-problems-and-exceptions/#leveraging-retries" target="_blank" rel="noopener">{ translate('Learn more.') }</a>
        </p>
      </div>
    );
  }
};

export default TooltipProvider;
