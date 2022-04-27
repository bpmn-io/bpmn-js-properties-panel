import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  findExtension
} from '../Helper';

import {
  createInputParameter,
  createOutputParameter,
  createTaskDefinitionWithType,
  createTaskHeader,
  shouldUpdate
} from '../CreateHelper';

import {
  find,
  isUndefined,
  without
} from 'min-dash';

/**
 * Applies an element template to an element. Sets `zeebe:modelerTemplate` and
 * `zeebe:modelerTemplateVersion`.
 */
export default class ChangeElementTemplateHandler {
  constructor(bpmnFactory, bpmnReplace, commandStack, modeling) {
    this._bpmnFactory = bpmnFactory;
    this._bpmnReplace = bpmnReplace;
    this._commandStack = commandStack;
    this._modeling = modeling;
  }

  /**
   * Change an element's template and update its properties as specified in `newTemplate`. Specify
   * `oldTemplate` to update from one template to another. If `newTemplate` isn't specified the
   * `zeebe:modelerTemplate` and `zeebe:modelerTemplateVersion` properties will be removed from
   * the element.
   *
   * @param {Object} context
   * @param {Object} context.element
   * @param {Object} [context.oldTemplate]
   * @param {Object} [context.newTemplate]
   */
  preExecute(context) {
    const newTemplate = context.newTemplate,
          oldTemplate = context.oldTemplate;

    let element = context.element;

    // update zeebe:modelerTemplate attribute
    this._updateZeebeModelerTemplate(element, newTemplate);

    // update zeebe:modelerTemplateIcon
    this._updateZeebeModelerTemplateIcon(element, newTemplate);

    if (newTemplate) {

      // update task type
      element = context.element = this._updateTaskType(element, newTemplate);

      // update properties
      this._updateProperties(element, oldTemplate, newTemplate);

      // update zeebe:TaskDefinition
      this._updateZeebeTaskDefinition(element, oldTemplate, newTemplate);

      // update zeebe:Input and zeebe:Output properties
      this._updateZeebeInputOutputParameterProperties(element, oldTemplate, newTemplate);

      // update zeebe:Header properties
      this._updateZeebeTaskHeaderProperties(element, oldTemplate, newTemplate);
    }
  }

  _getOrCreateExtensionElements(element) {
    const bpmnFactory = this._bpmnFactory,
          modeling = this._modeling;

    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    if (!extensionElements) {
      extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
        values: []
      });

      extensionElements.$parent = businessObject;

