import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import {
  isUndefined, without
} from 'min-dash';

import {
  EXTENSION_BINDING_TYPES,
  IO_BINDING_TYPES,
  PROPERTY_TYPE,
  TASK_DEFINITION_TYPES,
  ZEEBE_TASK_DEFINITION_TYPE_TYPE,
  ZEBBE_INPUT_TYPE,
  ZEEBE_OUTPUT_TYPE,
  ZEEBE_PROPERTY_TYPE,
  ZEEBE_TASK_HEADER_TYPE
} from '../util/bindingTypes';

import {
  findExtension,
  findTaskHeader,
  findInputParameter,
  findOutputParameter,
  findZeebeProperty
} from '../Helper';

import {
  createInputParameter,
  createOutputParameter,
  createTaskDefinitionWithType,
  createTaskHeader,
  createZeebeProperty,
  shouldUpdate
} from '../CreateHelper';

import { createElement } from '../../../utils/ElementUtil';

const PRIMITIVE_MODDLE_TYPES = [
  'Boolean',
  'Integer',
  'String'
];

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

  // zeebe:Property
  if (type === ZEEBE_PROPERTY_TYPE) {
    const zeebeProperties = findExtension(businessObject, 'zeebe:Properties');

    if (zeebeProperties) {
      const zeebeProperty = findZeebeProperty(zeebeProperties, binding);

      if (zeebeProperty) {
        return zeebeProperty.get('value');
      }
    }

    return defaultValue;
  }

  // should never throw as templates are validated beforehand
  throw unknownBindingError(element, property);
}

const NO_OP = null;
export function setPropertyValue(bpmnFactory, commandStack, element, property, value) {
  let businessObject = getBusinessObject(element);

  const {
    binding,
  } = property;

  const {
    name,
    type
  } = binding;

  let extensionElements;

  let propertyValue;

  const commands = [];

  const context = {
    element,
    property
  };

  // ensure extension elements
  if (EXTENSION_BINDING_TYPES.includes(type)) {
    extensionElements = businessObject.get('extensionElements');

    if (!extensionElements) {
      extensionElements = createElement('bpmn:ExtensionElements', null, businessObject, bpmnFactory);

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          ...context,
          moddleElement: businessObject,
          properties: { extensionElements }
        }
      });
    }
    else {
      commands.push(NO_OP);
    }
  }

  // property
  if (type === PROPERTY_TYPE) {

    const propertyDescriptor = businessObject.$descriptor.propertiesByName[ name ];

    // if property not created yet
    if (!propertyDescriptor) {

      // make sure we create the property
      propertyValue = value || '';
    }

    else {
      const { type: propertyType } = propertyDescriptor;

      // do not override non-primitive types
      if (!PRIMITIVE_MODDLE_TYPES.includes(propertyType)) {
        throw new Error(`cannot set property of type <${ propertyType }>`);
      }

      if (propertyType === 'Boolean') {
        propertyValue = !!value;
      } else if (propertyType === 'Integer') {
        propertyValue = parseInt(value, 10);

        if (isNaN(propertyValue)) {

          // do not set NaN value
          propertyValue = undefined;
        }
      } else {

        // make sure we don't remove the property
        propertyValue = value || '';
      }
    }

    if (!isUndefined(propertyValue)) {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          ...context,
          moddleElement: businessObject,
          properties: { [ name ]: propertyValue }
        }
      });
    } else {
      commands.push(NO_OP);
    }

  }

  // zeebe:taskDefinition
  if (TASK_DEFINITION_TYPES.includes(type)) {
    const oldTaskDefinition = findExtension(extensionElements, 'zeebe:TaskDefinition');

    let newTaskDefinition;

    if (type === ZEEBE_TASK_DEFINITION_TYPE_TYPE) {
      newTaskDefinition = createTaskDefinitionWithType(value, bpmnFactory);
    } else {
      throw unknownBindingError(element, property);
    }

    const values = extensionElements.get('values').filter((value) => value !== oldTaskDefinition);

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        ...context,
        moddleElement: extensionElements,
        properties: { values: [ ...values, newTaskDefinition ] }
      }
    });
  }

  if (IO_BINDING_TYPES.includes(type)) {
    let ioMapping = findExtension(extensionElements, 'zeebe:IoMapping');

    if (!ioMapping) {
      ioMapping = createElement('zeebe:IoMapping', null, businessObject, bpmnFactory);

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          ...context,
          moddleElement: extensionElements,
          properties: { values: [ ...extensionElements.get('values'), ioMapping ] }
        }
      });
    }

    // zeebe:Input
    if (type === ZEBBE_INPUT_TYPE) {
      const oldZeebeInputParameter = findInputParameter(ioMapping, binding);
      const values = ioMapping.get('inputParameters').filter((value) => value !== oldZeebeInputParameter);

      // do not persist empty parameters when configured as <optional>
      if (shouldUpdate(value, property)) {
        const newZeebeInputParameter = createInputParameter(binding, value, bpmnFactory);
        values.push(newZeebeInputParameter);
      }

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          ...context,
          moddleElement: ioMapping,
          properties: { inputParameters: [ ...values ] }
        }
      });
    }

    // zeebe:Output
    if (type === ZEEBE_OUTPUT_TYPE) {
      const oldZeebeOutputParameter = findOutputParameter(ioMapping, binding);
      const values = ioMapping.get('outputParameters').filter((value) => value !== oldZeebeOutputParameter);

      // do not persist empty parameters when configured as <optional>
      if (shouldUpdate(value, property)) {
        const newZeebeOutputParameter = createOutputParameter(binding, value, bpmnFactory);
        values.push(newZeebeOutputParameter);
      }

      commands.push({
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

    if (!taskHeaders) {
      taskHeaders = createElement('zeebe:TaskHeaders', null, businessObject, bpmnFactory);

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          ...context,
          moddleElement: extensionElements,
          properties: { values: [ ...extensionElements.get('values'), taskHeaders ] }
        }
      });
    }

    const oldTaskHeader = findTaskHeader(taskHeaders, binding);

    const values = taskHeaders.get('values').filter((value) => value !== oldTaskHeader);

    // do not persist task headers with empty value
    if (!value) {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          ...context,
          moddleElement: taskHeaders,
          properties: { values }
        }
      });
    } else {
      const newTaskHeader = createTaskHeader(binding, value, bpmnFactory);

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          ...context,
          moddleElement: taskHeaders,
          properties: { values: [ ...values, newTaskHeader ] }
        }
      });
    }
  }

  // zeebe:Property
  if (type === ZEEBE_PROPERTY_TYPE) {
    let zeebeProperties = findExtension(extensionElements, 'zeebe:Properties');

    if (!zeebeProperties) {
      zeebeProperties = createElement('zeebe:Properties', null, businessObject, bpmnFactory);

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), zeebeProperties ]
          }
        }
      });
    }

    const oldZeebeProperty = findZeebeProperty(zeebeProperties, binding);

    const properties = zeebeProperties.get('properties').filter((property) => property !== oldZeebeProperty);

    if (shouldUpdate(value, property)) {
      const newZeebeProperty = createZeebeProperty(binding, value, bpmnFactory);

      properties.push(newZeebeProperty);
    }

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: zeebeProperties,
        properties: {
          properties
        }
      }
    });
  }

  if (commands.length) {
    const commandsToExecute = commands.filter((command) => command !== NO_OP);

    commandsToExecute.length && commandStack.execute(
      'properties-panel.multi-command-executor',
      commandsToExecute
    );

    return;
  }

  // should never throw as templates are validated beforehand
  throw unknownBindingError(element, property);
}


