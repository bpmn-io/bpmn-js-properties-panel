import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { isFeelEntryEdited } from '@bpmn-io/properties-panel';

import {
  getExtensionElementsList
} from '../../../utils/ExtensionElementsUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  useService
} from '../../../hooks';

import { BpmnFeelEntry } from '../../../entries/BpmnFeelEntry';

import { isZeebeServiceTask } from '../utils/ZeebeServiceTaskUtil';

import { getSingletonEntryId } from '../utils/EntryIdUtil';


export function JobPriorityDefinitionProps(props) {
  const {
    element
  } = props;

  if (!isZeebeServiceTask(element) && !isProcess(element)) {
    return [];
  }

  return [
    {
      id: getSingletonEntryId('zeebe:JobPriorityDefinition', 'priority'),
      component: Priority,
      isEdited: isFeelEntryEdited
    }
  ];
}

function Priority(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return (getJobPriorityDefinition(element) || {}).priority;
  };

  const setValue = (value) => {
    const commands = [];

    const businessObject = getElementBusinessObject(element);

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
          element,
          moddleElement: businessObject,
          properties: { extensionElements }
        }
      });
    }

    let jobPriorityDefinition = getJobPriorityDefinition(element);

    // (2) ensure JobPriorityDefinition
    if (!jobPriorityDefinition) {
      jobPriorityDefinition = createElement(
        'zeebe:JobPriorityDefinition',
        {},
        extensionElements,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), jobPriorityDefinition ]
          }
        }
      });
    }

    // (3) update job priority definition priority
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: jobPriorityDefinition,
        properties: { priority: value }
      }
    });

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return BpmnFeelEntry({
    element,
    id: getSingletonEntryId('zeebe:JobPriorityDefinition', 'priority'),
    label: translate('Priority'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}


// helper ///////////////////////

function getJobPriorityDefinition(element) {
  const businessObject = getElementBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:JobPriorityDefinition')[0];
}

function getElementBusinessObject(element) {
  const businessObject = getBusinessObject(element);
  return is(element, 'bpmn:Participant') ? businessObject.get('processRef') : businessObject;
}

function isProcess(element) {
  const businessObject = getBusinessObject(element);
  return is(element, 'bpmn:Process') ||
    (is(element, 'bpmn:Participant') && !!businessObject.get('processRef'));
}
