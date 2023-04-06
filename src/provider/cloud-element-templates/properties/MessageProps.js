import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  sortBy
} from 'min-dash';

import { isSelectEntryEdited } from '@bpmn-io/properties-panel';
import ReferenceSelect from '../../../entries/ReferenceSelect';

import { useService } from '../../../hooks';

import {
  getMessage,
  getMessageEventDefinition,
  isMessageSupported
} from '../../../utils/EventDefinitionUtil';

import {
  createElement,
  findRootElementById,
  findRootElementsByType,
  getRoot,
  nextId
} from '../../../utils/ElementUtil';

export const EMPTY_OPTION = '';
export const CREATE_NEW_OPTION = 'create-new';


/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
export function MessageProps(props) {
  const {
    element
  } = props;

  if (!isMessageSupported(element)) {
    return [];
  }

  return [
    {
      id: 'messageRef',
      component: MessageRef,
      isEdited: isSelectEntryEdited
    }
  ];
}

function MessageRef(props) {
  const { element } = props;

  const bpmnFactory = useService('bpmnFactory');
  const modeling = useService('modeling');
  const translate = useService('translate');

  const messageEventDefinition = getMessageEventDefinition(element);

  const getValue = () => {
    const message = getMessage(element);

    if (message) {
      return message.get('id');
    }

    return EMPTY_OPTION;
  };

  const setValue = (value) => {
    const root = getRoot(messageEventDefinition);

    let message;

    // (1) create new message
    if (value === CREATE_NEW_OPTION) {
      const id = nextId('Message_');

      message = createElement(
        'bpmn:Message',
        { id, name: id },
        root,
        bpmnFactory
      );

      value = message.get('id');
    }

    // (2) update (or remove) messageRef
    message = findRootElementById(messageEventDefinition, 'bpmn:Message', value) || message;

    // (3) commit all updates
    return modeling.updateModdleProperties(element, messageEventDefinition, {
      messageRef: message
    });
  };

  const getOptions = () => {

    let options = [
      { value: EMPTY_OPTION, label: translate('<none>') },
      { value: CREATE_NEW_OPTION, label: translate('Create new ...') }
    ];

    const messages = findRootElementsByType(getBusinessObject(element), 'bpmn:Message');

    const filteredMessages = withoutTemplatedMessages(messages);

    sortByName(filteredMessages).forEach(message => {
      options.push({
        value: message.get('id'),
        label: message.get('name')
      });
    });

    return options;
  };

  return ReferenceSelect({
    element,
    id: 'messageRef',
    label: translate('Global message reference'),
    autoFocusEntry: 'messageName',
    getValue,
    setValue,
    getOptions
  });
}

function withoutTemplatedMessages(messages) {
  return messages.filter(message => !message.get('zeebe:modelerTemplate'));
}


// helper /////////////////////////

function sortByName(elements) {
  return sortBy(elements, e => (e.name || '').toLowerCase());
}