import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import { isFeelEntryEdited } from '@bpmn-io/properties-panel';

import {
  getExtensionElementsList
} from '../../../utils/ExtensionElementsUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import { useService } from '../../../hooks';

import {
  isZeebeServiceTask
} from '../utils/ZeebeServiceTaskUtil';

import { FeelEntryWithVariableContext } from '../../../entries/FeelEntryWithContext';
import { isArray } from 'min-dash';


export function TaskDefinitionProps(props) {
  const {
    element
  } = props;

  const elements = isArray(element) ? element : [ element ];

  if (!elements.every(isZeebeServiceTask)) {
    return [];
  }

  return [
    {
      id: 'taskDefinitionType',
      component: TaskDefinitionType,
      isEdited: isFeelEntryEdited
    },
    {
      id: 'taskDefinitionRetries',
      component: TaskDefinitionRetries,
      isEdited: isFeelEntryEdited
    }
  ];
}

function TaskDefinitionType(props) {
  const {
    element,
    id
  } = props;

  const elements = isArray(element) ? element : [ element ];

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const firstElement = elements[ 0 ];

  const sameValue = elements.every((element) => {
    return (getTaskDefinition(element) || {}).type === (getTaskDefinition(firstElement) || {}).type;
  });

  const getValue = () => {
    if (!sameValue) {
      return '';
    }

    return (getTaskDefinition(firstElement) || {}).type;
  };

  const setValue = (value) => {
    const commands = [];

    for (const _element of elements) {
      const businessObject = getBusinessObject(_element);

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
          cmd: 'element.updateModdleProperties',
          context: {
            element: _element,
            moddleElement: businessObject,
            properties: { extensionElements }
          }
        });
      }

      // (2) ensure task definition
      let taskDefinition = getTaskDefinition(_element);

      if (!taskDefinition) {
        taskDefinition = createElement(
          'zeebe:TaskDefinition',
          { },
          extensionElements,
          bpmnFactory
        );

        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            element: _element,
            moddleElement: extensionElements,
            properties: {
              values: [ ...extensionElements.get('values'), taskDefinition ]
            }
          }
        });
      }

      // (3) update task definition type
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element: _element,
          moddleElement: taskDefinition,
          properties: { type: value }
        }
      });
    }

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return FeelEntryWithVariableContext({
    element,
    id,
    label: translate('Job type'),
    feel: 'optional',
    getValue,
    setValue,
    debounce,
    placeholder: sameValue ? null : translate('Multiple values')
  });
}

function TaskDefinitionRetries(props) {
  const {
    element,
    id
  } = props;

  const elements = isArray(element) ? element : [ element ];

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    const firstElement = elements[ 0 ];

    const sameValue = elements.every((element) => {
      return (getTaskDefinition(element) || {}).retries === (getTaskDefinition(firstElement) || {}).retries;
    });

    if (!sameValue) {
      return '';
    }

    return (getTaskDefinition(firstElement) || {}).retries;
  };

  const setValue = (value) => {
    let commands = [];

    for (const _element of elements) {
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
          cmd: 'element.updateModdleProperties',
          context: {
            element: _element,
            moddleElement: businessObject,
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
          cmd: 'element.updateModdleProperties',
          context: {
            element: _element,
            moddleElement: extensionElements,
            properties: {
              values: [ ...extensionElements.get('values'), taskDefinition ]
            }
          }
        });
      }

      // (3) update task definition retries
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element: _element,
          moddleElement: taskDefinition,
          properties: { retries: value }
        }
      });
    }

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return FeelEntryWithVariableContext({
    element,
    id,
    label: translate('Retries'),
    feel: 'optional',
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
