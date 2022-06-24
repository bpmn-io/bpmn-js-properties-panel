import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  sortBy
} from 'min-dash';

import { TextFieldEntry, isTextFieldEntryEdited, isSelectEntryEdited } from '@bpmn-io/properties-panel';
import ReferenceSelect from '../../../entries/ReferenceSelect';

import { useService } from '../../../hooks';

import {
  getMessage,
  getMessageEventDefinition,
  isMessageSupported
} from '../utils/EventDefinitionUtil';

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

  const message = getMessage(element);

  let entries = [
    {
      id: 'messageRef',
      component: MessageRef,
      isEdited: isSelectEntryEdited
    }
  ];

  if (message) {
    entries = [
      ...entries,
      {
        id: 'messageName',
        component: MessageName,
        isEdited: isTextFieldEntryEdited
      },
    ];
  }

  return entries;
}

function MessageRef(props) {
  const { element } = props;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
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
    const commands = [];

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

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: root,
          properties: {
            rootElements: [ ...root.get('rootElements'), message ]
          }
        }
      });
    }

    // (2) update (or remove) messageRef
    message = message || findRootElementById(messageEventDefinition, 'bpmn:Message', value);

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: messageEventDefinition,
        properties: {
          messageRef: message
        }
      }
    });

    // (3) commit all updates
    return commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  const getOptions = () => {

    let options = [
      { value: EMPTY_OPTION, label: translate('<none>') },
      { value: CREATE_NEW_OPTION, label: translate('Create new ...') }
    ];

    const messages = findRootElementsByType(getBusinessObject(element), 'bpmn:Message');

    sortByName(messages).forEach(message => {
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

function MessageName(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const message = getMessage(element);

  const getValue = () => {
    return message.get('name');
  };

  const setValue = (value) => {
    return commandStack.execute(
      'element.updateModdleProperties',
      {
        element,
        moddleElement: message,
        properties: {
          name: value
        }
      }
    );
  };

  return TextFieldEntry({
    element,
    id: 'messageName',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}


// helper /////////////////////////

function sortByName(elements) {
  return sortBy(elements, e => (e.name || '').toLowerCase());
}