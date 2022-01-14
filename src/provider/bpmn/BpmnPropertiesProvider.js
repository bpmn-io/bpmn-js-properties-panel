import { Group } from '@bpmn-io/properties-panel';

import {
  CompensationProps,
  DocumentationProps,
  ErrorProps,
  EscalationProps,
  ExecutableProps,
  IdProps,
  LinkProps,
  MessageProps,
  MultiInstanceProps,
  NameProps,
  ProcessProps,
  SignalProps,
  TimerProps
} from './properties';

function GeneralGroup(element) {

  const entries = [
    ...NameProps({ element }),
    ...IdProps({ element }),
    ...ProcessProps({ element }),
    ...ExecutableProps({ element })
  ];

  return {
    id: 'general',
    label: 'General',
    entries,
    component: Group
  };

}

function CompensationGroup(element) {
  const group = {
    label: 'Compensation',
    id: 'compensation',
    component: Group,
    entries: [
      ...CompensationProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function DocumentationGroup(element) {

  const entries = [
    ...DocumentationProps({ element })
  ];

  return {
    id: 'documentation',
    label: 'Documentation',
    entries,
    component: Group
  };

}

function ErrorGroup(element) {
  const group = {
    id: 'error',
    label: 'Error',
    component: Group,
    entries: [
      ...ErrorProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function MessageGroup(element) {
  const group = {
    id: 'message',
    label: 'Message',
    component: Group,
    entries: [
      ...MessageProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function SignalGroup(element) {
  const group = {
    id: 'signal',
    label: 'Signal',
    component: Group,
    entries: [
      ...SignalProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function LinkGroup(element) {
  const group = {
    label: 'Link',
    id: 'link',
    component: Group,
    entries: [
      ...LinkProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function EscalationGroup(element) {
  const group = {
    id: 'escalation',
    label: 'Escalation',
    component: Group,
    entries: [
      ...EscalationProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function TimerGroup(element) {
  const group = {
    label: 'Timer',
    id: 'timer',
    component: Group,
    entries: [
      ...TimerProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function MultiInstanceGroup(element) {
  const group = {
    label: 'Multi-instance',
    id: 'multiInstance',
    component: Group,
    entries: [
      ...MultiInstanceProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function getGroups(element) {

  const groups = [
    GeneralGroup(element),
    DocumentationGroup(element),
    CompensationGroup(element),
    ErrorGroup(element),
    LinkGroup(element),
    MessageGroup(element),
    MultiInstanceGroup(element),
    SignalGroup(element),
    EscalationGroup(element),
    TimerGroup(element)
  ];

  // contract: if a group returns null, it should not be displayed at all
  return groups.filter(group => group !== null);
}

export default class BpmnPropertiesProvider {

  constructor(propertiesPanel, translate) {
    BpmnPropertiesProvider.prototype.translate=translate
    propertiesPanel.registerProvider(this);
  }

  getGroups(element) {
    const translate=this.translate
    return (groups) => {
      groups = groups.concat(getGroups(element));
      // translate group name
      groups.map(function(group){
        group.label=translate(group.label)
      })
      return groups;
    };
  }

}

BpmnPropertiesProvider.$inject = [ 'propertiesPanel','translate' ];