      modeling.updateProperties(element, {
        extensionElements: extensionElements
      });
    }

    return extensionElements;
  }

  _updateZeebeModelerTemplate(element, newTemplate) {
    const modeling = this._modeling;

    modeling.updateProperties(element, {
      'zeebe:modelerTemplate': newTemplate && newTemplate.id,
      'zeebe:modelerTemplateVersion': newTemplate && newTemplate.version
    });
  }

  _updateZeebeModelerTemplateIcon(element, newTemplate) {
    const modeling = this._modeling;

    const icon = newTemplate && newTemplate.icon;


    modeling.updateProperties(element, {
      'zeebe:modelerTemplateIcon': icon && icon.contents
    });
  }

  _updateProperties(element, oldTemplate, newTemplate) {
    const commandStack = this._commandStack;

    const newProperties = newTemplate.properties.filter((newProperty) => {
      const newBinding = newProperty.binding,
            newBindingType = newBinding.type;

      return newBindingType === 'property';
    });

    if (!newProperties.length) {
      return;
    }

    const businessObject = getBusinessObject(element);

    newProperties.forEach((newProperty) => {
      const oldProperty = findOldProperty(oldTemplate, newProperty),
            newBinding = newProperty.binding,
            newBindingName = newBinding.name,
            newPropertyValue = newProperty.value,
            changedElement = businessObject;

      let properties = {};

      if (shouldKeepValue(changedElement, oldProperty, newProperty)) {
        return;
      }

      properties[ newBindingName ] = newPropertyValue;

      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: businessObject,
        properties
      });
    });
  }

  /**
   * Update `zeebe:TaskDefinition` properties of specified business object. This
   * can only exist in `bpmn:ExtensionElements`.
   *
   * @param {djs.model.Base} element
   * @param {Object} oldTemplate
   * @param {Object} newTemplate
   */
  _updateZeebeTaskDefinition(element, oldTemplate, newTemplate) {
    const bpmnFactory = this._bpmnFactory,
          commandStack = this._commandStack;

    const newProperties = newTemplate.properties.filter((newProperty) => {
      const newBinding = newProperty.binding,
            newBindingType = newBinding.type;

      return newBindingType === 'zeebe:taskDefinition:type';
    });

    // (1) do not override old task definition if no new properties specified
    if (!newProperties.length) {
      return;
    }

    const businessObject = this._getOrCreateExtensionElements(element);

    newProperties.forEach((newProperty) => {
      const oldProperty = findOldProperty(oldTemplate, newProperty),
            oldBinding = oldProperty && oldProperty.binding,
            oldBindingType = oldBinding && oldBinding.type,
            oldTaskDefinition = findBusinessObject(businessObject, newProperty),
            newPropertyValue = newProperty.value,
            newBinding = newProperty.binding,
            newBindingType = newBinding.type;

      // (2) update old task definition
      if (oldTaskDefinition) {

        if (!shouldKeepValue(oldTaskDefinition, oldProperty, newProperty)) {

          // TODO(pinussilvestrus): for now we only support <type>
          // this needs to be adjusted once we support more
          let properties = {};

          if (oldBindingType === 'zeebe:taskDefinition:type') {
            properties = {
              type: newPropertyValue
            };
          }

          commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: oldTaskDefinition,
            properties
          });
        }
      }

      // (3) add new task definition
      else {
        let newTaskDefinition;

        // TODO(pinussilvestrus): for now we only support <type>
        // this needs to be adjusted once we support more
        if (newBindingType === 'zeebe:taskDefinition:type') {
          newTaskDefinition = createTaskDefinitionWithType(newPropertyValue, bpmnFactory);
        }

        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: businessObject,
          properties: {
            values: [ ...businessObject.get('values'), newTaskDefinition ]
          }
        });
      }
    });
  }

  /**
   * Update `zeebe:Input` and `zeebe:Output` properties of specified business
   * object. Both can only exist in `zeebe:ioMapping` which can exist in `bpmn:ExtensionElements`.
   *
   * @param {djs.model.Base} element
   * @param {Object} oldTemplate
   * @param {Object} newTemplate
   */
  _updateZeebeInputOutputParameterProperties(element, oldTemplate, newTemplate) {
    const bpmnFactory = this._bpmnFactory,
          commandStack = this._commandStack;

    const newProperties = newTemplate.properties.filter((newProperty) => {
      const newBinding = newProperty.binding,
            newBindingType = newBinding.type;

      return newBindingType === 'zeebe:input' || newBindingType === 'zeebe:output';
    });

    const businessObject = this._getOrCreateExtensionElements(element);

    let ioMapping = findExtension(businessObject, 'zeebe:IoMapping');

    // (1) remove old mappings if no new specified
    if (!newProperties.length) {
      if (!ioMapping) {
        return;
      }

      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: businessObject,
        properties: {
          values: without(businessObject.get('values'), ioMapping)
        }
      });
    }

    if (!ioMapping) {
      ioMapping = bpmnFactory.create('zeebe:IoMapping');

      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: businessObject,
        properties: {
          values: [ ...businessObject.get('values'), ioMapping ]
        }
      });
    }

    const oldInputs = ioMapping.get('zeebe:inputParameters')
      ? ioMapping.get('zeebe:inputParameters').slice()
      : [];

    const oldOutputs = ioMapping.get('zeebe:outputParameters')
      ? ioMapping.get('zeebe:outputParameters').slice()
      : [];

    let propertyName;

    newProperties.forEach((newProperty) => {
      const oldProperty = findOldProperty(oldTemplate, newProperty),
            inputOrOutput = findBusinessObject(businessObject, newProperty),
            newPropertyValue = newProperty.value,
            newBinding = newProperty.binding,
            newBindingType = newBinding.type;

      let newInputOrOutput,
          properties;

      // (2) update old inputs and outputs
      if (inputOrOutput) {

        // (2a) exclude old inputs and outputs from cleanup, unless
        // a) optional and has empty value, and
        // b) not changed
        if (
          shouldUpdate(newPropertyValue, newProperty) ||
          shouldKeepValue(inputOrOutput, oldProperty, newProperty)
        ) {
          if (is(inputOrOutput, 'zeebe:Input')) {
            remove(oldInputs, inputOrOutput);
          } else {
            remove(oldOutputs, inputOrOutput);
          }
        }

        // (2a) do updates (unless changed)
        if (!shouldKeepValue(inputOrOutput, oldProperty, newProperty)) {

          if (is(inputOrOutput, 'zeebe:Input')) {
            properties = {
              source: newPropertyValue
            };
          } else {
            properties = {
              target: newPropertyValue
            };
          }

          commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: inputOrOutput,
            properties
          });
        }
      }

      // (3) add new inputs and outputs (unless optional)
      else if (shouldUpdate(newPropertyValue, newProperty)) {
        if (newBindingType === 'zeebe:input') {
          propertyName = 'inputParameters';

          newInputOrOutput = createInputParameter(newBinding, newPropertyValue, bpmnFactory);
        } else {
          propertyName = 'outputParameters';

          newInputOrOutput = createOutputParameter(newBinding, newPropertyValue, bpmnFactory);
        }

        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: ioMapping,
          properties: {
            [ propertyName ]: [ ...ioMapping.get(propertyName), newInputOrOutput ]
          }
        });
      }
    });

    // (4) remove old inputs and outputs
    if (oldInputs.length) {
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: ioMapping,
        properties: {
          inputParameters: without(ioMapping.get('inputParameters'), inputParameter => oldInputs.includes(inputParameter))
        }
      });
    }

    if (oldOutputs.length) {
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: ioMapping,
        properties: {
          outputParameters: without(ioMapping.get('outputParameters'), outputParameter => oldOutputs.includes(outputParameter))
        }
      });
    }
  }

  /**
   * Update `zeebe:Header` properties of specified business
   * object. Those can only exist in `zeebe:taskHeaders` which can exist in `bpmn:ExtensionElements`.
   *
   * @param {djs.model.Base} element
   * @param {Object} oldTemplate
   * @param {Object} newTemplate
   */
  _updateZeebeTaskHeaderProperties(element, oldTemplate, newTemplate) {
    const bpmnFactory = this._bpmnFactory,
          commandStack = this._commandStack;

    const newProperties = newTemplate.properties.filter((newProperty) => {
      const newBinding = newProperty.binding,
            newBindingType = newBinding.type;

      return newBindingType === 'zeebe:taskHeader';
    });


    const businessObject = this._getOrCreateExtensionElements(element);

    let taskHeaders = findExtension(businessObject, 'zeebe:TaskHeaders');

    // (1) remove old headers if no new specified
    if (!newProperties.length) {
      if (!taskHeaders) {
        return;
      }

      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: businessObject,
        properties: {
          values: without(businessObject.get('values'), taskHeaders)
        }
      });
    }

    if (!taskHeaders) {
      taskHeaders = bpmnFactory.create('zeebe:TaskHeaders');

      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: businessObject,
        properties: {
          values: [ ...businessObject.get('values'), taskHeaders ]
        }
      });
    }

    const oldHeaders = taskHeaders.get('zeebe:values')
      ? taskHeaders.get('zeebe:values').slice()
      : [];

    newProperties.forEach((newProperty) => {
      const oldProperty = findOldProperty(oldTemplate, newProperty),
            oldHeader = findBusinessObject(businessObject, newProperty),
            newPropertyValue = newProperty.value,
            newBinding = newProperty.binding;

      // (2) update old headers
      if (oldHeader) {

        if (!shouldKeepValue(oldHeader, oldProperty, newProperty)) {
          const properties = {
            value: newPropertyValue
          };

          commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: oldHeader,
            properties
          });
        }

        remove(oldHeaders, oldHeader);
      }

      // (3) add new headers
      else {
        const newHeader = createTaskHeader(newBinding, newPropertyValue, bpmnFactory);

        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: taskHeaders,
          properties: {
            values: [ ...taskHeaders.get('values'), newHeader ]
          }
        });
      }
    });

    // (4) remove old headers
    if (oldHeaders.length) {
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: taskHeaders,
        properties: {
          values: without(taskHeaders.get('values'), header => oldHeaders.includes(header))
        }
      });
    }
  }

  /**
   * Replaces the element with the specified elementType
   *
   * @param {djs.model.Base} element
   * @param {Object} newTemplate
   */
  _updateTaskType(element, newTemplate) {

    // determine new task type
    const newType = newTemplate.elementType;

    if (!newType) {
      return element;
    }

    // don't replace Task that is already the correct type
    if (element.$type === newType.value) {
      return element;
    }

    return this._bpmnReplace.replaceElement(element, { type: newType.value });
  }
}

