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


export function TaskScheduleProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:UserTask')) {
    return [];
  }

  return [
    {
      id: 'taskScheduleDueDate',
      component: DueDate,
      isEdited: isFeelEntryEdited
    },
    {
      id: 'taskScheduleFollowUpDate',
      component: FollowUpDate,
      isEdited: isFeelEntryEdited
    }
  ];
}

function DueDate(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    const taskSchedule = getTaskSchedule(element);

    if (!taskSchedule) {
      return;
    }

    return taskSchedule.get('dueDate');
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
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: { extensionElements }
        }
      });
    }

    // (2) ensure zeebe:TaskSchedule
    let taskSchedule = getTaskSchedule(element);

    if (!taskSchedule) {
      taskSchedule = createElement(
        'zeebe:TaskSchedule',
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
            values: [ ...extensionElements.get('values'), taskSchedule ]
          }
        }
      });
    }

    // (3) update zeebe:dueDate
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: taskSchedule,
        properties: { dueDate: value }
      }
    });

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return FeelEntryWithVariableContext({
    element,
    id: 'taskScheduleDueDate',
    label: translate('Due date'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}

function FollowUpDate(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    const taskSchedule = getTaskSchedule(element);

    if (!taskSchedule) {
      return;
    }

    return taskSchedule.get('followUpDate');
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
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: businessObject,
          properties: { extensionElements }
        }
      });
    }

    // (2) ensure zeebe:TaskSchedule
    let taskSchedule = getTaskSchedule(element);

    if (!taskSchedule) {
      taskSchedule = createElement(
        'zeebe:TaskSchedule',
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
            values: [ ...extensionElements.get('values'), taskSchedule ]
          }
        }
      });
    }

    // (3) update zeebe:followUpDate
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: taskSchedule,
        properties: { followUpDate: value }
      }
    });

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return FeelEntryWithVariableContext({
    element,
    id: 'taskScheduleFollowUpDate',
    label: translate('Follow up date'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}


// helper ///////////////////////

export function getTaskSchedule(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:TaskSchedule')[0];
}
