import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import {
  findCamundaErrorEventDefinition,
  findExtension,
  findExtensions
} from '../Helper';

import handleLegacyScopes from '../util/handleLegacyScopes';

import {
  createCamundaExecutionListenerScript,
  createCamundaFieldInjection,
  createCamundaIn,
  createCamundaInWithBusinessKey,
  createCamundaOut,
  createCamundaProperty,
  createInputParameter,
  createOutputParameter,
  createCamundaErrorEventDefinition,
  createError
} from '../CreateHelper';

import { getSignalEventDefinition } from '../../bpmn/utils/EventDefinitionUtil';

import { getRoot } from '../../../utils/ElementUtil';

import {
  find,
  isString,
  isUndefined,
  keys,
  without
} from 'min-dash';

const CAMUNDA_SERVICE_TASK_LIKE = [
  'camunda:class',
  'camunda:delegateExpression',
  'camunda:expression'
];

/**
 * Applies an element template to an element. Sets `camunda:modelerTemplate` and
 * `camunda:modelerTemplateVersion`.
 */
export default class ChangeElementTemplateHandler {
  constructor(bpmnFactory, commandStack, modeling) {
    this._bpmnFactory = bpmnFactory;
    this._commandStack = commandStack;
    this._modeling = modeling;
  }

  /**
   * Change an element's template and update its properties as specified in `newTemplate`. Specify
   * `oldTemplate` to update from one template to another. If `newTemplate` isn't specified the
   * `camunda:modelerTemplate` and `camunda:modelerTemplateVersion` properties will be removed from
   * the element.
   *
   * @param {Object} context
   * @param {Object} context.element
   * @param {Object} [context.oldTemplate]
   * @param {Object} [context.newTemplate]
   */
  preExecute(context) {
    const element = context.element,
          newTemplate = context.newTemplate,
          oldTemplate = context.oldTemplate;

    // update camunda:modelerTemplate attribute
    this._updateCamundaModelerTemplate(element, newTemplate);

    if (newTemplate) {

      // update properties
      this._updateProperties(element, oldTemplate, newTemplate);

      // update camunda:ExecutionListener properties
      this._updateCamundaExecutionListenerProperties(element, newTemplate);

      // update camunda:Field properties
      this._updateCamundaFieldProperties(element, oldTemplate, newTemplate);

      // update camunda:In and camunda:Out properties
      this._updateCamundaInOutProperties(element, oldTemplate, newTemplate);

      // update camunda:InputParameter and camunda:OutputParameter properties
      this._updateCamundaInputOutputParameterProperties(element, oldTemplate, newTemplate);

      // update camunda:Property properties
      this._updateCamundaPropertyProperties(element, oldTemplate, newTemplate);

      // update camunda:ErrorEventDefinition properties
      this._updateCamundaErrorEventDefinitionProperties(element, oldTemplate, newTemplate);

      // update properties for each scope
      handleLegacyScopes(newTemplate.scopes).forEach((newScopeTemplate) => {
        this._updateScopeProperties(element, oldTemplate, newScopeTemplate, newTemplate);
      });

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

  /**
   * Update `camunda:ErrorEventDefinition` properties of specified business object. Event
   * definitions can only exist in `bpmn:ExtensionElements`.
   *
   * Ensures an bpmn:Error exists for the event definition.
   *
   * @param {djs.model.Base} element
   * @param {Object} oldTemplate
   * @param {Object} newTemplate
   */
  _updateCamundaErrorEventDefinitionProperties(element, oldTemplate, newTemplate) {
    const bpmnFactory = this._bpmnFactory,
          commandStack = this._commandStack;

    const newProperties = newTemplate.properties.filter((newProperty) => {
      const newBinding = newProperty.binding,
            newBindingType = newBinding.type;

      return newBindingType === 'camunda:errorEventDefinition';
    });

    // (1) do not override if no updates
    if (!newProperties.length) {
      return;
    }

    const extensionElements = this._getOrCreateExtensionElements(element);

    const oldErrorEventDefinitions = findExtensions(element, [ 'camunda:ErrorEventDefinition' ]);

    newProperties.forEach((newProperty) => {
      const oldProperty = findOldProperty(oldTemplate, newProperty),
            oldEventDefinition = oldProperty && findOldBusinessObject(extensionElements, oldProperty),
            newBinding = newProperty.binding;

      // (2) update old event definitions
      if (oldProperty && oldEventDefinition) {

        if (!propertyChanged(oldEventDefinition, oldProperty)) {
          commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: oldEventDefinition,
            properties: {
              expression: newProperty.value
            }
          });
        }

        remove(oldErrorEventDefinitions, oldEventDefinition);
      }

      // (3) create new event definition + error
      else {
        const rootElement = getRoot(getBusinessObject(element)),
              newError = createError(newBinding.errorRef, rootElement, bpmnFactory),
              newEventDefinition = createCamundaErrorEventDefinition(newProperty.value, newError, extensionElements, bpmnFactory);

        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: rootElement,
          properties: {
            rootElements: [ ...rootElement.get('rootElements'), newError ]
          }
        });

        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), newEventDefinition ]
          }
        });
      }

    });

    // (4) remove old event definitions
    if (oldErrorEventDefinitions.length) {
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: extensionElements,
        properties: {
          values: without(extensionElements.get('values'), value => oldErrorEventDefinitions.includes(value))
        }
      });
    }
  }

  /**
   * Update `camunda:ExecutionListener` properties of specified business object. Execution listeners
   * will always be overridden. Execution listeners can only exist in `bpmn:ExtensionElements`.
   *
   * @param {djs.model.Base} element
   * @param {Object} newTemplate
   */
  _updateCamundaExecutionListenerProperties(element, newTemplate) {
    const bpmnFactory = this._bpmnFactory,
          commandStack = this._commandStack;

    const newProperties = newTemplate.properties.filter((newProperty) => {
      const newBinding = newProperty.binding,
            newBindingType = newBinding.type;

      return newBindingType === 'camunda:executionListener';
    });

    // (1) do not override old execution listeners if no new execution listeners specified
    if (!newProperties.length) {
      return;
    }

    const extensionElements = this._getOrCreateExtensionElements(element);

    // (2) remove old execution listeners
    const oldExecutionListeners = findExtensions(element, [ 'camunda:ExecutionListener' ]);

    // (3) add new execution listeners
    const newExecutionListeners = newProperties.map((newProperty) => {
      const newBinding = newProperty.binding,
            propertyValue = newProperty.value;

      return createCamundaExecutionListenerScript(newBinding, propertyValue, bpmnFactory);
    });

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: extensionElements,
      properties: {
        values: [
          ...without(extensionElements.get('values'), value => oldExecutionListeners.includes(value)),
          ...newExecutionListeners
        ]
      }
    });
  }

  /**
   * Update `camunda:Field` properties of specified business object.
   * If business object is `camunda:ExecutionListener` or `camunda:TaskListener` `fields` property
   * will be updated. Otherwise `extensionElements.values` property will be updated.
   *
   * @param {djs.model.Base} element
   * @param {Object} oldTemplate
   * @param {Object} newTemplate
   * @param {ModdleElement} businessObject
   */
  _updateCamundaFieldProperties(element, oldTemplate, newTemplate, businessObject) {
    const bpmnFactory = this._bpmnFactory,
          commandStack = this._commandStack;

    const newProperties = newTemplate.properties.filter((newProperty) => {
      const newBinding = newProperty.binding,
            newBindingType = newBinding.type;

      return newBindingType === 'camunda:field';
    });

    // (1) do not override old fields if no new fields specified
    if (!newProperties.length) {
      return;
    }

    if (!businessObject) {
      businessObject = this._getOrCreateExtensionElements(element);
    }

    const propertyName = isAny(businessObject, [ 'camunda:ExecutionListener', 'camunda:TaskListener' ])
      ? 'fields'
      : 'values';

    const oldFields = findExtensions(element, [ 'camunda:Field' ]);

    newProperties.forEach((newProperty) => {
      const oldProperty = findOldProperty(oldTemplate, newProperty),
            oldField = oldProperty && findOldBusinessObject(businessObject, oldProperty),
            newBinding = newProperty.binding;

      // (2) update old fields
      if (oldProperty && oldField) {

        if (!propertyChanged(oldField, oldProperty)) {
          commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: oldField,
            properties: {
              string: newProperty.value
            }
          });
        }

        remove(oldFields, oldField);
      }

      // (3) add new fields
      else {
        const newCamundaFieldInjection = createCamundaFieldInjection(newBinding, newProperty.value, bpmnFactory);

        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: businessObject,
          properties: {
            [ propertyName ]: [ ...businessObject.get(propertyName), newCamundaFieldInjection ]
          }
        });
      }
    });

    // (4) remove old fields
    if (oldFields.length) {
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: businessObject,
        properties: {
          [ propertyName ]: without(businessObject.get(propertyName), value => oldFields.includes(value))
        }
      });
    }
  }

  /**
   * Update `camunda:In` and `camunda:Out` properties of specified business object. Only
   * `bpmn:CallActivity` and events with `bpmn:SignalEventDefinition` can have ins. Only
   * `camunda:CallActivity` can have outs.
   *
   * @param {djs.model.Base} element
   * @param {Object} oldTemplate
   * @param {Object} newTemplate
   */
  _updateCamundaInOutProperties(element, oldTemplate, newTemplate) {
    const bpmnFactory = this._bpmnFactory,
          commandStack = this._commandStack;

    const newProperties = newTemplate.properties.filter((newProperty) => {
      const newBinding = newProperty.binding,
            newBindingType = newBinding.type;

      return newBindingType === 'camunda:in'
      || newBindingType === 'camunda:in:businessKey'
      || newBindingType === 'camunda:out';
    });

    // (1) do not override old fields if no new fields specified
    if (!newProperties.length) {
      return;
    }

    // get extension elements of either signal event definition or call activity
    const extensionElements = this._getOrCreateExtensionElements(getSignalEventDefinition(element) || element);

    const oldInsAndOuts = findExtensions(extensionElements, [ 'camunda:In', 'camunda:Out' ]);

    newProperties.forEach((newProperty) => {
      const oldProperty = findOldProperty(oldTemplate, newProperty),
            oldBinding = oldProperty && oldProperty.binding,
            oldInOurOut = oldProperty && findOldBusinessObject(extensionElements, oldProperty),
            newPropertyValue = newProperty.value,
            newBinding = newProperty.binding,
            newBindingType = newBinding.type,
            properties = {};

      let newInOrOut;

      // (2) update old ins and outs
      if (oldProperty && oldInOurOut) {

        if (!propertyChanged(oldInOurOut, oldProperty)) {
          if (newBindingType === 'camunda:in') {
            if (newBinding.expression) {
              properties[ 'camunda:sourceExpression' ] = newPropertyValue;
            } else {
              properties[ 'camunda:source' ] = newPropertyValue;
            }
          } else if (newBindingType === 'camunda:in:businessKey') {
            properties[ 'camunda:businessKey' ] = newPropertyValue;
          } else if (newBindingType === 'camunda:out') {
            properties[ 'camunda:target' ] = newPropertyValue;
          }
        }

        // update camunda:local property if it changed
        if ((oldBinding.local && !newBinding.local) || !oldBinding.local && newBinding.local) {
          properties.local = newBinding.local;
        }

        if (keys(properties)) {
          commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: oldInOurOut,
            properties
          });
        }

        remove(oldInsAndOuts, oldInOurOut);
      }

      // (3) add new ins and outs
      else {
        if (newBindingType === 'camunda:in') {
          newInOrOut = createCamundaIn(newBinding, newPropertyValue, bpmnFactory);
        } else if (newBindingType === 'camunda:out') {
          newInOrOut = createCamundaOut(newBinding, newPropertyValue, bpmnFactory);
        } else if (newBindingType === 'camunda:in:businessKey') {
          newInOrOut = createCamundaInWithBusinessKey(newPropertyValue, bpmnFactory);
        }

        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: extensionElements,
          properties: {
            values: [ ...extensionElements.get('values'), newInOrOut ]
          }
        });
      }
    });

    // (4) remove old ins and outs
    if (oldInsAndOuts.length) {
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: extensionElements,
        properties: {
          values: without(extensionElements.get('values'), value => oldInsAndOuts.includes(value))
        }
      });
    }
  }

  /**
   * Update `camunda:InputParameter` and `camunda:OutputParameter` properties of specified business
   * object. Both can only exist in `camunda:InputOutput` which can exist in `bpmn:ExtensionElements`
   * or `camunda:Connector`.
   *
   * @param {djs.model.Base} element
   * @param {Object} oldTemplate
   * @param {Object} newTemplate
   */
  _updateCamundaInputOutputParameterProperties(element, oldTemplate, newTemplate, businessObject) {
    const bpmnFactory = this._bpmnFactory,
          commandStack = this._commandStack;

    const newProperties = newTemplate.properties.filter((newProperty) => {
      const newBinding = newProperty.binding,
            newBindingType = newBinding.type;

      return newBindingType === 'camunda:inputParameter' || newBindingType === 'camunda:outputParameter';
    });

    // (1) do not override old inputs and outputs if no new inputs and outputs specified
    if (!newProperties.length) {
      return;
    }

    if (!businessObject) {
      businessObject = this._getOrCreateExtensionElements(element);
    }

    let inputOutput;

    if (is(businessObject, 'camunda:Connector')) {
      inputOutput = businessObject.get('camunda:inputOutput');

      if (!inputOutput) {
        inputOutput = bpmnFactory.create('camunda:InputOutput');

        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: businessObject,
          properties: {
            inputOutput
          }
        });
      }
    } else {
      inputOutput = findExtension(businessObject, 'camunda:InputOutput');

      if (!inputOutput) {
        inputOutput = bpmnFactory.create('camunda:InputOutput');

        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: businessObject,
          properties: {
            values: [ ...businessObject.get('values'), inputOutput ]
          }
        });
      }
    }

    const oldInputs = inputOutput.get('camunda:inputParameters')
      ? inputOutput.get('camunda:inputParameters').slice()
      : [];

    const oldOutputs = inputOutput.get('camunda:outputParameters')
      ? inputOutput.get('camunda:outputParameters').slice()
      : [];

    let propertyName;

    newProperties.forEach((newProperty) => {
      const oldProperty = findOldProperty(oldTemplate, newProperty),
            oldInputOrOutput = oldProperty && findOldBusinessObject(businessObject, oldProperty),
            newPropertyValue = newProperty.value,
            newBinding = newProperty.binding,
            newBindingType = newBinding.type;

      let newInputOrOutput,
          properties;

      // (2) update old inputs and outputs
      if (oldProperty && oldInputOrOutput) {

        if (!propertyChanged(oldInputOrOutput, oldProperty)) {
          if (is(oldInputOrOutput, 'camunda:InputParameter')) {
            properties = {
              value: newPropertyValue
            };
          } else {
            properties = {
              name: newPropertyValue
            };
          }

          commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: oldInputOrOutput,
            properties
          });
        }

        if (is(oldInputOrOutput, 'camunda:InputParameter')) {
          remove(oldInputs, oldInputOrOutput);
        } else {
          remove(oldOutputs, oldInputOrOutput);
        }
      }

      // (3) add new inputs and outputs
      else {
        if (newBindingType === 'camunda:inputParameter') {
          propertyName = 'inputParameters';

          newInputOrOutput = createInputParameter(newBinding, newPropertyValue, bpmnFactory);
        } else {
          propertyName = 'outputParameters';

          newInputOrOutput = createOutputParameter(newBinding, newPropertyValue, bpmnFactory);
        }

        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: inputOutput,
          properties: {
            [ propertyName ]: [ ...inputOutput.get(propertyName), newInputOrOutput ]
          }
        });
      }
    });

    // (4) remove old inputs and outputs
    if (oldInputs.length) {
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: inputOutput,
        properties: {
          inputParameters: without(inputOutput.get('inputParameters'), inputParameter => oldInputs.includes(inputParameter))
        }
      });
    }

    if (oldOutputs.length) {
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: inputOutput,
        properties: {
          outputParameters: without(inputOutput.get('outputParameters'), outputParameter => oldOutputs.includes(outputParameter))
        }
      });
    }
  }

  _updateCamundaModelerTemplate(element, newTemplate) {
    const modeling = this._modeling;

    modeling.updateProperties(element, {
      'camunda:modelerTemplate': newTemplate && newTemplate.id,
      'camunda:modelerTemplateVersion': newTemplate && newTemplate.version
    });
  }

  /**
   * Update `camunda:Property` properties of specified business object. `camunda:Property` can only
   * exist in `camunda:Properties`.
   *
   * @param {djs.model.Base} element
   * @param {Object} oldTemplate
   * @param {Object} newTemplate
   * @param {ModdleElement} businessObject
   */
  _updateCamundaPropertyProperties(element, oldTemplate, newTemplate, businessObject) {
    const bpmnFactory = this._bpmnFactory,
          commandStack = this._commandStack;

    const newProperties = newTemplate.properties.filter((newProperty) => {
      const newBinding = newProperty.binding,
            newBindingType = newBinding.type;

      return newBindingType === 'camunda:property';
    });

    // (1) do not override old properties if no new properties specified
    if (!newProperties.length) {
      return;
    }

    if (businessObject) {
      businessObject = this._getOrCreateExtensionElements(businessObject);
    } else {
      businessObject = this._getOrCreateExtensionElements(element);
    }

    let camundaProperties = findExtension(businessObject, 'camunda:Properties');

    if (!camundaProperties) {
      camundaProperties = bpmnFactory.create('camunda:Properties');

      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: businessObject,
        properties: {
          values: [ ...businessObject.get('values'), camundaProperties ]
        }
      });
    }

    const oldCamundaProperties = camundaProperties.get('camunda:values')
      ? camundaProperties.get('camunda:values').slice()
      : [];

    newProperties.forEach((newProperty) => {
      const oldProperty = findOldProperty(oldTemplate, newProperty),
            oldCamundaProperty = oldProperty && findOldBusinessObject(businessObject, oldProperty),
            newPropertyValue = newProperty.value,
            newBinding = newProperty.binding;

      // (2) update old properties
      if (oldProperty && oldCamundaProperty) {

        if (!propertyChanged(oldCamundaProperty, oldProperty)) {
          commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: oldCamundaProperty,
            properties: {
              value: newPropertyValue
            }
          });
        }

        remove(oldCamundaProperties, oldCamundaProperty);
      }

      // (3) add new properties
      else {
        const newCamundaProperty = createCamundaProperty(newBinding, newPropertyValue, bpmnFactory);

        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: camundaProperties,
          properties: {
            values: [ ...camundaProperties.get('values'), newCamundaProperty ]
          }
        });
      }
    });

    // (4) remove old properties
    if (oldCamundaProperties.length) {
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: camundaProperties,
        properties: {
          values: without(camundaProperties.get('values'), value => oldCamundaProperties.includes(value))
        }
      });
    }
  }

  /**
   * Update `bpmn:conditionExpression` property of specified element. Since condition expression is
   * is not primitive it needs special handling.
   *
   * @param {djs.model.Base} element
   * @param {Object} oldProperty
   * @param {Object} newProperty
   */
  _updateConditionExpression(element, oldProperty, newProperty) {
    const bpmnFactory = this._bpmnFactory,
          commandStack = this._commandStack,
          modeling = this._modeling;

    const newBinding = newProperty.binding,
          newPropertyValue = newProperty.value;

    if (!oldProperty) {
      modeling.updateProperties(element, {
        conditionExpression: bpmnFactory.create('bpmn:FormalExpression', {
          body: newPropertyValue,
          language: newBinding.scriptFormat
        })
      });

      return;
    }

    const oldBinding = oldProperty.binding,
          oldPropertyValue = oldProperty.value;

    const businessObject = getBusinessObject(element),
          conditionExpression = businessObject.get('bpmn:conditionExpression');

    const properties = {};

    if (conditionExpression.get('body') === oldPropertyValue) {
      properties.body = newPropertyValue;
    }

    if (conditionExpression.get('language') === oldBinding.scriptFormat) {
      properties.language = newBinding.scriptFormat;
    }

    if (!keys(properties).length) {
      return;
    }

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: conditionExpression,
      properties
    });
  }

  _updateProperties(element, oldTemplate, newTemplate, businessObject) {
    const commandStack = this._commandStack;

    const newProperties = newTemplate.properties.filter((newProperty) => {
      const newBinding = newProperty.binding,
            newBindingType = newBinding.type;

      return newBindingType === 'property';
    });

    if (!newProperties.length) {
      return;
    }

    if (!businessObject) {
      businessObject = getBusinessObject(element);
    }

    newProperties.forEach((newProperty) => {
      const oldProperty = findOldProperty(oldTemplate, newProperty),
            newBinding = newProperty.binding,
            newBindingName = newBinding.name,
            newPropertyValue = newProperty.value;

      let changedElement,
          properties;

      if (newBindingName === 'conditionExpression') {
        this._updateConditionExpression(element, oldProperty, newProperty);
      } else {

        if (is(businessObject, 'bpmn:Error')) {
          changedElement = businessObject;
        } else {
          changedElement = element;
        }

        if (oldProperty && propertyChanged(changedElement, oldProperty)) {
          return;
        }

        properties = {};

        properties[ newBindingName ] = newPropertyValue;

        // only one of `camunda:class`, `camunda:delegateExpression` and `camunda:expression` can be set
        // TODO(philippfromme): ensuring only one of these properties is set at a time should be
        // implemented in a behavior and not in this handler and properties panel UI
        if (CAMUNDA_SERVICE_TASK_LIKE.indexOf(newBindingName) !== -1) {
          CAMUNDA_SERVICE_TASK_LIKE.forEach((camundaServiceTaskLikeProperty) => {
            if (camundaServiceTaskLikeProperty !== newBindingName) {
              properties[ camundaServiceTaskLikeProperty ] = undefined;
            }
          });
        }

        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: businessObject,
          properties
        });
      }
    });
  }

  /**
   * Update properties for a specified scope.
   *
   * @param {djs.model.Base} element
   * @param {Object} oldTemplate
   * @param {Object} newScopeTemplate
   * @param {Object} newTemplate
   */
  _updateScopeProperties(element, oldTemplate, newScopeTemplate, newTemplate) {
    const bpmnFactory = this._bpmnFactory,
          commandStack = this._commandStack;

    const scopeName = newScopeTemplate.type;

    let scopeElement;

    scopeElement = findOldScopeElement(element, newScopeTemplate, newTemplate);

    if (!scopeElement) {

      scopeElement = bpmnFactory.create(scopeName);
    }

    const oldScopeTemplate = findOldScopeTemplate(newScopeTemplate, oldTemplate);

    // update properties
    this._updateProperties(element, oldScopeTemplate, newScopeTemplate, scopeElement);

    // update camunda:ExecutionListener properties
    this._updateCamundaExecutionListenerProperties(element, newScopeTemplate);

    // update camunda:In and camunda:Out properties
    this._updateCamundaInOutProperties(element, oldScopeTemplate, newScopeTemplate);

    // update camunda:InputParameter and camunda:OutputParameter properties
    this._updateCamundaInputOutputParameterProperties(element, oldScopeTemplate, newScopeTemplate, scopeElement);

    // update camunda:Field properties
    this._updateCamundaFieldProperties(element, oldScopeTemplate, newScopeTemplate, scopeElement);

    // update camunda:Property properties
    this._updateCamundaPropertyProperties(element, oldScopeTemplate, newScopeTemplate, scopeElement);

    // assume that root elements were already created in root by referenced event definition binding
    if (isRootElementScope(scopeName)) {
      return;
    }

    const extensionElements = this._getOrCreateExtensionElements(element);

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: extensionElements,
      properties: {
        values: [ ...extensionElements.get('values'), scopeElement ]
      }
    });
  }
}

