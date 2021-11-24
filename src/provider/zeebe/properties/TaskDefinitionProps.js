import {
  is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import TextField, { isEdited as textFieldIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/TextField';

import {
  getExtensionElementsList
} from '../utils/ExtensionElementsUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  useService
} from '../../../hooks';

import {
  isZeebeServiceTask
} from '../utils/ZeebeServiceTaskUtil';


export function TaskDefinitionProps(props) {
  const {
    element
  } = props;

  if (!isZeebeServiceTask(element)) {
    return [];
  }

  return [
    {
      id: 'taskDefinitionType',
      component: <TaskDefinitionType element={ element } />,
      isEdited: textFieldIsEdited
    },
    {
      id: 'taskDefinitionRetries',
      component: <TaskDefinitionRetries element={ element } />,
      isEdited: textFieldIsEdited
    }
  ];
}

function TaskDefinitionType(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return (getTaskDefinition(element) || {}).type;
  };

  const setValue = (value) => {
    const commands = [];

    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        businessObject,
        bpmnFactory
      );

      commands.push({
        cmd: 'properties-panel.update-businessobject',
        context: {
          element: element,
          businessObject: businessObject,
          properties: { extensionElements }
        }
      });
    }

    // (2) ensure task definition
    let taskDefinition = getTaskDefinition(element);

    if (!taskDefinition) {
      taskDefinition = createElement(
        'zeebe:TaskDefinition',
        { },
        extensionElements,
        bpmnFactory
      );

      commands.push({
        cmd: 'properties-panel.update-businessobject-list',
        context: {
          element: element,
          currentObject: extensionElements,
          propertyName: 'values',
          objectsToAdd: [ taskDefinition ]
        }
      });
    }

    // (3) update task definition type
    commands.push({
      cmd: 'properties-panel.update-businessobject',
      context: {
        element: element,
        businessObject: taskDefinition,
        properties: { type: value }
      }
    });

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return TextField({
    element,
    id: 'taskDefinitionType',
    label: translate('Type'),
    getValue,
    setValue,
    debounce,
    description: getTypeDocumentation(element, translate)
  });
}

function TaskDefinitionRetries(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return (getTaskDefinition(element) || {}).retries;
  };

  const setValue = (value) => {
    let commands = [];

    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        businessObject,
        bpmnFactory
      );

      commands.push({
        cmd: 'properties-panel.update-businessobject',
        context: {
          element: element,
          businessObject: businessObject,
          properties: { extensionElements }
        }
      });
    }

    // (2) ensure task definition
    let taskDefinition = getTaskDefinition(element);

    if (!taskDefinition) {
      taskDefinition = createElement(
        'zeebe:TaskDefinition',
        { },
        extensionElements,
        bpmnFactory
      );

      commands.push({
        cmd: 'properties-panel.update-businessobject-list',
        context: {
          element: element,
          currentObject: extensionElements,
          propertyName: 'values',
          objectsToAdd: [ taskDefinition ]
        }
      });
    }

    // (3) update task definition retries
    commands.push({
      cmd: 'properties-panel.update-businessobject',
      context: {
        element: element,
        businessObject: taskDefinition,
        properties: { retries: value }
      }
    });

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return TextField({
    element,
    id: 'taskDefinitionRetries',
    label: translate('Retries'),
    getValue,
    setValue,
    debounce
  });
}


// helper ///////////////////////

function getTaskDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:TaskDefinition')[0];
}

function getTypeDocumentation(element, translate) {
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
}
