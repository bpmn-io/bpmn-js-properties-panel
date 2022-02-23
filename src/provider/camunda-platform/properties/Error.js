import { TextFieldEntry, isTextFieldEntryEdited, isSelectEntryEdited } from '@bpmn-io/properties-panel';

import ReferenceSelect from '../../../entries/ReferenceSelect';

import {
  useService
} from '../../../hooks';

import {
  sortBy
} from 'min-dash';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  createElement,
  findRootElementById,
  findRootElementsByType,
  getRoot,
  nextId
} from '../../../utils/ElementUtil';

export const EMPTY_OPTION = '';
export const CREATE_NEW_OPTION = 'create-new';


export default function Error(props) {

  const {
    idPrefix,
    errorEventDefinition
  } = props;

  let entries = [ {
    id: idPrefix + '-errorRef',
    component: ErrorRef,
    isEdited: isSelectEntryEdited,
    errorEventDefinition,
    idPrefix
  } ];

  const error = errorEventDefinition.get('errorRef');

  if (error) {
    entries = [
      ...entries,
      {
        id: idPrefix + '-errorName',
        component: ErrorName,
        isEdited: isTextFieldEntryEdited,
        error,
        errorEventDefinition,
        idPrefix
      },
      {
        id: idPrefix + '-errorCode',
        component: ErrorCode,
        isEdited: isTextFieldEntryEdited,
        error,
        errorEventDefinition,
        idPrefix
      },
      {
        id: idPrefix + '-errorMessage',
        component: ErrorMessage,
        isEdited: isTextFieldEntryEdited,
        error,
        errorEventDefinition,
        idPrefix
      }
    ];
  }

  entries.push({
    id: idPrefix + '-expression',
    component: Expression,
    errorEventDefinition,
    idPrefix
  });

  return entries;
}

function ErrorRef(props) {
  const {
    element,
    errorEventDefinition,
    idPrefix
  } = props;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const businessObject = getBusinessObject(element);

  const getValue = () => {
    const error = errorEventDefinition.get('errorRef');

    if (error) {
      return error.get('id');
    }

    return EMPTY_OPTION;
  };

  const setValue = (value) => {
    const root = getRoot(businessObject);
    const commands = [];

    let error;

    // (1) create new error
    if (value === CREATE_NEW_OPTION) {
      error = createElement(
        'bpmn:Error',
        { name: nextId('Error_') },
        root,
        bpmnFactory
      );

      value = error.get('id');

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: root,
          properties: {
            rootElements: [ ...root.get('rootElements'), error ]
          }
        }
      });
    }

    // (2) update (or remove) errorRef
    error = error || findRootElementById(businessObject, 'bpmn:Error', value);

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: errorEventDefinition,
        properties: {
          errorRef: error
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

    const errors = findRootElementsByType(getBusinessObject(element), 'bpmn:Error');

    sortByName(errors).forEach(error => {
      options.push({
        value: error.get('id'),
        label: error.get('name') || error.get('id')
      });
    });

    return options;
  };

  return ReferenceSelect({
    element,
    id: idPrefix + '-errorRef',
    label: translate('Global error reference'),
    autoFocusEntry: idPrefix + '-errorName',
    getValue,
    setValue,
    getOptions
  });
}

function ErrorName(props) {
  const {
    element,
    error,
    idPrefix
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return error.get('name');
  };

  const setValue = (value) => {
    return commandStack.execute(
      'element.updateModdleProperties',
      {
        element,
        moddleElement: error,
        properties: {
          name: value
        }
      }
    );
  };

  return TextFieldEntry({
    element,
    id: idPrefix + '-errorName',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}

function ErrorCode(props) {
  const {
    element,
    error,
    idPrefix
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return error.get('errorCode');
  };

  const setValue = (value) => {
    return commandStack.execute(
      'element.updateModdleProperties',
      {
        element,
        moddleElement: error,
        properties: {
          errorCode: value
        }
      }
    );
  };

  return TextFieldEntry({
    element,
    id: idPrefix + '-errorCode',
    label: translate('Code'),
    getValue,
    setValue,
    debounce
  });
}

function ErrorMessage(props) {
  const {
    element,
    error,
    idPrefix
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return error.get('errorMessage');
  };

  const setValue = (value) => {
    return commandStack.execute(
      'element.updateModdleProperties',
      {
        element,
        moddleElement: error,
        properties: {
          errorMessage: value
        }
      }
    );
  };

  return TextFieldEntry({
    element,
    id: idPrefix + '-errorMessage',
    label: translate('Message'),
    getValue,
    setValue,
    debounce
  });
}

function Expression(props) {
  const {
    element,
    errorEventDefinition,
    idPrefix
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: errorEventDefinition,
      properties: {
        'camunda:expression': value
      }
    });
  };

  const getValue = () => {
    return errorEventDefinition.get('camunda:expression');
  };

  return TextFieldEntry({
    element: errorEventDefinition,
    id: idPrefix + '-expression',
    label: translate('Throw expression'),
    getValue,
    setValue,
    debounce
  });
}

// helpers //////////

function sortByName(elements) {
  return sortBy(elements, e => (e.name || '').toLowerCase());
}