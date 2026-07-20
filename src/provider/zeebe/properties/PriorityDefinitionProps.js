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

import { BpmnFeelNumberEntry } from '../../../entries/BpmnFeelNumberEntry';


export function PriorityDefinitionProps(props) {
  const {
    element
  } = props;

  if (!isZeebeUserTask(element)) {
    return [];
  }

  return [
    {
      id: 'priorityDefinitionPriority',
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
    return (getPriorityDefinition(element) || {}).priority;
  };

  const setValue = (value) => {
    const commands = [];

    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    const priority = typeof value === 'number' ? String(value) : value;

    // (1) ensure PriorityDefinition
    let priorityDefinition = getPriorityDefinition(element);
    const isNullValue = priority === null || priority === '' || priority === undefined;

    if (priorityDefinition && isNullValue) {

      // (2a) remove priority definition if it exists and priority is set to null
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: extensionElements.get('values').filter(v => v !== priorityDefinition)
          }
        }
      });

    } else if (priorityDefinition && !isNullValue) {

      // (2b) update priority definition if it already exists
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: priorityDefinition,
          properties: { priority }
        }
      });

    } else if (!priorityDefinition && !isNullValue) {

      // (2c) create priority definition if it does not exist
      priorityDefinition = createElement(
        'zeebe:PriorityDefinition',
        { priority },
        extensionElements,
        bpmnFactory
      );

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), priorityDefinition ]
          }
        }
      });
    }

    // (3) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return BpmnFeelNumberEntry({
    element,
    id: 'priorityDefinitionPriority',
    label: translate('Priority'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}


// helper ///////////////////////

export function getPriorityDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:PriorityDefinition')[0];
}

function isZeebeUserTask(element) {
  const businessObject = getBusinessObject(element);

  return is(element, 'bpmn:UserTask') && !!getExtensionElementsList(businessObject, 'zeebe:UserTask')[0];
}