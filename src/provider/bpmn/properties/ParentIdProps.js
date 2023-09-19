import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

import {
  validateParentId
} from '../utils/ValidationUtil';


/**
 * @typedef { import('@bpmn-io/properties-panel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
export function ParentIdProps(props) {

  const {
    element
  } = props;

  if (!is(element, 'bpmn:Process')) {
    return [];
  }

  return [
    {
      id: 'parentId',
      component: ParentId,
      isEdited: isTextFieldEntryEdited
    }
  ];
}

function ParentId(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack');
  const debounce = useService('debounceInput');
  const translate = useService('translate');
  const process = getProcess(element);

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: process,
      properties: {
        'camunda:parentId': value
      }
    });
  };

  const getValue = (element) => {
    return process.get('camunda:parentId') || '';
  };

  const validate = (value) => {
    return validateParentId(getValue(), translate);
  };

  return TextFieldEntry({
    element,
    id: 'parentId',
    label: translate('Parent ID'),
    getValue,
    setValue,
    debounce,
    validate
  });
}

// helper /////////////////////

function getProcess(element) {
  return is(element, 'bpmn:Process') ?
    getBusinessObject(element) :
    getBusinessObject(element).get('processRef');
}