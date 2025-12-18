/* eslint-disable react-hooks/rules-of-hooks */
import {
  is,
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

import {
  useService
} from '../../hooks';

import { isZeebeUserTask } from '../../provider/zeebe/utils/FormUtil';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

const TooltipProvider = {

  'group-assignmentDefinition': (element) => {
    const translate = useService('translate');

    return (
      <div>
        { translate('Define who the task is assigned to. One or all of the following attributes can be specified simultaneously. ')}
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/#assignments" target="_blank" rel="noopener noreferrer" title={ translate('User task documentation') }>
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
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/exclusive-gateways/#conditions" target="_blank" rel="noopener noreferrer" title={ translate('Conditions documentation') }>
          { translate('Learn how to define conditions.') }
        </a>
      </div>
    );
  },

  'group-businessRuleImplementation': (element) => {
    const translate = useService('translate');

    return (
      <div>
        { translate('Evaluate a business rule, for example a DMN decision. To add a custom implementation, use a job worker. ')}
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/#defining-a-task" target="_blank" rel="noopener noreferrer" title={ translate('Business rule task documentation') }>
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
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/script-tasks/#defining-a-script-task" target="_blank" rel="noopener noreferrer" title={ translate('Script task documentation') }>
          { translate('Learn more.') }
        </a>
      </div>
    );
  },

  'group-userTaskImplementation': (element) => {
    const translate = useService('translate');

    return (
      <div>
        { translate('Implement a user task managed by Camunda. To add a custom implementation, use a job worker. ')}
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/#define-a-user-task" target="_blank" rel="noopener noreferrer" title={ translate('User task documentation') }>
          { translate('Learn more.') }
        </a>
      </div>
    );
  },

  'group-form': (element) => {
    const translate = useService('translate');

    if (isZeebeUserTask(element)) {
      return (
        <div>
          { translate('Link a form created with the Camunda Forms editor. To associate a custom form, application, or URL to the user task, specify an external reference. ')}
          <a href="https://docs.camunda.io/docs/components/modeler/forms/utilizing-forms/#connect-your-form-to-a-bpmn-diagram" target="_blank" rel="noopener noreferrer" title={ translate('User task form documentation') }>
            { translate('Learn more.') }
          </a>
        </div>
      );
    }

    return (
      <div>
        { translate('Link or embed a form created with the Camunda Forms editor. To associate a custom form, application, or URL to the user task, specify a form key. ')}
        <a href="https://docs.camunda.io/docs/components/modeler/forms/utilizing-forms/#connect-your-form-to-a-bpmn-diagram" target="_blank" rel="noopener noreferrer" title={ translate('User task form documentation') }>
          { translate('Learn more.') }
        </a>
      </div>
    );
  },

  'group-calledDecision': (element) => {

    const translate = useService('translate');
    return (
      <div>
        { translate('Define the decision to evaluate and how to map back the evaluation result. ') }
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/#defining-a-called-decision" target="_blank" rel="noopener noreferrer" title={ translate('Send task documentation') }>
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
          <a href="https://docs.camunda.io/docs/components/modeler/bpmn/send-tasks" target="_blank" rel="noopener noreferrer" title={ translate('Send task documentation') }>
            { translate('send ') }
          </a>
          {translate('and ')}
          <a href="https://docs.camunda.io/docs/components/modeler/bpmn/receive-tasks" target="_blank" rel="noopener noreferrer" title={ translate('Receive task documentation') }>
            { translate('receive messages. ') }
          </a>
        </div>
      );
    }

    return (
      <div>
        { translate('Define the name of the message (e.g. ')}<code>Money collected</code>{translate(') and the ')}<code>correlationKey</code>{translate(' expression (e.g. ')}<code>= orderId</code>{translate(')')}{translate(' to subscribe to. ')}
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/message-events/#messages" target="_blank" rel="noopener noreferrer" title={ translate('Message event documentation') }>
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
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/call-activities/" target="_blank" rel="noopener noreferrer" title={ translate('Call activity documentation') }>
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
          <a href="https://docs.camunda.io/docs/components/modeler/bpmn/service-tasks" target="_blank" rel="noopener noreferrer" title={ translate('Service task documentation') }>
            { translate('Learn more.') }
          </a>
        </div>
      );
    }

    if (is(element, 'bpmn:BusinessRuleTask')) {
      return (
        <div>{translate('Specify which job workers handle the task work to evaluate business rules. ')}
          <a href="https://docs.camunda.io/docs/components/modeler/bpmn/business-rule-tasks/#job-worker-implementation" target="_blank" rel="noopener noreferrer" title={ translate('Business rule task documentation') }>
            { translate('Learn more.') }
          </a>
        </div>
      );
    }

    if (is(element, 'bpmn:ScriptTask')) {
      return (
        <div>{translate('Specify which job workers handle the task work to execute a script. ')}
          <a href="https://docs.camunda.io/docs/components/modeler/bpmn/script-tasks/#defining-a-task" target="_blank" rel="noopener noreferrer" title={ translate('Script task documentation') }>
            { translate('Learn more.') }
          </a>
        </div>
      );
    }

    if (is(element, 'bpmn:SendTask')) {
      return (
        <div>{translate('Specify which job workers handle the task work to send a message (e.g. ')}<code>kafka</code>{translate(' or ')}<code>mail</code>{translate('). ')}
          <a href="https://docs.camunda.io/docs/components/modeler/bpmn/send-tasks/#defining-a-task" target="_blank" rel="noopener noreferrer" title={ translate('Send task documentation') }>
            { translate('Learn more.') }
          </a>
        </div>
      );
    }

    if (is(element, 'bpmn:ThrowEvent')) {
      return (
        <div>{translate('Specify which job workers handle the event work. ')}
          <a href="https://docs.camunda.io/docs/components/modeler/bpmn/message-events/#message-throw-events" target="_blank" rel="noopener noreferrer" title={ translate('Message throw event documentation') }>
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
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/multi-instance/#defining-the-collection-to-iterate-over" target="_blank" rel="noopener noreferrer" title={ translate('Multi instance documentation') }>
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
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/error-events/#defining-the-error" target="_blank" rel="noopener noreferrer" title={ translate('Error event documentation') }>
          { translate('Learn more.') }
        </a>
      </div>
    );
  },

  'group-inputs': (element) => {
    const translate = useService('translate');

    return (
      <div>
        { translate('Add input mappings to control what is passed to the activity as local variables. ')}
        <a href="https://docs.camunda.io/docs/components/concepts/variables/#input-mappings" target="_blank" rel="noopener noreferrer" title={ translate('Input mappings documentation') }>
          { translate('Learn more.') }
        </a>
      </div>
    );
  },

  'group-outputs': (element) => {
    const translate = useService('translate');

    return (
      <div>
        { translate('Add output mappings to control which variables are merged back into the process scope. ')}
        <a href="https://docs.camunda.io/docs/components/concepts/variables/#output-mappings" target="_blank" rel="noopener noreferrer" title={ translate('Output mappings documentation') }>
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
          <a href="https://docs.camunda.io/docs/components/best-practices/development/dealing-with-problems-and-exceptions/#leveraging-retries" target="_blank" rel="noopener noreferrer">{ translate('Learn more.') }</a>
        </p>
      </div>
    );
  },
  'bindingType': (element) => {

    const translate = useService('translate');

    return (
      <div>
        <p>
          <h1>{ translate('Latest binding') }</h1>
          { translate('Uses the most recent deployed resource.') }
        </p>
        <p>
          <h1>{ translate('Deployment binding') }</h1>
          { translate('Uses the resource found in the same deployment.') }
        </p>
        <p>
          <h1>{ translate('Version tag binding') }</h1>
          { translate('Uses the most recent deployed resource with the given version tag.') }
        </p>
      </div>
    );
  },
  'versionTag': (element) => {
    const translate = useService('translate');

    if (isAny(element, [ 'bpmn:Process', 'bpmn:Participant' ])) {
      return (
        <div>
          <p>
            { translate('Version tag by which this process can be referenced.') }
          </p>
        </div>
      );
    } else if (is(element, 'bpmn:CallActivity')) {
      return (
        <div>
          <p>
            { translate('Version tag by which the called process will be referenced.') }
          </p>
        </div>
      );
    } else if (is(element, 'bpmn:BusinessRuleTask')) {
      return (
        <div>
          <p>
            { translate('Version tag by which the called decision will be referenced.') }
          </p>
        </div>
      );
    } else if (is(element, 'bpmn:UserTask')) {
      return (
        <div>
          <p>
            { translate('Version tag by which the linked form will be referenced.') }
          </p>
        </div>
      );
    }
  },
  'priorityDefinitionPriority': (element) => {

    const translate = useService('translate');

    return (
      <div>
        <p>{ translate('An integer value that can range from 0 to 100, where a higher value indicates a higher priority.') }</p>
        <p>{ translate('If unset, the default value is 50.') }</p>
      </div>
    );
  },
  'group-adHocCompletion': (element) => {
    const translate = useService('translate');

    return (
      <div>
        {translate('Define the completion behavior of an ad-hoc subprocess. If no completion condition is set, it will be completed after all active elements have been completed. ')}
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/ad-hoc#completion" target="_blank" rel="noopener noreferrer" title={ translate('Ad-hoc subprocess documentation') }>
          { translate('Learn more.') }
        </a>
      </div>
    );
  },
  'group-activeElements': (element) => {
    const translate = useService('translate');

    return (
      <div>
        {translate('Define a collection of elements which will be activated when the ad-hoc subprocess is reached. ')}
        <a href="https://docs.camunda.io/docs/components/modeler/bpmn/ad-hoc/#activate-an-element" target="_blank" rel="noopener noreferrer" title={ translate('Ad-hoc subprocess documentation') }>
          { translate('Learn more.') }
        </a>
      </div>
    );
  },
  'messageSubscriptionCorrelationKey': (element) => {
    const translate = useService('translate');

    return (
      <div>
        <p>
          { translate('Identifier computed from the process context that is used to correlate an incoming message (e.g. ')}<code>= orderId</code>{translate('). ')}
          <a href="https://docs.camunda.io/docs/8.7/components/modeler/bpmn/message-events/#messages" target="_blank" rel="noopener noreferrer" title={ translate('Subscription correlation key documentation') }>
            { translate('Learn more.') }
          </a>        </p>
      </div>
    );
  },
  'group-event-condition': (element) => {

    // const translate = useService('translate');

    // TODO(@jarekdanielak): Link to Conditional Events docs when available
  },
};

export default TooltipProvider;
