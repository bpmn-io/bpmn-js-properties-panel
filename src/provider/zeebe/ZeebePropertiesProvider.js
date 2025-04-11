import { Group, ListGroup } from '@bpmn-io/properties-panel';

import { findIndex } from 'min-dash';

import {
  ActiveElementsProps,
  AdHocCompletionProps,
  AdHocActivityInputSchemaProps,
  AssignmentDefinitionProps,
  BusinessRuleImplementationProps,
  CalledDecisionProps,
  ConditionProps,
  ErrorProps,
  EscalationProps,
  ExecutionListenersProps,
  FormProps,
  HeaderProps,
  InputPropagationProps,
  InputProps,
  MessageProps,
  MultiInstanceProps,
  OutputPropagationProps,
  OutputProps,
  PriorityDefinitionProps,
  ScriptImplementationProps,
  ScriptProps,
  SignalProps,
  TargetProps,
  TaskDefinitionProps,
  TaskListenersProps,
  TaskScheduleProps,
  TimerProps,
  UserTaskImplementationProps,
  VersionTagProps
} from './properties';

import { ExtensionPropertiesProps } from '../shared/ExtensionPropertiesProps';

import { isMessageEndEvent, isMessageThrowEvent } from './utils/ZeebeServiceTaskUtil';

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

const LOW_PRIORITY = 500;

const ZEEBE_GROUPS = [
  AdHocActivityGroup,
  BusinessRuleImplementationGroup,
  CalledDecisionGroup,
  ScriptImplementationGroup,
  ScriptGroup,
  UserTaskImplementationGroup,
  TaskDefinitionGroup,
  AssignmentDefinitionGroup,
  ActiveElementsGroup,
  FormGroup,
  ConditionGroup,
  TargetGroup,
  InputPropagationGroup,
  InputGroup,
  OutputPropagationGroup,
  OutputGroup,
  HeaderGroup,
  TaskListenersGroup,
  ExecutionListenersGroup,
  ExtensionPropertiesGroup,
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
      updateGeneralGroup(groups, element);
      updateErrorGroup(groups, element);
      updateEscalationGroup(groups, element);
      updateMessageGroup(groups, element);
      updateSignalGroup(groups, element);
      updateTimerGroup(groups, element, this._injector);
      updateMultiInstanceGroup(groups, element);
      updateAdHocCompletionGroup(groups, element);

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


function CalledDecisionGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'calledDecision',
    label: translate('Called decision'),
    entries: [
      ...CalledDecisionProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function ScriptGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'script',
    label: translate('Script'),
    entries: [
      ...ScriptProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function TaskDefinitionGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'taskDefinition',
    label: translate('Task definition'),
    entries: [
      ...TaskDefinitionProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function InputGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'inputs',
    label: translate('Inputs'),
    component: ListGroup,
    ...InputProps({ element, injector })
  };

  return group.items ? group : null;
}

function OutputGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'outputs',
    label: translate('Outputs'),
    component: ListGroup,
    ...OutputProps({ element, injector })
  };

  return group.items ? group : null;
}

function ConditionGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'condition',
    label: translate('Condition'),
    entries: [
      ...ConditionProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function FormGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'form',
    label: translate('Form'),
    entries: [
      ...FormProps({ element, injector })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function TargetGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'calledElement',
    label: translate('Called element'),
    entries: [
      ...TargetProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function HeaderGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'headers',
    label: translate('Headers'),
    component: ListGroup,
    ...HeaderProps({ element, injector })
  };

  return group.items ? group : null;
}

function OutputPropagationGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'outputPropagation',
    label: translate('Output propagation'),
    entries: [
      ...OutputPropagationProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function InputPropagationGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'inputPropagation',
    label: translate('Input propagation'),
    entries: [
      ...InputPropagationProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function BusinessRuleImplementationGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'businessRuleImplementation',
    label: translate('Implementation'),
    entries: [
      ...BusinessRuleImplementationProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function ScriptImplementationGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'scriptImplementation',
    label: translate('Implementation'),
    entries: [
      ...ScriptImplementationProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function UserTaskImplementationGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'userTaskImplementation',
    label: translate('Implementation'),
    entries: [
      ...UserTaskImplementationProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function AssignmentDefinitionGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'assignmentDefinition',
    label: translate('Assignment'),
    entries: [
      ...AssignmentDefinitionProps({ element }),
      ...TaskScheduleProps({ element }),
      ...PriorityDefinitionProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function ActiveElementsGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'activeElements',
    label: translate('Active elements'),
    entries: [
      ...ActiveElementsProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function ExecutionListenersGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Execution listeners'),
    id: 'Zeebe__ExecutionListeners',
    component: ListGroup,
    ...ExecutionListenersProps({ element, injector })
  };

  if (group.items) {
    return group;
  }

  return null;
}

function TaskListenersGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Task listeners'),
    id: 'Zeebe__TaskListeners',
    component: ListGroup,
    ...TaskListenersProps({ element, injector })
  };

  if (group.items) {
    return group;
  }

  return null;
}

function ExtensionPropertiesGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Extension properties'),
    id: 'Zeebe__ExtensionProperties',
    component: ListGroup,
    ...ExtensionPropertiesProps({ element, injector, namespace: 'zeebe' })
  };

  if (group.items) {
    return group;
  }

  return null;
}

function AdHocActivityGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'adHocActivity',
    label: translate('Ad-hoc activity'),
    entries: [
      ...AdHocActivityInputSchemaProps({ element })
    ],
    component: Group
  };

  return group.entries.length ? group : null;
}

