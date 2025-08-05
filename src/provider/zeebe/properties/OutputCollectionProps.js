import {
  is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  isFeelEntryEdited,
  isTextFieldEntryEdited,
  TextFieldEntry
} from '@bpmn-io/properties-panel';

import { useService } from '../../../hooks';

import { BpmnFeelEntry } from '../../../entries/BpmnFeelEntry';

import {
  getExtensionElementsList,
  addExtensionElements
} from '../../../utils/ExtensionElementsUtil';

import { createElement } from '../../../utils/ElementUtil';

export function OutputCollectionProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:AdHocSubProcess')) {
    return [];
  }

  const entries = [
    {
      id: 'adHocOutputCollection',
      component: OutputCollection,
      isEdited: isTextFieldEntryEdited
    },
    {
      id: 'adHocOutputElement',
      component: OutputElement,
      isEdited: isFeelEntryEdited
    }
  ];

  return entries;
}

function OutputCollection(props) {
  const {
    element,
    id
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getOutputCollectionProperty(element);
  };

  const setValue = (value) => {
    return setOutputCollectionProperty(element, value, commandStack, bpmnFactory);
  };

  return TextFieldEntry({
    element,
    id,
    label: translate('Output collection'),
    getValue,
    setValue,
    debounce
  });
}

function OutputElement(props) {
  const {
    element,
    id
  } = props;

  const commandStack = useService('commandStack');
  const bpmnFactory = useService('bpmnFactory');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return getOutputElementProperty(element);
  };

  const setValue = (value) => {
    return setOutputElementProperty(element, value, commandStack, bpmnFactory);
  };

  return BpmnFeelEntry({
    element,
    id,
    label: translate('Output element'),
    feel: 'required',
    getValue,
    setValue,
    debounce
  });
}

function getOutputCollectionProperty(element) {
  const extensionElement = getExtensionElement(element);
  return extensionElement && extensionElement.get('outputCollection');
}

function setOutputCollectionProperty(element, value, commandStack, bpmnFactory) {

  const extensionElement = getExtensionElement(element);

  if (!extensionElement) {

    // (1) create extension element
    const adHoc = createElement(
      'zeebe:AdHoc',
      {
        outputCollection: value
      },
      undefined,
      bpmnFactory
    );

    const businessObject = getBusinessObject(element);
    addExtensionElements(element, businessObject, adHoc, bpmnFactory, commandStack);

  } else {

    // (2) update extension element's property
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: extensionElement,
      properties: {
        outputCollection: value
      }
    });
  }
}

function getOutputElementProperty(element) {
  const extensionElement = getExtensionElement(element);
  return extensionElement && extensionElement.get('outputElement');
}

function setOutputElementProperty(element, value, commandStack, bpmnFactory) {

  const extensionElement = getExtensionElement(element);

  if (!extensionElement) {

    // (1) create extension element
    const adHoc = createElement(
      'zeebe:AdHoc',
      {
        outputElement: value
      },
      undefined,
      bpmnFactory
    );

    const businessObject = getBusinessObject(element);
    addExtensionElements(element, businessObject, adHoc, bpmnFactory, commandStack);

  } else {

    // (2) update extension element's property
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: extensionElement,
      properties: {
        outputElement: value
      }
    });
  }
}

function getExtensionElement(element) {
  const businessObject = getBusinessObject(element);
  const extensions = getExtensionElementsList(businessObject, 'zeebe:AdHoc');
  return extensions[0];
}
