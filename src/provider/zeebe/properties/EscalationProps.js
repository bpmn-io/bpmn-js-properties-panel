import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  isFeelEntryEdited
} from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

import {
  getEscalation
} from '../../bpmn/utils/EventDefinitionUtil';

import { FeelEntryWithVariableContext } from '../../../entries/FeelEntryWithContext';


/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
export function EscalationProps(props) {
  const {
    element
  } = props;

  // update throw events only
  if (!is(element, 'bpmn:ThrowEvent')) {
    return [];
  }

  const escalation = getEscalation(element);

  const entries = [];

  if (escalation) {
    entries.push(
      {
        id: 'escalationCode',
        component: EscalationCode,
        isEdited: isFeelEntryEdited
      }
    );
  }

  return entries;
}

function EscalationCode(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const escalation = getEscalation(element);

  const getValue = () => {
    return escalation.get('escalationCode');
  };

  const setValue = (value) => {
    return commandStack.execute(
      'element.updateModdleProperties',
      {
        element,
        moddleElement: escalation,
        properties: {
          escalationCode: value
        }
      }
    );
  };

  return FeelEntryWithVariableContext({
    element,
    id: 'escalationCode',
    label: translate('Code'),
    feel: 'optional',
    getValue,
    setValue,
    debounce
  });
}