ChangeElementTemplateHandler.$inject = [
  'bpmnFactory',
  'bpmnReplace',
  'commandStack',
  'modeling'
];


// helpers //////////

/**
 * Find business object matching specified property.
 *
 * @param {djs.model.Base|ModdleElement} element
 * @param {Object} property
 *
 * @returns {ModdleElement}
 */
function findBusinessObject(element, property) {
  const businessObject = getBusinessObject(element);

  const binding = property.binding,
        bindingType = binding.type;

  if (bindingType === 'zeebe:taskDefinition:type') {
    return findExtension(businessObject, 'zeebe:TaskDefinition');
  }

  if (bindingType === 'zeebe:input' || bindingType === 'zeebe:output') {

    const extensionElements = findExtension(businessObject, 'zeebe:IoMapping');

    if (!extensionElements) {
      return;
    }

    if (bindingType === 'zeebe:input') {
      return find(extensionElements.get('zeebe:inputParameters'), function(input) {
        return input.get('zeebe:target') === binding.name;
      });
    } else {
      return find(extensionElements.get('zeebe:outputParameters'), function(output) {
        return output.get('zeebe:source') === binding.source;
      });
    }

  }

  if (bindingType === 'zeebe:taskHeader') {
    const extensionElements = findExtension(businessObject, 'zeebe:TaskHeaders');

    if (!extensionElements) {
      return;
    }

    return find(extensionElements.get('zeebe:values'), function(value) {
      return value.get('zeebe:key') === binding.key;
    });
  }
}

