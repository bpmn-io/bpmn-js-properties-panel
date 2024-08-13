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

import { FeelEntryWithVariableContext } from '../../../entries/FeelEntryWithContext';


export function PriorityDefinitionProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:UserTask')) {
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

    // (2) ensure PriorityDefinition
    let priorityDefinition = getPriorityDefinition(element);
    const isNullValue = value === null || value === '' || value === undefined;

    if (priorityDefinition && isNullValue) {

      // (3a) remove priority definition if it exists and priority is set to null
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

      // (3b) update priority definition if it already exists
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: priorityDefinition,
          properties: { priority: value }
        }
      });

    } else if (!priorityDefinition && !isNullValue) {

      // (3c) create priority definition if it does not exist
      priorityDefinition = createElement(
        'zeebe:PriorityDefinition',
        { priority: value },
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

    // (4) commit all updates
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return FeelEntryWithVariableContext({
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
