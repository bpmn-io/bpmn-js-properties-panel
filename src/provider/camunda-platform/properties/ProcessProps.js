import { is } from 'bpmn-js/lib/util/ModelUtil';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import { useCallback } from '@bpmn-io/properties-panel/preact/hooks';

import {
  useService
} from '../../../hooks';

import {
  isIdValid
} from '../../../utils/ValidationUtil';

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
export function ProcessProps(props) {
  const {
    element
  } = props;

  if (!hasProcessRef(element)) {
    return [];
  }

  return [
    {
      id: 'processId',
      component: ProcessId,
      isEdited: isTextFieldEntryEdited
    }
  ];
}

function ProcessId(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const process = element.businessObject.get('processRef');

  const getValue = () => {
    return process.get('id');
  };

  const setValue = (value, error) => {
    if (error) {
      return;
    }

    commandStack.execute(
      'element.updateModdleProperties',
      {
        element,
        moddleElement: process,
        properties: {
          id: value
        }
      }
    );
  };

  const validate = useCallback((value) => {
    return isIdValid(process, value, translate);
  }, [ process, translate ]);

  const description = is(element, 'bpmn:Participant') ?
    translate('This maps to the process definition key.')
    : null;

  return TextFieldEntry({
    element,
    id: 'processId',
    label: translate('Process ID'),
    getValue,
    setValue,
    debounce,
    validate,
    description
  });
}


// helper ////////////////

function hasProcessRef(element) {
  return is(element, 'bpmn:Participant') && element.businessObject.get('processRef');
}