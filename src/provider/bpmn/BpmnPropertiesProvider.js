import Group from '@bpmn-io/properties-panel/lib/components/Group';

import {
  DocumentationProps,
  ErrorProps,
  ExecutableProps,
  IdProps,
  LinkProps,
  MessageProps,
  NameProps,
  ProcessProps,
  SignalProps
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

function getGroups(element) {

  const groups = [
    GeneralGroup(element),
    DocumentationGroup(element),
    ErrorGroup(element),
    LinkGroup(element),
    MessageGroup(element),
    SignalGroup(element)
  ];

  // contract: if a group returns null, it should not be displayed at all
  return groups.filter(group => group !== null);
}

export default class BpmnPropertiesProvider {

  constructor(propertiesPanel) {
    propertiesPanel.registerProvider(this);
  }

  getGroups(element) {
    return (groups) => {
      groups = groups.concat(getGroups(element));
      return groups;
    };
  }

}

BpmnPropertiesProvider.$inject = [ 'propertiesPanel' ];
