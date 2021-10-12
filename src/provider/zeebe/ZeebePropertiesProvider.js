import Group from '@bpmn-io/properties-panel/lib/components/Group';
import ListGroup from '@bpmn-io/properties-panel/lib/components/ListGroup';

import {
  ConditionProps,
  HeaderProps,
  InputProps,
  MessageProps,
  MultiInstanceProps,
  OutputPropagationProps,
  TargetProps,
  OutputProps,
  TaskDefinitionProps,
  FormProps,
  TimerProps
} from './properties';
import { isMessageEndEvent, isMessageThrowEvent } from './utils/ZeebeServiceTaskUtil';

const LOW_PRIORITY = 500;


function TaskDefinitionGroup(element) {

  const entries = [
    ...TaskDefinitionProps({ element })
  ];

  return {
    id: 'taskDefinition',
    label: 'Task definition',
    entries,
    component: Group
  };
}

function InputGroup(element) {

  return {
    id: 'inputs',
    label: 'Inputs',
    component: ListGroup,
    ...InputProps(element)
  };
}

function OutputGroup(element) {
  return {
    id: 'outputs',
    label: 'Outputs',
    component: ListGroup,
    ...OutputProps(element)
  };
}

function ConditionGroup(element) {

  const entries = [
    ...ConditionProps({ element })
  ];

  return {
    id: 'condition',
    label: 'Condition',
    entries,
    component: Group
  };
}

function FormGroup(element) {

  const entries = [
    ...FormProps({ element })
  ];

  return {
    id: 'form',
    label: 'Form',
    entries,
    component: Group
  };
}

function TargetGroup(element) {

  const entries = [
    ...TargetProps({ element })
  ];

  return {
    id: 'target',
    label: 'Target',
    entries,
    component: Group
  };
}

function HeaderGroup(element) {
  return {
    id: 'headers',
    label: 'Header',
    component: ListGroup,
    ...HeaderProps(element)
  };
}

function OutputPropagationGroup(element) {

  const entries = [
    ...OutputPropagationProps({ element })
  ];

  return {
    id: 'outputPropagation',
    label: 'Output propagation',
    entries,
    component: Group
  };
}

function updateMessageGroup(groups, element) {
  const messageGroup = findGroup(groups, 'message');

  if (!messageGroup) {
    return;
  }

  messageGroup.entries = [
    ...messageGroup.entries,
    ...MessageProps({ element })
  ];
}

// overwrite bpmn generic timerEventDefinition group with zeebe-specific one
function updateTimerGroup(groups, element) {
  const timerEventGroup = findGroup(groups, 'timer');

  if (!timerEventGroup) {
    return;
  }

  timerEventGroup.entries = [
    ...TimerProps({ element })
  ];
}

// overwrite bpmn generic multiInstance group with zeebe-specific one
function updateMultiInstanceGroup(groups, element) {
  const multiInstanceGroup = findGroup(groups, 'multiInstance');

  if (!multiInstanceGroup) {
    return;
  }

  multiInstanceGroup.entries = [
    ...MultiInstanceProps({ element })
  ];
}

// remove message group from Message End Event & Message Throw Event
function removeMessageGroup(groups, element) {
  const messageGroup = findGroup(groups, 'message');

  if (isMessageEndEvent(element) || isMessageThrowEvent(element)) {

    groups = groups.filter(g => g != messageGroup);
  }
  return groups;
}

function getGroups(element) {

  const groups = [];

  const taskDefinitionGroup = TaskDefinitionGroup(element);

  if (taskDefinitionGroup.entries.length) {
    groups.push(taskDefinitionGroup);
  }

  const formGroup = FormGroup(element);

  if (formGroup.entries.length) {
    groups.push(formGroup);
  }

  const conditionGroup = ConditionGroup(element);

  if (conditionGroup.entries.length) {
    groups.push(conditionGroup);
  }

  const targetGroup = TargetGroup(element);

  if (targetGroup.entries.length) {
    groups.push(targetGroup);
  }

  const inputGroup = InputGroup(element);

  if (inputGroup.items) {
    groups.push(InputGroup(element));
  }

  const outputPropagationGroup = OutputPropagationGroup(element);

  if (outputPropagationGroup.entries.length) {
    groups.push(outputPropagationGroup);
  }

  const outputGroup = OutputGroup(element);

  if (outputGroup.items) {
    groups.push(OutputGroup(element));
  }

  const headerGroup = HeaderGroup(element);

  if (headerGroup.items) {
    groups.push(HeaderGroup(element));
  }

  return groups;
}

export default class ZeebePropertiesProvider {

  constructor(propertiesPanel) {
    propertiesPanel.registerProvider(LOW_PRIORITY, this);
  }

  getGroups(element) {
    return (groups) => {

      // (1) add zeebe specific groups
      groups = groups.concat(getGroups(element));

      // (2) update existing groups with zeebe specific properties
      updateMessageGroup(groups, element);
      updateTimerGroup(groups, element);
      updateMultiInstanceGroup(groups, element);

      // (3) remove message group when not applicable
      groups = removeMessageGroup(groups, element);

      return groups;
    };
  }

}

ZeebePropertiesProvider.$inject = [ 'propertiesPanel' ];


// helper /////////////////////

function findGroup(groups, id) {
  return groups.find(g => g.id === id);
}