/**
 * Find old property matching specified new property.
 *
 * @param {Object} oldTemplate
 * @param {Object} newProperty
 *
 * @returns {Object}
 */
function findOldProperty(oldTemplate, newProperty) {
  if (!oldTemplate) {
    return;
  }

  const oldProperties = oldTemplate.properties,
        newBinding = newProperty.binding,
        newBindingName = newBinding.name,
        newBindingType = newBinding.type;

  if (newBindingType === 'property') {
    return find(oldProperties, function(oldProperty) {
      const oldBinding = oldProperty.binding,
            oldBindingName = oldBinding.name,
            oldBindingType = oldBinding.type;

      return oldBindingType === 'property' && oldBindingName === newBindingName;
    });
  }

  if (newBindingType === 'zeebe:taskDefinition:type') {
    return find(oldProperties, function(oldProperty) {
      const oldBinding = oldProperty.binding,
            oldBindingType = oldBinding.type;

      return oldBindingType === 'zeebe:taskDefinition:type';
    });
  }

  if (newBindingType === 'zeebe:input') {
    return find(oldProperties, function(oldProperty) {
      const oldBinding = oldProperty.binding,
            oldBindingName = oldBinding.name,
            oldBindingType = oldBinding.type;

      if (oldBindingType !== 'zeebe:input') {
        return;
      }

      return oldBindingName === newBindingName;
    });
  }

  if (newBindingType === 'zeebe:output') {
    return find(oldProperties, function(oldProperty) {
      const oldBinding = oldProperty.binding,
            oldBindingType = oldBinding.type;

      if (oldBindingType !== 'zeebe:output') {
        return;
      }

      return oldBinding.source === newBinding.source;
    });
  }

  if (newBindingType === 'zeebe:taskHeader') {
    return find(oldProperties, function(oldProperty) {
      const oldBinding = oldProperty.binding,
            oldBindingType = oldBinding.type;

      if (oldBindingType !== 'zeebe:taskHeader') {
        return;
      }

      return oldBinding.key === newBinding.key;
    });
  }
}

/**
 * Check whether the existing property should be keept. This is the case if
 *  - an old template was set and the value differs from the default
 *  - no template was set but the property was set manually
 *
 * @param {djs.model.Base|ModdleElement} element
 * @param {Object} oldProperty
 * @param {Object} newProperty
 *
 * @returns {boolean}
 */
function shouldKeepValue(element, oldProperty, newProperty) {
  if (oldProperty) {
    return propertyChanged(element, oldProperty);
  } else {
    return !!getPropertyValue(element, newProperty);
  }
}

/**
 * Check whether property was changed after being set by template.
 *
 * @param {djs.model.Base|ModdleElement} element
 * @param {Object} oldProperty
 *
 * @returns {boolean}
 */
function propertyChanged(element, oldProperty) {
  const oldPropertyValue = oldProperty.value;

  return getPropertyValue(element, oldProperty) !== oldPropertyValue;
}

function getPropertyValue(element, property) {
  const businessObject = getBusinessObject(element);

  const binding = property.binding,
        bindingName = binding.name,
        bindingType = binding.type;


  if (bindingType === 'property') {
    return businessObject.get(bindingName);
  }

  if (bindingType === 'zeebe:taskDefinition:type') {
    return businessObject.get('zeebe:type');
  }

  if (bindingType === 'zeebe:input') {
    return businessObject.get('zeebe:source');
  }

  if (bindingType === 'zeebe:output') {
    return businessObject.get('zeebe:target');
  }

  if (bindingType === 'zeebe:taskHeader') {
    return businessObject.get('zeebe:value');
  }
}

function remove(array, item) {
  const index = array.indexOf(item);

  if (isUndefined(index)) {
    return array;
  }

  array.splice(index, 1);

  return array;
}