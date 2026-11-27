import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  isTextFieldEntryEdited,
  isToggleSwitchEntryEdited,
  TextFieldEntry,
  ToggleSwitchEntry
} from '@bpmn-io/properties-panel';

import { useService } from '../../../hooks';

import { createElement } from '../../../utils/ElementUtil';

import {
  addExtensionElements,
  getExtensionElementsList,
  removeExtensionElements
} from '../../../utils/ExtensionElementsUtil';

import { getSingletonEntryId } from '../utils/EntryIdUtil';


export function CaseProps(props) {
  const {
    element
  } = props;

  if (!getProcess(element)) {
    return [];
  }

  const entries = [
    {
      id: 'case',
      component: CaseToggle,
      isEdited: isToggleSwitchEntryEdited
    }
  ];

  if (getCase(element)) {
    entries.push(
      {
        id: getSingletonEntryId('zeebe:Case', 'title'),
        component: Title,
        isEdited: isTextFieldEntryEdited
      },
      {
        id: getSingletonEntryId('zeebe:Case', 'caseForm'),
        component: CaseForm,
        isEdited: isTextFieldEntryEdited
      }
    );
  }

  return entries;
}

function CaseToggle(props) {
  const {
    element,
    id
  } = props;

  const bpmnFactory = useService('bpmnFactory'),
        commandStack = useService('commandStack'),
        translate = useService('translate');

  const getValue = () => !!getCase(element);

  const setValue = (value) => {
    const businessObject = getProcess(element);

    if (value) {
      const caseMarker = createElement('zeebe:Case', {}, businessObject, bpmnFactory);

      addExtensionElements(element, businessObject, caseMarker, bpmnFactory, commandStack);
    } else {
      removeExtensionElements(element, businessObject, getCase(element), commandStack);
    }
  };

  return ToggleSwitchEntry({
    id,
    label: translate('Mark as case'),
    switcherLabel: getValue() ? translate('On') : translate('Off'),
    getValue,
    setValue
  });
}

function Title(props) {
  const {
    element,
    id
  } = props;

  return CaseTextField({
    element,
    id,
    property: 'title',
    label: 'Title variable',
    description: 'Name of the variable that holds the case title'
  });
}

function CaseForm(props) {
  const {
    element,
    id
  } = props;

  return CaseTextField({
    element,
    id,
    property: 'caseForm',
    label: 'Case form ID',
    description: 'ID of the form that shows the case details'
  });
}

function CaseTextField(props) {
  const {
    element,
    id,
    property,
    label,
    description
  } = props;

  const commandStack = useService('commandStack'),
        debounce = useService('debounceInput'),
        translate = useService('translate');

  const getValue = () => getCase(element).get(property);

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: getCase(element),
      properties: {
        [ property ]: value || undefined
      }
    });
  };

  return TextFieldEntry({
    element,
    id,
    label: translate(label),
    description: translate(description),
    getValue,
    setValue,
    debounce
  });
}


// helper ///////////////////////

function getProcess(element) {
  const businessObject = getBusinessObject(element);

  if (is(element, 'bpmn:Process')) {
    return businessObject;
  }

  if (is(element, 'bpmn:Participant')) {
    return businessObject.get('processRef');
  }
}

function getCase(element) {
  return getExtensionElementsList(getProcess(element), 'zeebe:Case')[0];
}
