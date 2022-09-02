import { MessageRef, CREATE_NEW_OPTION } from '../../../src/provider/bpmn/properties/MessageProps';

class GetterSetterValidateProvider {
  constructor(propertiesPanel) {
    propertiesPanel.registerProvider(500, this);
  }

  getGroups() {
    return (groups) => {

      const messageGroup = findGroup(groups, 'message');

      if (!messageGroup) {
        return groups;
      }

      let messageRef = findEntry(messageGroup, 'messageRef');

      if (!messageRef) {
        return groups;
      }

      messageRef.component = CustomMessageRef;

      return groups;
    };
  }
}

function CustomMessageRef(props) {

  const getValue = () => {
    return () => {

      // override default getter
      return CREATE_NEW_OPTION;
    };
  };

  const setValue = (defaultSetter) => {
    return (value) => {

      // notify
      alert(`messageRef is set: ${value}!`);

      // execute default setter
      return defaultSetter(value);
    };
  };

  return MessageRef({
    ...props,
    getValue,
    setValue
  });
}

GetterSetterValidateProvider.$inject = [ 'propertiesPanel' ];

export default {
  __init__: [
    'getterSetterValidateProvider'
  ],
  getterSetterValidateProvider: [ 'type', GetterSetterValidateProvider ]
};


// helper /////////////

function findGroup(groups, id) {
  return groups.find(g => g.id === id);
}

function findEntry(group, id) {
  return group.entries.find(e => e.id === id);
}