/**
 * Create an input parameter representing the given
 * binding and value.
 *
 * @param {PropertyBinding} binding
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
export function createInputParameter(binding, value, bpmnFactory) {
  const {
    name
  } = binding;

  return bpmnFactory.create('zeebe:Input', {
    source: value,
    target: name
  });
}

/**
 * Create an output parameter representing the given
 * binding and value.
 *
 * @param {PropertyBinding} binding
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
export function createOutputParameter(binding, value, bpmnFactory) {
  const {
    source
  } = binding;

  return bpmnFactory.create('zeebe:Output', {
    source,
    target: value
  });
}

/**
 * Create a task header representing the given
 * binding and value.
 *
 * @param {PropertyBinding} binding
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
export function createTaskHeader(binding, value, bpmnFactory) {
  const {
    key
  } = binding;

  return bpmnFactory.create('zeebe:Header', {
    key,
    value
  });
}

/**
 * Create a task definition representing the given value.
 *
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
export function createTaskDefinitionWithType(value, bpmnFactory) {
  return bpmnFactory.create('zeebe:TaskDefinition', {
    type: value
  });
}