function updateGeneralGroup(groups, element) {

  const generalGroup = findGroup(groups, 'general');

  if (!generalGroup) {
    return;
  }

  const { entries } = generalGroup;

  const executableEntry = findIndex(entries, (entry) => entry.id === 'isExecutable');
  const insertIndex = executableEntry >= 0 ? executableEntry : entries.length;

  entries.splice(insertIndex, 0, ...VersionTagProps({ element }));
}

function updateErrorGroup(groups, element) {
  const errorGroup = findGroup(groups, 'error');

  if (!errorGroup) {
    return;
  }

  errorGroup.entries = replaceEntries(
    errorGroup.entries,
    ErrorProps({ element })
  );
}

function updateEscalationGroup(groups, element) {
  const escalationGroup = findGroup(groups, 'escalation');

  if (!escalationGroup) {
    return;
  }

  escalationGroup.entries = replaceEntries(
    escalationGroup.entries,
    EscalationProps({ element })
  );
}

function updateSignalGroup(groups, element) {
  const signalGroup = findGroup(groups, 'signal');

  if (!signalGroup) {
    return;
  }

  signalGroup.entries = replaceEntries(
    signalGroup.entries,
    SignalProps({ element })
  );
}

function updateMessageGroup(groups, element) {
  const messageGroup = findGroup(groups, 'message');

  if (!messageGroup) {
    return;
  }

  messageGroup.entries = replaceEntries(
    messageGroup.entries,
    MessageProps({ element })
  );
}

// overwrite bpmn generic timerEventDefinition group with zeebe-specific one
function updateTimerGroup(groups, element, injector) {
  const timerEventGroup = findGroup(groups, 'timer');

  if (!timerEventGroup) {
    return;
  }

  timerEventGroup.entries = [
    ...TimerProps({ element, injector })
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

// overwrite bpmn generic adHoc completion condition with zeebe-specific one
function updateAdHocCompletionGroup(groups, element) {
  const adHocCompletionGroup = findGroup(groups, 'adHocCompletion');
  if (!adHocCompletionGroup) {
    return;
  }

  adHocCompletionGroup.entries = replaceEntriesPreservingOrder(
    adHocCompletionGroup.entries,
    AdHocCompletionProps({ element })
  );

  // reorder groups to move active elements before adHoc completion
  const activeElementsGroup = findGroup(groups, 'activeElements');
  if (activeElementsGroup) {
    reorderGroupsIfNecessary(groups, activeElementsGroup, adHocCompletionGroup);
  }
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

/**
 * Put groups into the defined order if necessary.
 *
 * @param {Group[]} groups
 * @param {Group} firstGroup
 * @param {Group} secondGroup
 */
function reorderGroupsIfNecessary(groups, firstGroup, secondGroup) {
  const firstGroupIndex = groups.indexOf(firstGroup);
  const secondGroupIndex = groups.indexOf(secondGroup);

  if (firstGroupIndex === -1 || secondGroupIndex === -1 || firstGroupIndex <= secondGroupIndex) {
    return;
  }

  groups[firstGroupIndex] = secondGroup;
  groups[secondGroupIndex] = firstGroup;
}

/**
 * Replace entries with the same ID.
 *
 * @param {Entry[]} oldEntries
 * @param {Entry[]} newEntries
 *
 * @returns {Entry[]} combined entries
 */
function replaceEntries(oldEntries, newEntries) {

  const filteredEntries = oldEntries.filter(oldEntry => (
    !newEntries.find(newEntry => newEntry.id === oldEntry.id)
  ));

  return [
    ...filteredEntries,
    ...newEntries
  ];
}

/**
 * Replace entries with the same ID, preserving original order and adding new entries at the end.
 *
 * @param {Entry[]} oldEntries
 * @param {Entry[]} newEntries
 *
 * @returns {Entry[]} combined entries
 */
function replaceEntriesPreservingOrder(oldEntries, newEntries) {
  const indexedNewEntries = indexEntriesById(newEntries);
  const indexedOldEntries = indexEntriesById(oldEntries);

  const result = [];

  // iterate original entries and replace with new ones if ID matches
  oldEntries.forEach((oldEntry) => {
    const newEntryIndex = indexedNewEntries[oldEntry.id];
    if (newEntryIndex !== undefined) {
      result.push(newEntries[newEntryIndex]);
    } else {
      result.push(oldEntry);
    }
  });

  // append remaining new entries
  newEntries.forEach((newEntry) => {
    if (indexedOldEntries[newEntry.id] === undefined) {
      result.push(newEntry);
    }
  });

  return result;
}

function indexEntriesById(entries) {
  return entries.reduce((index, entry, idx) => {
    index[entry.id] = idx;
    return index;
  }, {});
}