import { Group, ListGroup } from '@bpmn-io/properties-panel';

import { findIndex } from 'min-dash';

import { arrayMoveMutable } from 'array-move';

import {
  AsynchronousContinuationsProps,
  BusinessKeyProps,
  CallActivityProps,
  CandidateStarterProps,
  ConditionProps,
  ConnectorInputProps,
  ConnectorOutputProps,
  ErrorProps,
  ErrorsProps,
  EscalationProps,
  ExternalTaskPriorityProps,
  FieldInjectionProps,
  FormDataProps,
  FormProps,
  HistoryCleanupProps,
  ImplementationProps,
  InitiatorProps,
  InMappingPropagationProps,
  InMappingProps,
  InputProps,
  JobExecutionProps,
  MultiInstanceProps,
  OutMappingPropagationProps,
  OutMappingProps,
  OutputProps,
  ExecutionListenerProps,
  TaskListenerProps,
  ProcessVariablesProps,
  ScriptTaskProps,
  TasklistProps,
  TimerProps,
  UserAssignmentProps,
  VersionTagProps
} from './properties';

import { ExtensionPropertiesProps } from '../shared/ExtensionPropertiesProps';

const LOW_PRIORITY = 500;

const CAMUNDA_PLATFORM_GROUPS = [
  HistoryCleanupGroup,
  TasklistGroup,
  CandidateStarterGroup,
  ImplementationGroup,
  ExternalTaskGroup,
  ProcessVariablesGroup,
  ErrorsGroup,
  UserAssignmentGroup,
  FormGroup,
  FormDataGroup,
  TaskListenerGroup,
  StartInitiatorGroup,
  ScriptGroup,
  ConditionGroup,
  CallActivityGroup,
  AsynchronousContinuationsGroup,
  JobExecutionGroup,
  InMappingPropagationGroup,
  InMappingGroup,
  InputGroup,
  ConnectorInputGroup,
  OutMappingPropagationGroup,
  OutMappingGroup,
  OutputGroup,
  ConnectorOutputGroup,
  ExecutionListenerGroup,
  ExtensionPropertiesGroup,
  FieldInjectionGroup,
  BusinessKeyGroup
];

/**
 * Provides `camunda` namespace properties.
 *
 * @example
 * ```javascript
 * import BpmnModeler from 'bpmn-js/lib/Modeler';
 * import {
 *   BpmnPropertiesPanelModule,
 *   BpmnPropertiesProviderModule,
 *   CamundaPlatformPropertiesProviderModule
 * } from 'bpmn-js-properties-panel';
 *
 * const modeler = new BpmnModeler({
 *   container: '#canvas',
 *   propertiesPanel: {
 *     parent: '#properties'
 *   },
 *   additionalModules: [
 *     BpmnPropertiesPanelModule,
 *     BpmnPropertiesProviderModule,
 *     CamundaPlatformPropertiesProviderModule
 *   ]
 * });
 * ```
 */
export default class CamundaPlatformPropertiesProvider {

  constructor(propertiesPanel, injector) {
    propertiesPanel.registerProvider(LOW_PRIORITY, this);

    this._injector = injector;
  }

  getGroups(element) {
    return (groups) => {

      // (1) add Camunda Platform specific groups
      groups = groups.concat(this._getGroups(element));

      // (2) update existing groups with Camunda Platform specific properties
      updateGeneralGroup(groups, element);
      updateErrorGroup(groups, element);
      updateEscalationGroup(groups, element);
      updateMultiInstanceGroup(groups, element);
      updateTimerGroup(groups, element);

      // (3) move groups given specific priorities
      moveImplementationGroup(groups);

      return groups;
    };
  }

  _getGroups(element) {
    const groups = CAMUNDA_PLATFORM_GROUPS.map(createGroup => createGroup(element, this._injector));

    // contract: if a group returns null, it should not be displayed at all
    return groups.filter(group => group !== null);
  }
}

CamundaPlatformPropertiesProvider.$inject = [ 'propertiesPanel', 'injector' ];

/**
 * This ensures the <Implementation> group always locates after <Documentation>
 */
