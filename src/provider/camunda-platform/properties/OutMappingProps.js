import {
  filter
} from 'min-dash';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  addExtensionElements,
  getExtensionElementsList, removeExtensionElements
} from '../../../utils/ExtensionElementsUtil';

import {
  createElement
} from '../../../utils/ElementUtil';

import InOutMapping from './InOutMapping';

/**
 * Cf. https://docs.camunda.org/manual/latest/reference/bpmn20/custom-extensions/extension-elements/#out
 */
export function OutMappingProps({ element, injector }) {

  if (!areOutMappingsSupported(element)) {
    return null;
  }

  const variableMappings = getOutMappings(element) || [];

  const bpmnFactory = injector.get('bpmnFactory'),
        commandStack = injector.get('commandStack');

  const items = variableMappings.map((mapping, index) => {
    const id = element.id + '-outMapping-' + index;

    return {
      id,
      label: mapping.get('target') || '',
      entries: InOutMapping({
        idPrefix: id,
        element,
        mapping
      }),
      autoFocusEntry: id + '-target',
      remove: removeFactory({ commandStack, element, mapping })
    };
  });

  return {
    items,
    add: addFactory({ bpmnFactory, commandStack, element })
  };
}

function removeFactory({ commandStack, element, mapping }) {
  return function(event) {
    event.stopPropagation();

    const businessObject = getBusinessObject(element);

    removeExtensionElements(element, businessObject, mapping, commandStack);
  };
}

function addFactory({ bpmnFactory, commandStack, element }) {
  return function(event) {
    event.stopPropagation();

    const businessObject = getBusinessObject(element);

    const newMapping = createElement('camunda:Out', {
      source: '', // source is the default type
    }, null, bpmnFactory);

    addExtensionElements(element, businessObject, newMapping, bpmnFactory, commandStack);
  };
}

// helper ///////////////

function getOutMappings(element) {
  const businessObject = getBusinessObject(element);
  const mappings = getExtensionElementsList(businessObject, 'camunda:Out');

  // only retrieve relevant mappings here, others are handled in other groups
  // mapping.businessKey => camunda-platform/CallAvtivityProps
  // mapping.variables => camunda-platform/OutMappingPropagationProps
  return filter(mappings, function(mapping) {
    return !mapping.businessKey && !(mapping.variables && mapping.variables === 'all');
  });
}

function areOutMappingsSupported(element) {
  return is(element, 'bpmn:CallActivity');
}
