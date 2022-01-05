import { is } from 'bpmn-js/lib/util/ModelUtil';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

import {
  isIdValid
} from '../utils/ValidationUtil';

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
      component: <ProcessId element={ element } />,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'processName',
      component: <ProcessName element={ element } />,
      isEdited: isTextFieldEntryEdited
    }
  ];
}

function ProcessName(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const process = element.businessObject.get('processRef');

  const getValue = () => {
    return process.get('name');
  };

  const setValue = (value) => {
    commandStack.execute(
      'element.updateModdleProperties',
      {
        element,
        moddleElement: process,
        properties: {
          name: value
        }
      }
    );
  };

  return TextFieldEntry({
    element,
    id: 'processName',
    label: translate('Process name'),
    getValue,
    setValue,
    debounce
  });
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

  const setValue = (value) => {
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

  const validate = (value) => {
    return isIdValid(process, value, translate);
  };

  return TextFieldEntry({
    element,
    id: 'processId',
    label: translate('Process ID'),
    getValue,
    setValue,
    debounce,
    validate
  });
}


// helper ////////////////

function hasProcessRef(element) {
  return is(element, 'bpmn:Participant') && element.businessObject.get('processRef');
}