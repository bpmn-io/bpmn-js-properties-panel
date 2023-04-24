export const PROPERTY_TYPE = 'property';

export const ZEBBE_PROPERTY_TYPE = 'zeebe:property';
export const ZEBBE_INPUT_TYPE = 'zeebe:input';
export const ZEEBE_OUTPUT_TYPE = 'zeebe:output';
export const ZEEBE_PROPERTY_TYPE = 'zeebe:property';
export const ZEEBE_TASK_DEFINITION_TYPE_TYPE = 'zeebe:taskDefinition:type';
export const ZEEBE_TASK_HEADER_TYPE = 'zeebe:taskHeader';
export const MESSAGE_PROPERTY_TYPE = 'bpmn:Message#property';
export const MESSAGE_ZEEBE_SUBSCRIPTION_PROPERTY_TYPE = 'bpmn:Message#zeebe:subscription#property';

export const EXTENSION_BINDING_TYPES = [
  MESSAGE_ZEEBE_SUBSCRIPTION_PROPERTY_TYPE,
  ZEBBE_INPUT_TYPE,
  ZEEBE_OUTPUT_TYPE,
  ZEEBE_PROPERTY_TYPE,
  ZEEBE_TASK_DEFINITION_TYPE_TYPE,
  ZEEBE_TASK_HEADER_TYPE
];

export const TASK_DEFINITION_TYPES = [
  ZEEBE_TASK_DEFINITION_TYPE_TYPE
];

export const IO_BINDING_TYPES = [
  ZEBBE_INPUT_TYPE,
  ZEEBE_OUTPUT_TYPE
];

export const MESSAGE_BINDING_TYPES = [
  MESSAGE_PROPERTY_TYPE,
  MESSAGE_ZEEBE_SUBSCRIPTION_PROPERTY_TYPE
];

export const PROPERTY_BINDING_TYPES = [
  PROPERTY_TYPE,
  MESSAGE_PROPERTY_TYPE
];
