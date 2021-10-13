import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

/**
 * The BPMN 2.0 extension attribute name under
 * which the element template ID is stored.
 *
 * @type {String}
 */
export const TEMPLATE_ID_ATTR = 'camunda:modelerTemplate';

/**
 * The BPMN 2.0 extension attribute name under
 * which the element template version is stored.
 *
 * @type {String}
 */
export const TEMPLATE_VERSION_ATTR = 'camunda:modelerTemplateVersion';


/**
 * Get template id for a given diagram element.
 *
 * @param {djs.model.Base} element
 *
 * @return {String}
 */
export function getTemplateId(element) {
  const businessObject = getBusinessObject(element);

  if (businessObject) {
    return businessObject.get(TEMPLATE_ID_ATTR);
  }
}

/**
 * Get template version for a given diagram element.
 *
 * @param {djs.model.Base} element
 *
 * @return {String}
 */
export function getTemplateVersion(element) {
  const businessObject = getBusinessObject(element);

  if (businessObject) {
    return businessObject.get(TEMPLATE_VERSION_ATTR);
  }
}

/**
 * Find extension with given type in
 * BPMN element, diagram element or ExtensionElement.
 *
 * @param {ModdleElement|djs.model.Base} element
 * @param {String} type
 *
 * @return {ModdleElement} the extension
 */
export function findExtension(element, type) {
  const businessObject = getBusinessObject(element);

  let extensionElements;

  if (is(businessObject, 'bpmn:ExtensionElements')) {
    extensionElements = businessObject;
  } else {
    extensionElements = businessObject.get('extensionElements');
  }

  if (!extensionElements) {
    return null;
  }

  return extensionElements.get('values').find((value) => {
    return is(value, type);
  });
}

export function findExtensions(element, types) {
  const extensionElements = getExtensionElements(element);

  if (!extensionElements) {
    return [];
  }

  return extensionElements.get('values').filter((value) => {
    return isAny(value, types);
  });
}

export function findCamundaInOut(element, binding) {
  const extensionElements = getExtensionElements(element);

  if (!extensionElements) {
    return;
  }

  const { type } = binding;

  let matcher;

  if (type === 'camunda:in') {
    matcher = (element) => {
      return is(element, 'camunda:In') && isInOut(element, binding);
    };
  } else
  if (type === 'camunda:out') {
    matcher = (element) => {
      return is(element, 'camunda:Out') && isInOut(element, binding);
    };
  } else
  if (type === 'camunda:in:businessKey') {
    matcher = (element) => {
      return is(element, 'camunda:In') && 'businessKey' in element;
    };
  }

  return extensionElements.get('values').find(matcher);
}

export function findCamundaProperty(camundaProperties, binding) {
  return camundaProperties.get('values').find((value) => {
    return value.name === binding.name;
  });
}

export function findInputParameter(inputOutput, binding) {
  const parameters = inputOutput.get('inputParameters');

  return parameters.find((parameter) => {
    return parameter.name === binding.name;
  });
}

export function findOutputParameter(inputOutput, binding) {
  const parameters = inputOutput.get('outputParameters');

  return parameters.find(function(parameter) {
    const { value } = parameter;

    if (!binding.scriptFormat) {
      return value === binding.source;
    }

    const definition = parameter.get('camunda:definition');

    if (!definition || binding.scriptFormat !== definition.get('camunda:scriptFormat')) {
      return false;
    }

    return definition.get('camunda:value') === binding.source;
  });
}

export function findCamundaErrorEventDefinition(element, bindingErrorRef) {
  const errorEventDefinitions = findExtensions(element, [ 'camunda:ErrorEventDefinition' ]);

  let error;

  // error id has to start with <Error_${binding.errorRef}_>
  return errorEventDefinitions.find((definition) => {
    error = definition.get('bpmn:errorRef');

    if (error) {
      return error.get('bpmn:id').indexOf(`Error_${ bindingErrorRef }`) === 0;
    }
  });
}


// helpers //////////

function getExtensionElements(element) {
  const businessObject = getBusinessObject(element);

  if (is(businessObject, 'bpmn:ExtensionElements')) {
    return businessObject;
  } else {
    return businessObject.get('extensionElements');
  }
}


function isInOut(element, binding) {

  if (binding.type === 'camunda:in') {

    // find based on target attribute
    if (binding.target) {
      return element.target === binding.target;
    }
  }

  if (binding.type === 'camunda:out') {

    // find based on source / sourceExpression
    if (binding.source) {
      return element.source === binding.source;
    }

    if (binding.sourceExpression) {
      return element.sourceExpression === binding.sourceExpression;
    }
  }

  // find based variables / local combination
  if (binding.variables) {
    return element.variables === 'all' && (
      binding.variables !== 'local' || element.local
    );
  }
}
