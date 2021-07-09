import Group from '@bpmn-io/properties-panel/src/components/Group';

import { is } from 'bpmn-js/lib/util/ModelUtil';


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
      updateGeneralGroup(groups);

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

// @TODO: implement
function updateGeneralGroup(element) {}

// @TODO: implement
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

  return group;
}

// @TODO: implement
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

  return group;
}

// @TODO: implement
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

  return group;
}

// @TODO: implement
function LinkGroup(element) {
  const group = {
    label: 'Link',
    id: 'CamundaPlatform__Link',
    component: Group,
    entries: []
  };

  return group;
}

// @TODO: implement
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

  return group;
}

// @TODO: implement
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

  return group;
}

// @TODO: implement
function ErrorGroup(element) {
  const group = {
    label: 'Error',
    id: 'CamundaPlatform__Error',
    component: Group,
    entries: []
  };

  return group;
}

// @TODO: implement
function ConditionalGroup(element) {
  const group = {
    label: 'Conditional',
    id: 'CamundaPlatform__Conditional',
    component: Group,
    entries: []
  };

  return group;
}

// @TODO: implement
function InitiatorGroup(element) {
  const group = {
    label: 'Initiator',
    id: 'CamundaPlatform__Initiator',
    component: Group,
    entries: []
  };

  return group;
}

// @TODO: implement
function ExternalTaskGroup(element) {
  const group = {
    label: 'External Task',
    id: 'CamundaPlatform__ExternalTask',
    component: Group,
    entries: []
  };

  return group;
}

// @TODO: implement
function MultiInstanceGroup(element) {
  const group = {
    label: 'Multi Instance',
    id: 'CamundaPlatform__MultiInstance',
    component: Group,
    entries: []
  };

  return group;
}

// @TODO: implement
function AsyncContinuationGroup(element) {
  const group = {
    label: 'Async Continuation',
    id: 'CamundaPlatform__AsyncContinuation',
    component: Group,
    entries: []
  };

  return group;
}

// @TODO: implement
function JobConfigurationGroup(element) {
  const group = {
    label: 'Job Configuration',
    id: 'CamundaPlatform__JobConfiguration',
    component: Group,
    entries: []
  };

  return group;
}

// @TODO: implement
function CandidateStarterGroup(element) {
  const group = {
    label: 'Candidate Starter',
    id: 'CamundaPlatform__CandidateStarter',
    component: Group,
    entries: []
  };

  return group;
}

// @TODO: implement
function HistoryTimeToLiveGroup(element) {
  const group = {
    label: 'History Time To Live',
    id: 'CamundaPlatform__HistoryTimeToLive',
    component: Group,
    entries: []
  };

  return group;
}

// @TODO: implement
function TasklistGroup(element) {
  const group = {
    label: 'Tasklist',
    id: 'CamundaPlatform__Tasklist',
    component: Group,
    entries: []
  };

  return group;
}

// @TODO: implement
function VariablesMappingGroup(element) {
  const group = {
    label: 'Variables Mapping',
    id: 'CamundaPlatform__VariablesMapping',
    component: Group,
    entries: []
  };

  return group;
}

// @TODO: implement
function ProcessVariablesGroup(element) {
  const group = {
    label: 'Process Variables',
    id: 'CamundaPlatform__ProcessVariables',
    component: Group,
    entries: []
  };

  return group;
}

// @TODO: implement
function FormGroup(element) {
  const group = {
    label: 'Form',
    id: 'CamundaPlatform__Form',
    component: Group,
    entries: []
  };

  return group;
}

// @TODO: implement
function ListenerGroup(element) {
  const group = {
    label: 'Listener',
    id: 'CamundaPlatform__Listener',
    component: Group,
    entries: []
  };

  return group;
}

// @TODO: implement
function InputOutputGroup(element) {
  const group = {
    label: 'Input Output',
    id: 'CamundaPlatform__InputOutput',
    component: Group,
    entries: []
  };

  return group;
}

// @TODO: implement
function ConnectorGroup(element) {
  const group = {
    label: 'Connector',
    id: 'CamundaPlatform__Connector',
    component: Group,
    entries: []
  };

  return group;
}

// @TODO: implement
function FieldInjectionGroup(element) {
  const group = {
    label: 'Field Injection',
    id: 'CamundaPlatform__FieldInjection',
    component: Group,
    entries: []
  };

  return group;
}

// @TODO: implement
function ExtensionElementsGroup(element) {
  const group = {
    label: 'Extension Elements',
    id: 'CamundaPlatform__ExtensionElements',
    component: Group,
    entries: []
  };

  return group;
}

