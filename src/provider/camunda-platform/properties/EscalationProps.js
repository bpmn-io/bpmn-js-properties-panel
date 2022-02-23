import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

import {
  getEscalationEventDefinition,
  isEscalationSupported
} from '../../bpmn/utils/EventDefinitionUtil';

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
export function EscalationProps(props) {
  const {
    element,
    entries
  } = props;

  if (!(isEscalationSupported(element) && canHaveEscalationVariables(element))) {
    return entries;
  }

  entries.push(
    {
      id: 'escalationCodeVariable',
      component: EscalationCodeVariable,
      isEdited: isTextFieldEntryEdited
    }
  );

  return entries;
}

function EscalationCodeVariable(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const escalationEventDefinition = getEscalationEventDefinition(element);

  const getValue = () => {
    return escalationEventDefinition.get('camunda:escalationCodeVariable');
  };

  const setValue = (value) => {
    return commandStack.execute(
      'element.updateModdleProperties',
      {
        element,
        moddleElement: escalationEventDefinition,
        properties: {
          'camunda:escalationCodeVariable': value
        }
      }
    );
  };

  return TextFieldEntry({
    element,
    id: 'escalationCodeVariable',
    label: translate('Code variable'),
    description: translate('Define the name of the variable that will contain the escalation code.'),
    getValue,
    setValue,
    debounce
  });
}


// helper ///////////////////////

function canHaveEscalationVariables(element) {
  return is(element, 'bpmn:StartEvent') || is(element, 'bpmn:BoundaryEvent');
}