export function unsetProperty(commandStack, element, property) {
  let businessObject = getBusinessObject(element);

  const {
    binding
  } = property;

  const {
    type
  } = binding;

  let extensionElements;

  const commands = [];

  const context = {
    element,
    property
  };


  if (EXTENSION_BINDING_TYPES.includes(type)) {
    extensionElements = businessObject.get('extensionElements');
    if (!extensionElements)
      return;
  }

  // zeebe:taskDefinition
  if (TASK_DEFINITION_TYPES.includes(type)) {
    const oldTaskDefinition = findExtension(extensionElements, 'zeebe:TaskDefinition');

    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        ...context,
        moddleElement: extensionElements,
        properties: { values:  without(extensionElements.get('values'), oldTaskDefinition) }
      }
    });
  }


  // zeebe:IoMapping
  if (IO_BINDING_TYPES.includes(type)) {
    let ioMapping = findExtension(extensionElements, 'zeebe:IoMapping');

    if (!ioMapping)
      return;

    // zeebe:Input
    if (type === ZEBBE_INPUT_TYPE) {
      const oldZeebeInputParameter = findInputParameter(ioMapping, binding);
      const values = ioMapping.get('inputParameters').filter((value) => value !== oldZeebeInputParameter);

      if (ioMapping.get('outputParameters').length == 0 && values.length == 0) {

        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            ...context,
            moddleElement: extensionElements,
            properties: {
              values:  without(extensionElements.get('values'), ioMapping)
            }
          }
        });
      }

      else {
        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            ...context,
            moddleElement: ioMapping,
            properties: { inputParameters: [ ...values ] }
          }
        });
      }
    }

    // zeebe:Output
    if (type === ZEEBE_OUTPUT_TYPE) {
      const oldZeebeOutputParameter = findOutputParameter(ioMapping, binding);
      const values = ioMapping.get('outputParameters').filter((value) => value !== oldZeebeOutputParameter);

      if (ioMapping.get('inputParameters').length == 0 && values.length == 0) {

        commands.push({
          cmd: 'element.updateModdleProperties',
          context: {
            ...context,
            moddleElement: extensionElements,
            properties: {
              values: without(extensionElements.get('values'), ioMapping)
            }
          }
        });
      }

      commands.push({
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

  // zeebe:Property
  if (type === ZEEBE_PROPERTY_TYPE) {
    let zeebeProperties = findExtension(extensionElements, 'zeebe:Properties');

    if (!zeebeProperties)
      return;

    const oldZeebeProperty = findZeebeProperty(zeebeProperties, binding);

    const properties = zeebeProperties.get('properties').filter((property) => property !== oldZeebeProperty);

    if (!properties.length) {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          ...context,
          moddleElement: extensionElements,
          properties: {
            values: without(extensionElements.get('values'), zeebeProperties)
          }
        }
      });
    } else {
      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          ...context,
          moddleElement: zeebeProperties,
          properties: {
            properties: [ ...properties ]
          }
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


// helpers
function unknownBindingError(element, property) {
  const businessObject = getBusinessObject(element);

  const id = businessObject.get('id');

  const { binding } = property;

  const { type } = binding;

  return new Error(`unknown binding <${ type }> for element <${ id }>, this should never happen`);
}
