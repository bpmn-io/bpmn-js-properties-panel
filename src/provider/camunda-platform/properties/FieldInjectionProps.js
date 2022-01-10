import {
  getServiceTaskLikeBusinessObject
} from '../utils/ImplementationTypeUtils';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  addExtensionElements,
  getExtensionElementsList,
  removeExtensionElements
} from '../../../utils/ExtensionElementsUtil';

import FieldInjection from './FieldInjection';


export function FieldInjectionProps({ element, injector }) {

  const businessObject = getServiceTaskLikeBusinessObject(element);

  if (!businessObject) {
    return null;
  }

  const fieldInjections = getExtensionElementsList(businessObject, 'camunda:Field');

  const bpmnFactory = injector.get('bpmnFactory'),
        commandStack = injector.get('commandStack');

  const items = fieldInjections.map((field, index) => {
    const id = element.id + '-fieldInjection-' + index;

    return {
      id,
      label: getFieldLabel(field),
      entries: FieldInjection({
        idPrefix: id,
        element,
        field
      }),
      autoFocusEntry: id + '-name',
      remove: removeFactory({ commandStack, element, field })
    };
  });

  return {
    items,
    add: addFactory({ bpmnFactory, commandStack, element })
  };
}

function removeFactory({ commandStack, element, field }) {
  return function(event) {
    event.stopPropagation();

    const businessObject = getServiceTaskLikeBusinessObject(element);

    removeExtensionElements(element, businessObject, field, commandStack);
  };
}

function addFactory({ bpmnFactory, commandStack, element }) {
  return function(event) {
    event.stopPropagation();

    const businessObject = getServiceTaskLikeBusinessObject(element);

    const fieldInjection = createElement(
      'camunda:Field',
      {
        name: undefined,
        string: '', // string is the default type
        stringValue: undefined
      },
      null,
      bpmnFactory
    );

    addExtensionElements(element, businessObject, fieldInjection, bpmnFactory, commandStack);
  };
}

// helper ///////////////

function getFieldLabel(field) {
  return field.name || '<empty>';
}
