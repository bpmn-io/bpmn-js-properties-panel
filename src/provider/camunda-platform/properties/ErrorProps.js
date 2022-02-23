import {
  findIndex
} from 'min-dash';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import {
  useService
} from '../../../hooks';

import {
  getError,
  getErrorEventDefinition,
  isErrorSupported
} from '../../bpmn/utils/EventDefinitionUtil';


export function ErrorProps(props) {
  const {
    element,
    entries
  } = props;

  if (!isErrorSupported(element)) {
    return entries;
  }

  const error = getError(element);

  // (1) errorMessage (error)
  if (error) {
    const idx = findPlaceToInsert(entries, 'errorCode');

    // place below errorCode
    entries.splice(idx, 0, {
      id: 'errorMessage',
      component: ErrorMessage,
      isEdited: isTextFieldEntryEdited
    });
  }


  if (!canHaveErrorVariables(element)) {
    return entries;
  }

  // (2) errorCodeVariable + errorMessageVariable (errorEventDefinition)
  entries.push(
    {
      id: 'errorCodeVariable',
      component: ErrorCodeVariable,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'errorMessageVariable',
      component: ErrorMessageVariable,
      isEdited: isTextFieldEntryEdited
    }
  );

  return entries;
}

function ErrorMessage(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const error = getError(element);

  const getValue = () => {
    return error.get('camunda:errorMessage');
  };

  const setValue = (value) => {
    return commandStack.execute(
      'element.updateModdleProperties',
      {
        element,
        moddleElement: error,
        properties: {
          'camunda:errorMessage': value
        }
      }
    );
  };

  return TextFieldEntry({
    element,
    id: 'errorMessage',
    label: translate('Message'),
    getValue,
    setValue,
    debounce
  });
}

function ErrorCodeVariable(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const errorEventDefinition = getErrorEventDefinition(element);

  const getValue = () => {
    return errorEventDefinition.get('camunda:errorCodeVariable');
  };

  const setValue = (value) => {
    return commandStack.execute(
      'element.updateModdleProperties',
      {
        element,
        moddleElement: errorEventDefinition,
        properties: {
          'camunda:errorCodeVariable': value
        }
      }
    );
  };

  return TextFieldEntry({
    element,
    id: 'errorCodeVariable',
    label: translate('Code variable'),
    description: translate('Define the name of the variable that will contain the error code.'),
    getValue,
    setValue,
    debounce
  });
}

function ErrorMessageVariable(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const errorEventDefinition = getErrorEventDefinition(element);

  const getValue = () => {
    return errorEventDefinition.get('camunda:errorMessageVariable');
  };

  const setValue = (value) => {
    return commandStack.execute(
      'element.updateModdleProperties',
      {
        element,
        moddleElement: errorEventDefinition,
        properties: {
          'camunda:errorMessageVariable': value
        }
      }
    );
  };

  return TextFieldEntry({
    element,
    id: 'errorMessageVariable',
    label: translate('Message variable'),
    description: translate('Define the name of the variable that will contain the error message.'),
    getValue,
    setValue,
    debounce
  });
}


// helper ///////////////////////

function canHaveErrorVariables(element) {
  return is(element, 'bpmn:StartEvent') || is (element, 'bpmn:BoundaryEvent');
}

function findPlaceToInsert(entries, idx) {
  const entryIndex = findIndex(entries, (entry) => entry.id === idx);
  return entryIndex >= 0 ? entryIndex + 1 : entries.length;
}