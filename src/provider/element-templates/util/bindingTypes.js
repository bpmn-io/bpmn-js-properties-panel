export const CAMUNDA_ERROR_EVENT_DEFINITION_TYPE = 'camunda:errorEventDefinition';
export const CAMUNDA_EXECUTION_LISTENER_TYPE = 'camunda:executionListener';
export const CAMUNDA_FIELD_TYPE = 'camunda:field';
export const CAMUNDA_IN_BUSINESS_KEY_TYPE = 'camunda:in:businessKey';
export const CAMUNDA_IN_TYPE = 'camunda:in';
export const CAMUNDA_INPUT_PARAMETER_TYPE = 'camunda:inputParameter';
export const CAMUNDA_OUT_TYPE = 'camunda:out';
export const CAMUNDA_OUTPUT_PARAMETER_TYPE = 'camunda:outputParameter';
export const CAMUNDA_PROPERTY_TYPE = 'camunda:property';
export const PROPERTY_TYPE = 'property';

export const EXTENSION_BINDING_TYPES = [
  CAMUNDA_ERROR_EVENT_DEFINITION_TYPE,
  CAMUNDA_FIELD_TYPE,
  CAMUNDA_IN_TYPE,
  CAMUNDA_IN_BUSINESS_KEY_TYPE,
  CAMUNDA_INPUT_PARAMETER_TYPE,
  CAMUNDA_OUT_TYPE,
  CAMUNDA_OUTPUT_PARAMETER_TYPE,
  CAMUNDA_PROPERTY_TYPE
];

export const IO_BINDING_TYPES = [
  CAMUNDA_INPUT_PARAMETER_TYPE,
  CAMUNDA_OUTPUT_PARAMETER_TYPE
];

export const IN_OUT_BINDING_TYPES = [
  CAMUNDA_IN_BUSINESS_KEY_TYPE,
  CAMUNDA_IN_TYPE,
  CAMUNDA_OUT_TYPE
];