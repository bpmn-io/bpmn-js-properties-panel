import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  isUndefined, without
} from 'min-dash';

import {
  IO_BINDING_TYPES,
  TASK_DEFINITION_TYPES,
  EXTENSION_BINDING_TYPES
} from '../util/bindingTypes';

import {
  findExtension,
  findTaskHeader,
  findInputParameter,
  findOutputParameter
} from '../Helper';

import {
  createInputParameter,
  createOutputParameter,
  createTaskDefinitionWithType,
  createTaskHeader,
  shouldUpdate
} from '../CreateHelper';

import { createElement } from '../../../utils/ElementUtil';


export function getPropertyValue(element, property, scope) {
  let businessObject = getBusinessObject(element);

  const defaultValue = '';

  const {
    binding
  } = property;

  const {
    name,
    type
  } = binding;

  // property
  if (type === 'property') {
    const value = businessObject.get(name);

    if (!isUndefined(value)) {
      return value;
    }

    return defaultValue;
  }

  // zeebe:taskDefinition
  if (TASK_DEFINITION_TYPES.includes(type)) {

    const taskDefinition = findExtension(businessObject, 'zeebe:TaskDefinition');

    if (taskDefinition) {
      if (type === ZEEBE_TASK_DEFINITION_TYPE_TYPE) {
        return taskDefinition.get('type');
      }
    }

    return defaultValue;
  }

  if (IO_BINDING_TYPES.includes(type)) {
    const ioMapping = findExtension(businessObject, 'zeebe:IoMapping');

    if (!ioMapping) {
      return defaultValue;
    }

    // zeebe:Input
    if (type === ZEBBE_INPUT_TYPE) {
      const inputParameter = findInputParameter(ioMapping, binding);

      if (inputParameter) {
        return inputParameter.get('source');
      }

      return defaultValue;
    }

    // zeebe:Output
    if (type === ZEEBE_OUTPUT_TYPE) {
      const outputParameter = findOutputParameter(ioMapping, binding);

      if (outputParameter) {
        return outputParameter.get('target');
      }

      return defaultValue;
    }
  }

  // zeebe:taskHeaders
  if (type === ZEEBE_TASK_HEADER_TYPE) {
    const taskHeaders = findExtension(businessObject, 'zeebe:TaskHeaders');

    if (!taskHeaders) {
      return defaultValue;
    }

    const header = findTaskHeader(taskHeaders, binding);

    if (header) {
      return header.get('value');
    }

    return defaultValue;
  }

  // should never throw as templates are validated beforehand
  throw unknownBindingError(element, property);
}

        cmd: 'element.updateModdleProperties',
        context: {
          ...context,
          moddleElement: ioMapping,
          properties: { 'outputParameters': [ ...values ] }
        }
      });
    }
  }

  // zeebe:taskHeaders
  if (type === ZEEBE_TASK_HEADER_TYPE) {
    let taskHeaders = findExtension(extensionElements, 'zeebe:TaskHeaders');

    if (!taskHeaders)
      return;

    const oldTaskHeader = findTaskHeader(taskHeaders, binding);

    const values = taskHeaders.get('values').filter((value) => value !== oldTaskHeader);

    if (values.length === 0) {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          ...context,
          moddleElement: extensionElements,
          properties: {
            values: without(extensionElements.get('values'), taskHeaders)
          }
        }
      });
    }
    else {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          ...context,
          moddleElement: taskHeaders,
          properties: { values: [ ...values ] }
        }
      });
    }
  }

  if (commands.length) {
    commandStack.execute(
      'properties-panel.multi-command-executor',
      commands
    );

    return;
  }
}


export function isPropertyActive(element, property) {
  const {
    binding,
    type
  } = property;

  if (type === 'Hidden')
    return true;

  const {
    type: bindingType
  } = binding;

  const businessObject = getBusinessObject(element);

  switch (bindingType) {
  case 'zeebe:input':
    return searchInputs(businessObject, binding);
  case 'zeebe:output':
    return searchOutputs(businessObject, binding);
  case 'zeebe:taskHeader':
    return searchTaskDefinition(businessObject, binding);
  default:
    return false;
  }
}


function searchTaskDefinition(businessObject, binding) {
  const taskHeaders = findExtension(businessObject, 'zeebe:TaskHeaders');

  if (!taskHeaders) {
    return false;
  }

  return !!findTaskHeader(taskHeaders, binding);
}

function searchInputs(businessObject, binding) {
  let ioMapping = findExtension(businessObject, 'zeebe:IoMapping');

  if (!ioMapping) {
    return false;
  }

  return !!findInputParameter(ioMapping, binding);
}

function searchOutputs(businessObject, binding) {
  let ioMapping = findExtension(businessObject, 'zeebe:IoMapping');

  if (!ioMapping) {
    return false;
  }

  return !!findOutputParameter(ioMapping, binding);
}

function unknownBindingError(element, property) {
  const businessObject = getBusinessObject(element);

  const id = businessObject.get('id');

  const { binding } = property;

  const { type } = binding;

  return new Error(`unknown binding <${ type }> for element <${ id }>, this should never happen`);
}
