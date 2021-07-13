import Group from '@bpmn-io/properties-panel/lib/components/Group';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import { findIndex } from 'min-dash';

import {
  VersionTagProps
} from './properties';


const LOW_PRIORITY = 500;

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
 * } from '@bpmn-io/bpmn-properties-panel';
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

  constructor(propertiesPanel) {
    propertiesPanel.registerProvider(LOW_PRIORITY, this);
  }

  getGroups(element) {
    return (groups) => {

      // (1) add Camunda Platform specific groups
      groups = groups.concat(this._getGroups(element));

      // (2) update existing groups with Camunda Platform specific properties
      updateGeneralGroup(groups, element);

      return groups;
    };
  }

  _getGroups(element) {
    const groups = [
      DelegatePropsGroup(element),
      UserTaskGroup(element),
      ScriptTaskGroup(element),
      LinkGroup(element),
      CallActivityGroup(element),
      EventGroup(element),
      ErrorGroup(element),
      ConditionalGroup(element),
      InitiatorGroup(element),
      ExternalTaskGroup(element),
      MultiInstanceGroup(element),
      AsyncContinuationGroup(element),
      JobConfigurationGroup(element),
      CandidateStarterGroup(element),
      HistoryTimeToLiveGroup(element),
      TasklistGroup(element),
      VariablesMappingGroup(element),
      ProcessVariablesGroup(element),
      FormGroup(element),
      ListenerGroup(element),
      InputOutputGroup(element),
      ConnectorGroup(element),
      FieldInjectionGroup(element),
      ExtensionElementsGroup(element)
    ];

    // contract: if a group returns null, it should not be displayed at all
    return groups.filter(group => group !== null);
  }
}

CamundaPlatformPropertiesProvider.$inject = [ 'propertiesPanel' ];

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

// @TODO: implement, hide with no entries in the meantime
function DelegatePropsGroup(element) {

  if (!is(element, 'camunda:ServiceTaskLike')) {
    return null;
  }

  const group = {
    label: 'Delegate Props',
    id: 'CamundaPlatform__DelegateProps',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function UserTaskGroup(element) {

  if (!is(element, 'bpmn:UserTask')) {
    return null;
  }

  const group = {
    label: 'User Task',
    id: 'CamundaPlatform__UserTask',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function ScriptTaskGroup(element) {

  if (!is(element, 'bpmn:ScriptTask')) {
    return null;
  }

  const group = {
    label: 'Script Task',
    id: 'CamundaPlatform__ScriptTask',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function LinkGroup(element) {
  const group = {
    label: 'Link',
    id: 'CamundaPlatform__Link',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function CallActivityGroup(element) {

  if (!is(element, 'bpmn:CallActivity')) {
    return null;
  }

  const group = {
    label: 'Call Activity',
    id: 'CamundaPlatform__CallActivity',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function EventGroup(element) {

  if (!is(element, 'bpmn:Event')) {
    return null;
  }

  const group = {
    label: 'Event',
    id: 'CamundaPlatform__Event',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function ErrorGroup(element) {
  const group = {
    label: 'Error',
    id: 'CamundaPlatform__Error',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function ConditionalGroup(element) {
  const group = {
    label: 'Conditional',
    id: 'CamundaPlatform__Conditional',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function InitiatorGroup(element) {
  const group = {
    label: 'Initiator',
    id: 'CamundaPlatform__Initiator',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function ExternalTaskGroup(element) {
  const group = {
    label: 'External Task',
    id: 'CamundaPlatform__ExternalTask',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function MultiInstanceGroup(element) {
  const group = {
    label: 'Multi Instance',
    id: 'CamundaPlatform__MultiInstance',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function AsyncContinuationGroup(element) {
  const group = {
    label: 'Async Continuation',
    id: 'CamundaPlatform__AsyncContinuation',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function JobConfigurationGroup(element) {
  const group = {
    label: 'Job Configuration',
    id: 'CamundaPlatform__JobConfiguration',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function CandidateStarterGroup(element) {
  const group = {
    label: 'Candidate Starter',
    id: 'CamundaPlatform__CandidateStarter',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function HistoryTimeToLiveGroup(element) {
  const group = {
    label: 'History Time To Live',
    id: 'CamundaPlatform__HistoryTimeToLive',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function TasklistGroup(element) {
  const group = {
    label: 'Tasklist',
    id: 'CamundaPlatform__Tasklist',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function VariablesMappingGroup(element) {
  const group = {
    label: 'Variables Mapping',
    id: 'CamundaPlatform__VariablesMapping',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function ProcessVariablesGroup(element) {
  const group = {
    label: 'Process Variables',
    id: 'CamundaPlatform__ProcessVariables',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function FormGroup(element) {
  const group = {
    label: 'Form',
    id: 'CamundaPlatform__Form',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function ListenerGroup(element) {
  const group = {
    label: 'Listener',
    id: 'CamundaPlatform__Listener',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function InputOutputGroup(element) {
  const group = {
    label: 'Input Output',
    id: 'CamundaPlatform__InputOutput',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function ConnectorGroup(element) {
  const group = {
    label: 'Connector',
    id: 'CamundaPlatform__Connector',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function FieldInjectionGroup(element) {
  const group = {
    label: 'Field Injection',
    id: 'CamundaPlatform__FieldInjection',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function ExtensionElementsGroup(element) {
  const group = {
    label: 'Extension Elements',
    id: 'CamundaPlatform__ExtensionElements',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}


// helper /////////////////////

function findGroup(groups, id) {
  return groups.find(g => g.id === id);
}
