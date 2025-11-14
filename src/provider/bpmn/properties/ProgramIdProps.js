import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

import {
  validateProgramId
} from '../utils/ValidationUtil';

/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
export function ProgramIdProps(props) {

  const {
    element
  } = props;


  if (!is(element, 'bpmn:Task')) {
    return [];
  }

  return [
    {
      id: 'programId',
      component: ProgramId,
      isEdited: isTextFieldEntryEdited
    }
  ];
}

function ProgramId(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const debounce = useService('debounceInput');
  const translate = useService('translate');
  const businessObject = getBusinessObject(element);

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: businessObject,
      properties: {
        'custom:programId': (value || '').toUpperCase()
      }
    });
  };

  const getValue = (element) => {
    return businessObject.get('custom:programId') || '';
  };

  const validate = (value) => {
    return validateProgramId(getValue(), translate);
  };

  return TextFieldEntry({
    element,
    id: 'programId',
    label: translate('Program ID'),
    getValue,
    setValue,
    debounce,
    validate
  });
}