function moveImplementationGroup(groups) {
  const documentationGroupIdx = findGroupIndex(groups, 'documentation');

  if (documentationGroupIdx < 0) {
    return;
  }

  return moveGroup(groups, 'CamundaPlatform__Implementation', documentationGroupIdx + 1);
}

function updateGeneralGroup(groups, element) {

  const generalGroup = findGroup(groups, 'general');

  if (!generalGroup) {
    return;
  }

  const { entries } = generalGroup;

  // (1) add version tag before executable (if existing)
  const executableEntry = findIndex(entries, (entry) => entry.id === 'isExecutable');
  const insertIndex = executableEntry >= 0 ? executableEntry : entries.length;

  entries.splice(insertIndex, 0, ...VersionTagProps({ element }));
}

function updateErrorGroup(groups, element) {
  const errorGroup = findGroup(groups, 'error');

  if (!errorGroup) {
    return;
  }

  const { entries } = errorGroup;

  ErrorProps({ element, entries });
}

function updateMultiInstanceGroup(groups, element) {
  const multiInstanceGroup = findGroup(groups, 'multiInstance');

  if (!multiInstanceGroup) {
    return;
  }

  const { entries } = multiInstanceGroup;

  MultiInstanceProps({ element, entries });
}

function updateEscalationGroup(groups, element) {
  const escalationGroup = findGroup(groups, 'escalation');

  if (!escalationGroup) {
    return;
  }

  const { entries } = escalationGroup;

  EscalationProps({ element, entries });
}

function updateTimerGroup(groups, element) {
  const timerEventGroup = findGroup(groups, 'timer');

  if (!timerEventGroup) {
    return;
  }

  timerEventGroup.entries = [
    ...TimerProps({ element })
  ];
}