ChangeElementTemplateHandler.$inject = [
  'bpmnFactory',
  'commandStack',
  'modeling'
];


// helpers //////////

/**
 * Find old business object matching specified old property.
 *
 * @param {djs.model.Base|ModdleElement} element
 * @param {Object} oldProperty
 *
 * @returns {ModdleElement}
 */
function findOldBusinessObject(element, oldProperty) {
  let businessObject = getBusinessObject(element),
      propertyName;

  const oldBinding = oldProperty.binding,
        oldBindingType = oldBinding.type;

  if (oldBindingType === 'camunda:field') {

    if (isAny(businessObject, [ 'camunda:ExecutionListener', 'camunda:TaskListener' ])) {
      propertyName = 'camunda:fields';
    } else {
      propertyName = 'bpmn:values';
    }

    if (!businessObject || !businessObject.get(propertyName) || !businessObject.get(propertyName).length) {
      return;
    }

    return find(businessObject.get(propertyName), function(oldBusinessObject) {
      return oldBusinessObject.get('camunda:name') === oldBinding.name;
    });
  }

  if (oldBindingType === 'camunda:in') {
    return find(businessObject.get('values'), function(oldBusinessObject) {
      return oldBusinessObject.get('target') === oldBinding.target;
    });
  }

  if (oldBindingType === 'camunda:in:businessKey') {
    return find(businessObject.get('values'), function(oldBusinessObject) {
      return isString(oldBusinessObject.get('businessKey'));
    });
  }

  if (oldBindingType === 'camunda:out') {
    return find(businessObject.get('values'), function(oldBusinessObject) {
      return oldBusinessObject.get('source') === oldBinding.source ||
        oldBusinessObject.get('sourceExpression') || oldBinding.sourceExpression;
    });
  }

  if (oldBindingType === 'camunda:inputParameter' || oldBindingType === 'camunda:outputParameter') {

    if (is(businessObject, 'camunda:Connector')) {
      businessObject = businessObject.get('camunda:inputOutput');

      if (!businessObject) {
        return;
      }
    } else {
      businessObject = findExtension(businessObject, 'camunda:InputOutput');

      if (!businessObject) {
        return;
      }
    }

    if (oldBindingType === 'camunda:inputParameter') {
      return find(businessObject.get('camunda:inputParameters'), function(oldBusinessObject) {
        return oldBusinessObject.get('camunda:name') === oldBinding.name;
      });
    } else {
      return find(businessObject.get('camunda:outputParameters'), function(oldBusinessObject) {
        if (oldBinding.scriptFormat) {
          const definition = oldBusinessObject.get('camunda:definition');

          return definition && definition.get('camunda:value') === oldBinding.source;
        } else {
          return oldBusinessObject.get('camunda:value') === oldBinding.source;
        }
      });
    }

  }

  if (oldBindingType === 'camunda:property') {
    if (!businessObject || !businessObject.get('values') || !businessObject.get('values').length) {
      return;
    }

    businessObject = findExtension(businessObject, 'camunda:Properties');

    if (!businessObject) {
      return;
    }

    return find(businessObject.get('values'), function(oldBusinessObject) {
      return oldBusinessObject.get('camunda:name') === oldBinding.name;
    });
  }

  if (oldBindingType === 'camunda:errorEventDefinition') {
    return findCamundaErrorEventDefinition(element, oldBinding.errorRef);
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

  if (newBindingType === 'camunda:field') {
    return find(oldProperties, function(oldProperty) {
      const oldBinding = oldProperty.binding,
            oldBindingName = oldBinding.name,
            oldBindingType = oldBinding.type;

      return oldBindingType === 'camunda:field' && oldBindingName === newBindingName;
    });
  }

  if (newBindingType === 'camunda:in') {
    return find(oldProperties, function(oldProperty) {
      const oldBinding = oldProperty.binding,
            oldBindingType = oldBinding.type;

      if (oldBindingType !== 'camunda:in') {
        return;
      }

      // always override if change from source to source expression or vice versa
      if ((oldBinding.expression && !newBinding.expression) ||
        !oldBinding.expression && newBinding.expression) {
        return;
      }

      return oldBinding.target === newBinding.target;
    });
  }

  if (newBindingType === 'camunda:in:businessKey') {
    return find(oldProperties, function(oldProperty) {
      const oldBinding = oldProperty.binding,
            oldBindingType = oldBinding.type;

      return oldBindingType === 'camunda:in:businessKey';
    });
  }

  if (newBindingType === 'camunda:out') {
    return find(oldProperties, function(oldProperty) {
      const oldBinding = oldProperty.binding,
            oldBindingType = oldBinding.type;

      return oldBindingType === 'camunda:out' && (
        oldBinding.source === newBinding.source ||
        oldBinding.sourceExpression === newBinding.sourceExpression
      );
    });
  }

  if (newBindingType === 'camunda:inputParameter') {
    return find(oldProperties, function(oldProperty) {
      const oldBinding = oldProperty.binding,
            oldBindingName = oldBinding.name,
            oldBindingType = oldBinding.type;

      if (oldBindingType !== 'camunda:inputParameter') {
        return;
      }

      return oldBindingName === newBindingName
        && oldBinding.scriptFormat === newBinding.scriptFormat;
    });
  }

  if (newBindingType === 'camunda:outputParameter') {
    return find(oldProperties, function(oldProperty) {
      const oldBinding = oldProperty.binding,
            oldBindingType = oldBinding.type;

      if (oldBindingType !== 'camunda:outputParameter') {
        return;
      }

      return oldBinding.source === newBinding.source
        && oldBinding.scriptFormat === newBinding.scriptFormat;
    });
  }

  if (newBindingType === 'camunda:property') {
    return find(oldProperties, function(oldProperty) {
      const oldBinding = oldProperty.binding,
            oldBindingName = oldBinding.name,
            oldBindingType = oldBinding.type;

      return oldBindingType === 'camunda:property' && oldBindingName === newBindingName;
    });
  }

  if (newBindingType === 'camunda:errorEventDefinition') {
    return find(oldProperties, function(oldProperty) {
      const newBindingRef = newBinding.errorRef,
            oldBinding = oldProperty.binding,
            oldBindingRef = oldBinding.errorRef,
            oldBindingType = oldBinding.type;

      return oldBindingType === 'camunda:errorEventDefinition'
        && oldBindingRef === newBindingRef;
    });
  }
}

function findOldScopeElement(element, scopeTemplate, template) {
  const scopeName = scopeTemplate.type,
        id = scopeTemplate.id;

  if (scopeName === 'camunda:Connector') {
    return findExtension(element, 'camunda:Connector');
  }

  if (scopeName === 'bpmn:Error') {

    // (1) find by error event definition binding
    const errorEventDefinitionBinding = findErrorEventDefinitionBinding(template, id);

    if (!errorEventDefinitionBinding) {
      return;
    }

    // (2) find error event definition
    const errorEventDefinition = findOldBusinessObject(element, errorEventDefinitionBinding);

    if (!errorEventDefinition) {
      return;
    }

    // (3) retrieve referenced error
    return errorEventDefinition.errorRef;
  }
}

function isRootElementScope(scopeName) {
  return [ 'bpmn:Error' ].includes(scopeName);
}

function findOldScopeTemplate(scopeTemplate, oldTemplate) {
  const scopeName = scopeTemplate.type,
        scopeId = scopeTemplate.id,
        scopes = oldTemplate && handleLegacyScopes(oldTemplate.scopes);

  return scopes && find(scopes, function(scope) {

    if (isRootElementScope(scopeName)) {
      return scope.id === scopeId;
    }

    return scope.type === scopeName;
  });
}

function findErrorEventDefinitionBinding(template, templateErrorId) {
  return find(template.properties, function(property) {
    return property.binding.errorRef === templateErrorId;
  });
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
  const businessObject = getBusinessObject(element);

  const oldBinding = oldProperty.binding,
        oldBindingName = oldBinding.name,
        oldBindingType = oldBinding.type,
        oldPropertyValue = oldProperty.value;

  let conditionExpression,
      definition;

  if (oldBindingType === 'property') {
    if (oldBindingName === 'conditionExpression') {
      conditionExpression = businessObject.get('bpmn:conditionExpression');

      return conditionExpression.get('bpmn:body') !== oldPropertyValue;
    }

    return businessObject.get(oldBindingName) !== oldPropertyValue;
  }

  if (oldBindingType === 'camunda:field') {
    return businessObject.get('camunda:string') !== oldPropertyValue;
  }

  if (oldBindingType === 'camunda:in') {
    if (oldBinding.expression) {
      return businessObject.get('sourceExpression') !== oldPropertyValue;
    } else {
      return businessObject.get('camunda:source') !== oldPropertyValue;
    }
  }

  if (oldBindingType === 'camunda:in:businessKey') {
    return businessObject.get('camunda:businessKey') !== oldPropertyValue;
  }

  if (oldBindingType === 'camunda:out') {
    return businessObject.get('camunda:target') !== oldPropertyValue;
  }

  if (oldBindingType === 'camunda:inputParameter') {
    if (oldBinding.scriptFormat) {
      definition = businessObject.get('camunda:definition');

      return definition && definition.get('camunda:value') !== oldPropertyValue;
    } else {
      return businessObject.get('camunda:value') !== oldPropertyValue;
    }
  }

  if (oldBindingType === 'camunda:outputParameter') {
    return businessObject.get('camunda:name') !== oldPropertyValue;
  }

  if (oldBindingType === 'camunda:property') {
    return businessObject.get('camunda:value') !== oldPropertyValue;
  }

  if (oldBindingType === 'camunda:errorEventDefinition') {
    return businessObject.get('expression') !== oldPropertyValue;
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