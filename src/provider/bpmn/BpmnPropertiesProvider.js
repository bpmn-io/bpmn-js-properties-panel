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

function GeneralGroup(element, injector) {
  const translate = injector.get('translate');

  const entries = [
    ...NameProps({ element }),
    ...IdProps({ element }),
    ...ProcessProps({ element }),
    ...ExecutableProps({ element })
  ];

  return {
    id: 'general',
    label: translate('General'),
    entries,
    component: Group
  };

}

function CompensationGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Compensation'),
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

function DocumentationGroup(element, injector) {
  const translate = injector.get('translate');

  const entries = [
    ...DocumentationProps({ element })
  ];

  return {
    id: 'documentation',
    label: translate('Documentation'),
    entries,
    component: Group
  };

}

function ErrorGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'error',
    label: translate('Error'),
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

function MessageGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'message',
    label: translate('Message'),
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

function SignalGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'signal',
    label: translate('Signal'),
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

function LinkGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Link'),
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

function EscalationGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    id: 'escalation',
    label: translate('Escalation'),
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

function TimerGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Timer'),
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

function MultiInstanceGroup(element, injector) {
  const translate = injector.get('translate');
  const group = {
    label: translate('Multi-instance'),
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

function getGroups(element, injector) {

  const groups = [
    GeneralGroup(element, injector),
    DocumentationGroup(element, injector),
    CompensationGroup(element, injector),
    ErrorGroup(element, injector),
    LinkGroup(element, injector),
    MessageGroup(element, injector),
    MultiInstanceGroup(element, injector),
    SignalGroup(element, injector),
    EscalationGroup(element, injector),
    TimerGroup(element, injector)
  ];

  // contract: if a group returns null, it should not be displayed at all
  return groups.filter(group => group !== null);
}

export default class BpmnPropertiesProvider {

  constructor(propertiesPanel, injector) {
    propertiesPanel.registerProvider(this);
    this._injector = injector;
  }

  getGroups(element) {
    return (groups) => {
      groups = groups.concat(getGroups(element, this._injector));
      return groups;
    };
  }

}

BpmnPropertiesProvider.$inject = [ 'propertiesPanel', 'injector' ];