function ImplementationGroup(element, injector) {
  const translate = injector.get('translate');

  const group = {
    label: translate('Implementation'),
    id: 'CamundaPlatform__Implementation',
    component: Group,
    entries: [
      ...ImplementationProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function ErrorsGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Errors'),
    id: 'CamundaPlatform__Errors',
    component: ListGroup,
    ...ErrorsProps({ element, injector })
  };

  if (group.items) {
    return group;
  }

  return null;
}

function UserAssignmentGroup(element, injector) {
  const translate = injector.get('translate');

  const group = {
    label: translate('User assignment'),
    id: 'CamundaPlatform__UserAssignment',
    component: Group,
    entries: [
      ...UserAssignmentProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function ScriptGroup(element, injector) {
  const translate = injector.get('translate');

  const group = {
    label: translate('Script'),
    id: 'CamundaPlatform__Script',
    component: Group,
    entries: [
      ...ScriptTaskProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function CallActivityGroup(element, injector) {
  const translate = injector.get('translate');

  const group = {
    label: translate('Called element'),
    id: 'CamundaPlatform__CallActivity',
    component: Group,
    entries: [ ...CallActivityProps({ element }) ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function ConditionGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Condition'),
    id: 'CamundaPlatform__Condition',
    component: Group,
    entries: [
      ...ConditionProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function StartInitiatorGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Start initiator'),
    id: 'CamundaPlatform__StartInitiator',
    component: Group,
    entries: [
      ...InitiatorProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function ExternalTaskGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('External task'),
    id: 'CamundaPlatform__ExternalTask',
    component: Group,
    entries: [
      ...ExternalTaskPriorityProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function AsynchronousContinuationsGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Asynchronous continuations'),
    id: 'CamundaPlatform__AsynchronousContinuations',
    component: Group,
    entries: [
      ...AsynchronousContinuationsProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function JobExecutionGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Job execution'),
    id: 'CamundaPlatform__JobExecution',
    component: Group,
    entries: [
      ...JobExecutionProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function CandidateStarterGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Candidate starter'),
    id: 'CamundaPlatform__CandidateStarter',
    component: Group,
    entries: [
      ...CandidateStarterProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function FieldInjectionGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Field injections'),
    id: 'CamundaPlatform__FieldInjection',
    component: ListGroup,
    ...FieldInjectionProps({ element, injector })
  };

  if (group.items) {
    return group;
  }

  return null;
}

function HistoryCleanupGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('History cleanup'),
    id: 'CamundaPlatform__HistoryCleanup',
    component: Group,
    entries: [
      ...HistoryCleanupProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function TasklistGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Tasklist'),
    id: 'CamundaPlatform__Tasklist',
    component: Group,
    entries: [
      ...TasklistProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function InMappingGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('In mappings'),
    id: 'CamundaPlatform__InMapping',
    component: ListGroup,
    ...InMappingProps({ element, injector })
  };

  if (group.items) {
    return group;
  }

  return null;
}

function InMappingPropagationGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('In mapping propagation'),
    id: 'CamundaPlatform__InMappingPropagation',
    component: Group,
    entries: [
      ...InMappingPropagationProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function OutMappingGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Out mappings'),
    id: 'CamundaPlatform__OutMapping',
    component: ListGroup,
    ...OutMappingProps({ element, injector })
  };

  if (group.items) {
    return group;
  }

  return null;
}

function OutMappingPropagationGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Out mapping propagation'),
    id: 'CamundaPlatform__OutMappingPropagation',
    component: Group,
    entries: [
      ...OutMappingPropagationProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function ProcessVariablesGroup(element, injector) {
  const translate = injector.get('translate');

  const variableProps = ProcessVariablesProps({ element, injector });

  if (!variableProps) {
    return null;
  }

  const group = {
    label: translate('Process variables'),
    id: 'CamundaPlatform__ProcessVariables',
    ...variableProps
  };

  return group;

}

function FormDataGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Form fields'),
    id: 'CamundaPlatform__FormData',
    component: ListGroup,
    ...FormDataProps({ element, injector })
  };

  if (group.items) {
    return group;
  }

  return null;
}

function BusinessKeyGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Business key'),
    id: 'CamundaPlatform__BusinessKey',
    component: Group,
    entries: [
      ...BusinessKeyProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function FormGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Forms'),
    id: 'CamundaPlatform__Form',
    component: Group,
    entries: [
      ...FormProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function ExecutionListenerGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Execution listeners'),
    id: 'CamundaPlatform__ExecutionListener',
    component: ListGroup,
    ...ExecutionListenerProps({ element, injector })
  };

  if (group.items) {
    return group;
  }

  return null;
}

function TaskListenerGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Task listeners'),
    id: 'CamundaPlatform__TaskListener',
    component: ListGroup,
    ...TaskListenerProps({ element, injector })
  };

  if (group.items) {
    return group;
  }

  return null;
}

function InputGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Inputs'),
    id: 'CamundaPlatform__Input',
    component: ListGroup,
    ...InputProps({ element, injector })
  };

  if (group.items) {
    return group;
  }

  return null;
}

function OutputGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Outputs'),
    id: 'CamundaPlatform__Output',
    component: ListGroup,
    ...OutputProps({ element, injector })
  };

  if (group.items) {
    return group;
  }

  return null;
}

function ConnectorInputGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Connector inputs'),
    id: 'CamundaPlatform__ConnectorInput',
    component: ListGroup,
    ...ConnectorInputProps({ element, injector })
  };

  if (group.items) {
    return group;
  }

  return null;
}

function ConnectorOutputGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Connector outputs'),
    id: 'CamundaPlatform__ConnectorOutput',
    component: ListGroup,
    ...ConnectorOutputProps({ element, injector })
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
    id: 'CamundaPlatform__ExtensionProperties',
    component: ListGroup,
    ...ExtensionPropertiesProps({ element, injector })
  };

  if (group.items) {
    return group;
  }

  return null;
}


// helper /////////////////////

function findGroup(groups, id) {
  return groups.find(g => g.id === id);
}

function findGroupIndex(groups, id) {
  return findIndex(groups, g => g.id === id);
}

function moveGroup(groups, id, position) {
  const groupIndex = findGroupIndex(groups, id);

  if (position < 0 || groupIndex < 0) {
    return;
  }

  return arrayMoveMutable(groups, groupIndex, position);
}
