import { Group, ListGroup } from '@bpmn-io/properties-panel';

import {
  AssignmentDefinitionProps,
  BusinessRuleImplementationProps,
  CalledDecisionProps,
  ConditionProps,
  FormProps,
  HeaderProps,
  InputProps,
  MessageProps,
  MultiInstanceProps,
  OutputPropagationProps,
  OutputProps,
  TargetProps,
  TaskDefinitionProps,
  TimerProps
} from './properties';
import { isMessageEndEvent, isMessageThrowEvent } from './utils/ZeebeServiceTaskUtil';

const LOW_PRIORITY = 500;

const ZEEBE_GROUPS = [
  BusinessRuleImplementationGroup,
  CalledDecisionGroup,
  TaskDefinitionGroup,
  AssignmentDefinitionGroup,
  FormGroup,
  ConditionGroup,
  TargetGroup,
  InputGroup,
  OutputPropagationGroup,
  OutputGroup,
  HeaderGroup
];

export default class ZeebePropertiesProvider {

  constructor(propertiesPanel, injector) {
    propertiesPanel.registerProvider(LOW_PRIORITY, this);

    this._injector = injector;
  }

  getGroups(element) {
    return (groups) => {

      // (1) add zeebe specific groups
      groups = groups.concat(this._getGroups(element));

      // (2) update existing groups with zeebe specific properties
      updateMessageGroup(groups, element);
      updateTimerGroup(groups, element);
      updateMultiInstanceGroup(groups, element);

      // (3) remove message group when not applicable
      groups = removeMessageGroup(groups, element);

      return groups;
    };
  }

  _getGroups(element) {
    const groups = ZEEBE_GROUPS.map(createGroup => createGroup(element, this._injector));

    return groups.filter(group => group !== null);
  }

}

ZeebePropertiesProvider.$inject = [ 'propertiesPanel', 'injector' ];


function CalledDecisionGroup(element) {
  const group = {
    id: 'calledDecision',
    label: 'Called decision',
    entries: [
      ...CalledDecisionProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function TaskDefinitionGroup(element) {
  const group = {
    id: 'taskDefinition',
    label: 'Task definition',
    entries: [
      ...TaskDefinitionProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function InputGroup(element, injector) {
  const group = {
    id: 'inputs',
    label: 'Inputs',
    component: ListGroup,
    ...InputProps({ element, injector })
  };

  return group.items ? group : null;
}

function OutputGroup(element, injector) {
  const group = {
    id: 'outputs',
    label: 'Outputs',
    component: ListGroup,
    ...OutputProps({ element, injector })
  };

  return group.items ? group : null;
}

function ConditionGroup(element) {
  const group = {
    id: 'condition',
    label: 'Condition',
    entries: [
      ...ConditionProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function FormGroup(element) {
  const group = {
    id: 'form',
    label: 'Form',
    entries: [
      ...FormProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function TargetGroup(element) {
  const group = {
    id: 'calledElement',
    label: 'Called element',
    entries: [
      ...TargetProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function HeaderGroup(element, injector) {
  const group = {
    id: 'headers',
    label: 'Headers',
    component: ListGroup,
    ...HeaderProps({ element, injector })
  };

  return group.items ? group : null;
}

function OutputPropagationGroup(element) {
  const group = {
    id: 'outputPropagation',
    label: 'Output propagation',
    entries: [
      ...OutputPropagationProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function BusinessRuleImplementationGroup(element) {
  const group = {
    id: 'businessRuleImplementation',
    label: 'Implementation',
    entries: [
      ...BusinessRuleImplementationProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function AssignmentDefinitionGroup(element) {
  const group = {
    id: 'assignmentDefinition',
    label: 'Assignment',
    entries: [
      ...AssignmentDefinitionProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
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


// helper /////////////////////

function findGroup(groups, id) {
  return groups.find(g => g.id === id);
}
