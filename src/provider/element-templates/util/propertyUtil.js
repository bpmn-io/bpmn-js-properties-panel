import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  isUndefined
} from 'min-dash';

import {
  CAMUNDA_ERROR_EVENT_DEFINITION_TYPE,
  CAMUNDA_FIELD_TYPE,
  CAMUNDA_IN_BUSINESS_KEY_TYPE,
  CAMUNDA_IN_TYPE,
  CAMUNDA_INPUT_PARAMETER_TYPE,
  CAMUNDA_OUT_TYPE,
  CAMUNDA_OUTPUT_PARAMETER_TYPE,
  CAMUNDA_PROPERTY_TYPE,
  IO_BINDING_TYPES,
  IN_OUT_BINDING_TYPES
} from './bindingTypes';

import {
  findCamundaErrorEventDefinition,
  findCamundaInOut,
  findCamundaProperty,
  findExtension,
  findExtensions,
  findInputParameter,
  findOutputParameter
} from '../Helper';

export function getPropertyValue(element, property, scope) {
  let businessObject = getBusinessObject(element);

  const {
    binding,
    value: defaultValue = ''
  } = property;

  const {
    name,
    type
  } = binding;

  if (scope) {
    businessObject = getScopeBusinessObject(businessObject, scope);

    if (!businessObject) {
      return defaultValue;
    }
  }

  // property
  if (type === 'property') {
    const value = businessObject.get(name);

    if (name === 'conditionExpression') {
      if (value) {
        return value.get('body');
      }

      return defaultValue;
    } else {
      if (!isUndefined(value)) {
        return value;
      }

      return defaultValue;
    }
  }

  // camunda:ErrorEventDefinition
  if (type === CAMUNDA_ERROR_EVENT_DEFINITION_TYPE) {
    const { errorRef } = binding;

    const errorEventDefinition = findCamundaErrorEventDefinition(businessObject, errorRef);

    if (errorEventDefinition) {
      return errorEventDefinition.get('camunda:expression');
    } else {
      return '';
    }
  }

  // camunda:Field
  if (type === CAMUNDA_FIELD_TYPE) {
    const camundaFields = findExtensions(businessObject, [ 'camunda:Field' ]);

    const camundaField = camundaFields.find((camundaField) => {
      return camundaField.get('camunda:name') === name;
    });

    if (camundaField) {
      return camundaField.get('camunda:string') || camundaField.get('camunda:expression');
    } else {
      return '';
    }
  }

  // camunda:Property
  if (type === CAMUNDA_PROPERTY_TYPE) {
    let camundaProperties;

    if (scope) {

      // TODO(philippfromme): as ony bpmn:Error and camunda:Connector are supported this code is practically dead
      camundaProperties = businessObject.get('properties');
    } else {
      camundaProperties = findExtension(businessObject, 'camunda:Properties');
    }

    if (camundaProperties) {
      const camundaProperty = findCamundaProperty(camundaProperties, binding);

      if (camundaProperty) {
        return camundaProperty.get('camunda:value');
      }
    }

    return defaultValue;
  }

  if (IO_BINDING_TYPES.includes(type)) {
    let inputOutput;

    if (scope) {
      inputOutput = businessObject.get('inputOutput');
    } else {
      inputOutput = findExtension(businessObject, 'camunda:InputOutput');
    }

    if (!inputOutput) {
      return defaultValue;
    }

    // camunda:InputParameter
    if (type === CAMUNDA_INPUT_PARAMETER_TYPE) {
      const inputParameter = findInputParameter(inputOutput, binding);

      if (inputParameter) {
        const { scriptFormat } = binding;

        if (scriptFormat) {
          const definition = inputParameter.get('camunda:definition');

          if (definition) {
            return definition.get('camunda:value');
          }
        } else {
          return inputParameter.get('value') || '';
        }
      }

      return defaultValue;
    }

    // camunda:OutputParameter
    if (type === CAMUNDA_OUTPUT_PARAMETER_TYPE) {
      const outputParameter = findOutputParameter(inputOutput, binding);

      if (outputParameter) {
        return outputParameter.get('camunda:name');
      }

      return defaultValue;
    }
  }

  // camunda:In and camunda:Out
  if (IN_OUT_BINDING_TYPES.includes(type)) {
    const camundaInOut = findCamundaInOut(businessObject, binding);

    if (camundaInOut) {
      if (type === CAMUNDA_IN_BUSINESS_KEY_TYPE) {
        return camundaInOut.get('camunda:businessKey');
      } else
      if (type === CAMUNDA_OUT_TYPE) {
        return camundaInOut.get('camunda:target');
      } else
      if (type === CAMUNDA_IN_TYPE) {
        const { expression } = binding;

        if (expression) {
          return camundaInOut.get('camunda:sourceExpression');
        } else {
          return camundaInOut.get('camunda:source');
        }
      }
    }

    return defaultValue;
  }

  // should never throw as templates are validated beforehand
  throw unknownBindingError(element, property);
}

function getScopeBusinessObject(businessObject, scope) {
  const {
    id,
    type
  } = scope;

  if (type === 'bpmn:Error') {

    // retrieve error through referenced error event definition
    const errorEventDefinition = findCamundaErrorEventDefinition(businessObject, id);

    if (errorEventDefinition) {
      return errorEventDefinition.get('errorRef');
    }
  }

  return findExtension(businessObject, type);
}

function unknownBindingError(element, property) {
  const businessObject = getBusinessObject(element);

  const id = businessObject.get('id');

  const { binding } = property;

  const { type } = binding;

  return new Error(`unknown binding <${ type }> for element <${ id }>, this should never happen`);
}
