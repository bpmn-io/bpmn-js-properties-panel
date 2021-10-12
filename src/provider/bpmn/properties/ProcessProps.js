import { is } from 'bpmn-js/lib/util/ModelUtil';

import TextField, { isEdited as textFieldIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/TextField';

import {
  useService
} from '../../../hooks';

import {
  isIdValid
} from '../utils/ValidationUtil';

/**
 * @typedef { import('@bpmn-io/properties-panel/lib/PropertiesPanel').EntryDefinition } Entry
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
      isEdited: textFieldIsEdited
    },
    {
      id: 'processName',
      component: <ProcessName element={ element } />,
      isEdited: textFieldIsEdited
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
      'properties-panel.update-businessobject',
      {
        element,
        businessObject: process,
        properties: {
          name: value
        }
      }
    );
  };

  return TextField({
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
      'properties-panel.update-businessobject',
      {
        element,
        businessObject: process,
        properties: {
          id: value
        }
      }
    );
  };

  const validate = (value) => {
    return isIdValid(process, value, translate);
  };

  return TextField({
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