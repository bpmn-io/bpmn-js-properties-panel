import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  sortBy
} from 'min-dash';

import { TextFieldEntry, isSelectEntryEdited, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import ReferenceSelect from '../../../entries/ReferenceSelect';

import {
  useService
} from '../../../hooks';

import {
  getSignal,
  getSignalEventDefinition,
  isSignalSupported
} from '../utils/EventDefinitionUtil';

import {
  createElement,
  findRootElementById,
  findRootElementsByType,
  getRoot,
  nextId
} from '../../../utils/ElementUtil';

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

export const EMPTY_OPTION = '';
export const CREATE_NEW_OPTION = 'create-new';

/**
 * @returns {Entry[]}
 */
export function SignalProps(props) {
  const {
    element
  } = props;

  if (!isSignalSupported(element)) {
    return [];
  }

  const signal = getSignal(element);

  let entries = [
    {
      id: 'signalRef',
      component: SignalRef,
      isEdited: isSelectEntryEdited
    }
  ];

  if (signal) {
    entries = [
      ...entries,
      {
        id: 'signalName',
        component: SignalName,
        isEdited: isTextFieldEntryEdited
      },
    ];
  }

  return entries;
}

function SignalRef(props) {
  const { element } = props;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const signalEventDefinition = getSignalEventDefinition(element);

  const getValue = () => {
    const signal = getSignal(element);

    if (signal) {
      return signal.get('id');
    }

    return EMPTY_OPTION;
  };

  const setValue = (value) => {
    const root = getRoot(signalEventDefinition);
    const commands = [];

    let signal;

    // (1) create new signal
    if (value === CREATE_NEW_OPTION) {
      const id = nextId('Signal_');

      signal = createElement(
        'bpmn:Signal',
        { id, name: id },
        root,
        bpmnFactory
      );

      value = signal.get('id');

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: root,
          properties: {
            rootElements: [ ...root.get('rootElements'), signal ]
          }
        }
      });
    }

    // (2) update (or remove) signalRef
    signal = signal || findRootElementById(signalEventDefinition, 'bpmn:Signal', value);

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: signalEventDefinition,
        properties: {
          signalRef: signal
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

    const signals = findRootElementsByType(getBusinessObject(element), 'bpmn:Signal');

    sortByName(signals).forEach(signal => {
      options.push({
        value: signal.get('id'),
        label: signal.get('name')
      });
    });

    return options;
  };

  return ReferenceSelect({
    element,
    id: 'signalRef',
    label: translate('Global signal reference'),
    autoFocusEntry: 'signalName',
    getValue,
    setValue,
    getOptions
  });
}

function SignalName(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const signal = getSignal(element);

  const getValue = () => {
    return signal.get('name');
  };

  const setValue = (value) => {
    return commandStack.execute(
      'element.updateModdleProperties',
      {
        element,
        moddleElement: signal,
        properties: {
          name: value
        }
      }
    );
  };

  return TextFieldEntry({
    element,
    id: 'signalName',
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
