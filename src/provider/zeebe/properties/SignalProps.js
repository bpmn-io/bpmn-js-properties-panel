import { isFeelEntryEdited } from '@bpmn-io/properties-panel';

import { FeelEntryWithVariableContext } from '../../../entries/FeelEntryWithContext';

import {
  useService
} from '../../../hooks';

import {
  getSignal,
  isSignalSupported
} from '../../../utils/EventDefinitionUtil';

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

  let entries = [];

  if (signal) {
    entries = [
      ...entries,
      {
        id: 'signalName',
        component: SignalName,
        isEdited: isFeelEntryEdited
      },
    ];
  }

  return entries;
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

  return FeelEntryWithVariableContext({
    element,
    id: 'signalName',
    label: translate('Name'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}