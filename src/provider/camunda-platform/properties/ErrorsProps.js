import {
  getImplementationType
} from '../utils/ImplementationTypeUtils';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  addExtensionElements,
  getExtensionElementsList,
  removeExtensionElements
} from '../../../utils/ExtensionElementsUtil';

import Error from './Error';

import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';


export function ErrorsProps({ element, injector }) {

  const businessObject = getBusinessObject(element);

  if (!is(element, 'bpmn:ServiceTask') || getImplementationType(element) !== 'external') {
    return null;
  }

  const errorEventDefinitions = getExtensionElementsList(businessObject, 'camunda:ErrorEventDefinition');

  const bpmnFactory = injector.get('bpmnFactory'),
        commandStack = injector.get('commandStack');

  const items = errorEventDefinitions.map((errorEventDefinition, index) => {
    const id = element.id + '-error-' + index;

    return {
      id,
      label: getErrorLabel(errorEventDefinition),
      entries: Error({
        idPrefix: id,
        element,
        errorEventDefinition
      }),
      autoFocusEntry: id + '-errorRef',
      remove: removeFactory({ commandStack, element, errorEventDefinition })
    };
  });

  return {
    items,
    add: addFactory({ bpmnFactory, commandStack, element }),
    shouldSort: false
  };
}

function removeFactory({ commandStack, element, errorEventDefinition }) {
  return function(event) {
    event.stopPropagation();

    const businessObject = getBusinessObject(element);

    removeExtensionElements(element, businessObject, errorEventDefinition, commandStack);
  };
}

function addFactory({ bpmnFactory, commandStack, element }) {
  return function(event) {
    event.stopPropagation();

    const businessObject = getBusinessObject(element);

    const error = createElement(
      'camunda:ErrorEventDefinition',
      {},
      undefined,
      bpmnFactory
    );

    addExtensionElements(element, businessObject, error, bpmnFactory, commandStack);
  };
}

// helpers //////////

export function getErrorLabel(errorEventDefinition) {
  const error = errorEventDefinition.get('errorRef');

  if (!error) {
    return '<no reference>';
  }

  const errorCode = error.get('errorCode'),
        name = error.get('name') || '<unnamed>';

  if (errorCode) {
    return `${ name } (code = ${ errorCode })`;
  }

  return name;
}
