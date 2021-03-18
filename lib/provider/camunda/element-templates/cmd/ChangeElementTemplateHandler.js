'use strict';

var findExtension = require('../Helper').findExtension,
    findExtensions = require('../Helper').findExtensions,
    findCamundaErrorEventDefinition = require('../Helper').findCamundaErrorEventDefinition;

var handleLegacyScopes = require('../util/handleLegacyScopes');

var createCamundaExecutionListenerScript = require('../CreateHelper').createCamundaExecutionListenerScript,
    createCamundaFieldInjection = require('../CreateHelper').createCamundaFieldInjection,
    createCamundaIn = require('../CreateHelper').createCamundaIn,
    createCamundaInWithBusinessKey = require('../CreateHelper').createCamundaInWithBusinessKey,
    createCamundaOut = require('../CreateHelper').createCamundaOut,
    createCamundaProperty = require('../CreateHelper').createCamundaProperty,
    createInputParameter = require('../CreateHelper').createInputParameter,
    createOutputParameter = require('../CreateHelper').createOutputParameter,
    createCamundaErrorEventDefinition = require('../CreateHelper').createCamundaErrorEventDefinition,
    createError = require('../CreateHelper').createError;

var EventDefinitionHelper = require('../../../../helper/EventDefinitionHelper');

var getRoot = require('../../../../Utils').getRoot;

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var is = require('bpmn-js/lib/util/ModelUtil').is,
    isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;

var find = require('lodash/find'),
    forEach = require('lodash/forEach'),
    isString = require('lodash/isString'),
    keys = require('lodash/keys'),
    remove = require('lodash/remove');

var CAMUNDA_SERVICE_TASK_LIKE = [
  'camunda:class',
  'camunda:delegateExpression',
  'camunda:expression'
];

/**
 * Applies an element template to an element. Sets `camunda:modelerTemplate` and
 * `camunda:modelerTemplateVersion`.
 */
function ChangeElementTemplateHandler(bpmnFactory, commandStack, modeling) {
  this._bpmnFactory = bpmnFactory;
  this._commandStack = commandStack;
  this._modeling = modeling;
}

ChangeElementTemplateHandler.$inject = [
  'bpmnFactory',
  'commandStack',
  'modeling'
];

module.exports = ChangeElementTemplateHandler;

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
ChangeElementTemplateHandler.prototype.preExecute = function(context) {
  var element = context.element,
      newTemplate = context.newTemplate,
      oldTemplate = context.oldTemplate;

  var self = this;

  // Update camunda:modelerTemplate attribute
  this._updateCamundaModelerTemplate(element, newTemplate);

  if (newTemplate) {

    // Update properties
    this._updateProperties(element, oldTemplate, newTemplate);

    // Update camunda:ExecutionListener properties
    this._updateCamundaExecutionListenerProperties(element, newTemplate);

    // Update camunda:Field properties
    this._updateCamundaFieldProperties(element, oldTemplate, newTemplate);

    // Update camunda:In and camunda:Out properties
    this._updateCamundaInOutProperties(element, oldTemplate, newTemplate);

    // Update camunda:InputParameter and camunda:OutputParameter properties
    this._updateCamundaInputOutputParameterProperties(element, oldTemplate, newTemplate);

    // Update camunda:Property properties
    this._updateCamundaPropertyProperties(element, oldTemplate, newTemplate);

    // Update camunda:ErrorEventDefinition properties
    this._updateCamundaErrorEventDefinitionProperties(element, oldTemplate, newTemplate);

    // Update properties for each scope
    forEach(handleLegacyScopes(newTemplate.scopes), function(newScopeTemplate) {
      self._updateScopeProperties(element, oldTemplate, newScopeTemplate, newTemplate);
    });

  }
};

ChangeElementTemplateHandler.prototype._getOrCreateExtensionElements = function(element) {
  var bpmnFactory = this._bpmnFactory,
      modeling = this._modeling;

  var businessObject = getBusinessObject(element);

  var extensionElements = businessObject.get('extensionElements');

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
};

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
ChangeElementTemplateHandler.prototype._updateCamundaErrorEventDefinitionProperties = function(element, oldTemplate, newTemplate) {
  var bpmnFactory = this._bpmnFactory,
      commandStack = this._commandStack;

  var newProperties = newTemplate.properties.filter(function(newProperty) {
    var newBinding = newProperty.binding,
        newBindingType = newBinding.type;

    return newBindingType === 'camunda:errorEventDefinition';
  });

  // (1) Do not override if no updates
  if (!newProperties.length) {
    return;
  }

  var businessObject = this._getOrCreateExtensionElements(element);

  var oldErrorEventDefinitions = findExtensions(element, [ 'camunda:ErrorEventDefinition' ]);

  newProperties.forEach(function(newProperty) {
    var oldProperty = findOldProperty(oldTemplate, newProperty),
        oldEventDefinition = oldProperty && findOldBusinessObject(businessObject, oldProperty),
        newBinding = newProperty.binding;

    // (2) Update old event definitions
    if (oldProperty && oldEventDefinition) {

      if (!propertyChanged(oldEventDefinition, oldProperty)) {
        commandStack.execute('properties-panel.update-businessobject', {
          element: element,
          businessObject: oldEventDefinition,
          properties: {
            expression: newProperty.value
          }
        });
      }

      remove(oldErrorEventDefinitions, oldEventDefinition);
    }

    // (3) Create new event definition + error
    else {
      var rootElement = getRoot(getBusinessObject(element)),
          newError = createError(newBinding.errorRef, rootElement, bpmnFactory),
          newEventDefinition =
            createCamundaErrorEventDefinition(newBinding, newProperty.value, newError, businessObject, bpmnFactory);

      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: rootElement,
        propertyName: 'rootElements',
        objectsToAdd: [ newError ],
        objectsToRemove: []
      });

      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: businessObject,
        propertyName: 'values',
        objectsToAdd: [ newEventDefinition ],
        objectsToRemove: []
      });
    }

  });

  // (4) Remove old event definitions
  if (oldErrorEventDefinitions.length) {
    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: businessObject,
      propertyName: 'values',
      objectsToAdd: [],
      objectsToRemove: oldErrorEventDefinitions
    });
  }
};

/**
 * Update `camunda:ExecutionListener` properties of specified business object. Execution listeners
 * will always be overridden. Execution listeners can only exist in `bpmn:ExtensionElements`.
 *
 * @param {djs.model.Base} element
 * @param {Object} newTemplate
 */
ChangeElementTemplateHandler.prototype._updateCamundaExecutionListenerProperties = function(element, newTemplate) {
  var bpmnFactory = this._bpmnFactory,
      commandStack = this._commandStack;

  var newProperties = newTemplate.properties.filter(function(newProperty) {
    var newBinding = newProperty.binding,
        newBindingType = newBinding.type;

    return newBindingType === 'camunda:executionListener';
  });

  // (1) Do not override old execution listeners if no new execution listeners specified
  if (!newProperties.length) {
    return;
  }

  var businessObject = this._getOrCreateExtensionElements(element);

  // (2) Remove old execution listeners
  var oldExecutionListeners = findExtensions(element, [ 'camunda:ExecutionListener' ]);

  // (3) Add new execution listeners
  var newExecutionListeners = newProperties.map(function(newProperty) {
    var newBinding = newProperty.binding,
        propertyValue = newProperty.value;

    return createCamundaExecutionListenerScript(newBinding, propertyValue, bpmnFactory);
  });

  commandStack.execute('properties-panel.update-businessobject-list', {
    element: element,
    currentObject: businessObject,
    propertyName: 'values',
    objectsToAdd: newExecutionListeners,
    objectsToRemove: oldExecutionListeners
  });
};

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
ChangeElementTemplateHandler.prototype._updateCamundaFieldProperties = function(element, oldTemplate, newTemplate, businessObject) {
  var bpmnFactory = this._bpmnFactory,
      commandStack = this._commandStack;

  var newProperties = newTemplate.properties.filter(function(newProperty) {
    var newBinding = newProperty.binding,
        newBindingType = newBinding.type;

    return newBindingType === 'camunda:field';
  });

  // (1) Do not override old fields if no new fields specified
  if (!newProperties.length) {
    return;
  }

  if (!businessObject) {
    businessObject = this._getOrCreateExtensionElements(element);
  }

  var propertyName = isAny(businessObject, [ 'camunda:ExecutionListener', 'camunda:TaskListener' ])
    ? 'fields'
    : 'values';

  var oldFields = findExtensions(element, [ 'camunda:Field' ]);

  newProperties.forEach(function(newProperty) {
    var oldProperty = findOldProperty(oldTemplate, newProperty),
        oldField = oldProperty && findOldBusinessObject(businessObject, oldProperty),
        newBinding = newProperty.binding;

    // (2) Update old fields
    if (oldProperty && oldField) {

      if (!propertyChanged(oldField, oldProperty)) {
        commandStack.execute('properties-panel.update-businessobject', {
          element: element,
          businessObject: oldField,
          properties: {
            string: newProperty.value
          }
        });
      }

      remove(oldFields, oldField);
    }

    // (3) Add new fields
    else {
      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: businessObject,
        propertyName: propertyName,
        objectsToAdd: [ createCamundaFieldInjection(newBinding, newProperty.value, bpmnFactory) ],
        objectsToRemove: []
      });
    }
  });

  // (4) Remove old fields
  if (oldFields.length) {
    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: businessObject,
      propertyName: propertyName,
      objectsToAdd: [],
      objectsToRemove: oldFields
    });
  }
};

/**
 * Update `camunda:In` and `camunda:Out` properties of specified business object. Only
 * `bpmn:CallActivity` and events with `bpmn:SignalEventDefinition` can have ins. Only
 * `camunda:CallActivity` can have outs.
 *
 * @param {djs.model.Base} element
 * @param {Object} oldTemplate
 * @param {Object} newTemplate
 */
ChangeElementTemplateHandler.prototype._updateCamundaInOutProperties = function(element, oldTemplate, newTemplate) {
  var bpmnFactory = this._bpmnFactory,
      commandStack = this._commandStack;

  var newProperties = newTemplate.properties.filter(function(newProperty) {
    var newBinding = newProperty.binding,
        newBindingType = newBinding.type;

    return newBindingType === 'camunda:in'
      || newBindingType === 'camunda:in:businessKey'
      || newBindingType === 'camunda:out';
  });

  // (1) Do not override old fields if no new fields specified
  if (!newProperties.length) {
    return;
  }

  // Get extension elements of either signal event definition or call activity
  var businessObject = this._getOrCreateExtensionElements(
    EventDefinitionHelper.getSignalEventDefinition(element) || element);

  var oldInsAndOuts = findExtensions(businessObject, [ 'camunda:In', 'camunda:Out' ]);

  newProperties.forEach(function(newProperty) {
    var oldProperty = findOldProperty(oldTemplate, newProperty),
        oldBinding = oldProperty && oldProperty.binding,
        oldInOurOut = oldProperty && findOldBusinessObject(businessObject, oldProperty),
        newPropertyValue = newProperty.value,
        newBinding = newProperty.binding,
        newBindingType = newBinding.type,
        newInOrOut,
        properties = {};

    // (2) Update old ins and outs
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

      // Update `camunda:local` property if it changed
      if ((oldBinding.local && !newBinding.local) || !oldBinding.local && newBinding.local) {
        properties.local = newBinding.local;
      }

      if (keys(properties)) {
        commandStack.execute('properties-panel.update-businessobject', {
          element: element,
          businessObject: oldInOurOut,
          properties: properties
        });
      }

      remove(oldInsAndOuts, oldInOurOut);
    }

    // (3) Add new ins and outs
    else {
      if (newBindingType === 'camunda:in') {
        newInOrOut = createCamundaIn(newBinding, newPropertyValue, bpmnFactory);
      } else if (newBindingType === 'camunda:out') {
        newInOrOut = createCamundaOut(newBinding, newPropertyValue, bpmnFactory);
      } else if (newBindingType === 'camunda:in:businessKey') {
        newInOrOut = createCamundaInWithBusinessKey(newBinding, newPropertyValue, bpmnFactory);
      }

      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: businessObject,
        propertyName: 'values',
        objectsToAdd: [ newInOrOut ],
        objectsToRemove: []
      });
    }
  });

  // (4) Remove old ins and outs
  if (oldInsAndOuts.length) {
    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: businessObject,
      propertyName: 'values',
      objectsToAdd: [],
      objectsToRemove: oldInsAndOuts
    });
  }
};

/**
 * Update `camunda:InputParameter` and `camunda:OutputParameter` properties of specified business
 * object. Both can only exist in `camunda:InputOutput` which can exist in `bpmn:ExtensionElements`
 * or `camunda:Connector`.
 *
 * @param {djs.model.Base} element
 * @param {Object} oldTemplate
 * @param {Object} newTemplate
 */
ChangeElementTemplateHandler.prototype._updateCamundaInputOutputParameterProperties = function(element, oldTemplate, newTemplate, businessObject) {
  var bpmnFactory = this._bpmnFactory,
      commandStack = this._commandStack;

  var newProperties = newTemplate.properties.filter(function(newProperty) {
    var newBinding = newProperty.binding,
        newBindingType = newBinding.type;

    return newBindingType === 'camunda:inputParameter' || newBindingType === 'camunda:outputParameter';
  });

  // (1) Do not override old inputs and outputs if no new inputs and outputs specified
  if (!newProperties.length) {
    return;
  }

  if (!businessObject) {
    businessObject = this._getOrCreateExtensionElements(element);
  }

  var inputOutput;

  if (is(businessObject, 'camunda:Connector')) {
    inputOutput = businessObject.get('camunda:inputOutput');

    if (!inputOutput) {
      inputOutput = bpmnFactory.create('camunda:InputOutput');

      commandStack.execute('properties-panel.update-businessobject', {
        element: element,
        businessObject: businessObject,
        properties: {
          inputOutput: inputOutput
        }
      });
    }
  } else {
    inputOutput = findExtension(businessObject, 'camunda:InputOutput');

    if (!inputOutput) {
      inputOutput = bpmnFactory.create('camunda:InputOutput');

      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: businessObject,
        propertyName: 'values',
        objectsToAdd: [ inputOutput ],
        objectsToRemove: []
      });
    }
  }

  var oldInputs = inputOutput.get('camunda:inputParameters')
    ? inputOutput.get('camunda:inputParameters').slice()
    : [];

  var oldOutputs = inputOutput.get('camunda:outputParameters')
    ? inputOutput.get('camunda:outputParameters').slice()
    : [];

  var propertyName;

  newProperties.forEach(function(newProperty) {
    var oldProperty = findOldProperty(oldTemplate, newProperty),
        oldInputOrOutput = oldProperty && findOldBusinessObject(businessObject, oldProperty),
        newPropertyValue = newProperty.value,
        newBinding = newProperty.binding,
        newBindingType = newBinding.type;

    var newInputOrOutput,
        properties;

    // (2) Update old inputs and outputs
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

        commandStack.execute('properties-panel.update-businessobject', {
          element: element,
          businessObject: oldInputOrOutput,
          properties: properties
        });
      }

      if (is(oldInputOrOutput, 'camunda:InputParameter')) {
        remove(oldInputs, oldInputOrOutput);
      } else {
        remove(oldOutputs, oldInputOrOutput);
      }
    }

    // (3) Add new inputs and outputs
    else {
      if (newBindingType === 'camunda:inputParameter') {
        propertyName = 'inputParameters';

        newInputOrOutput = createInputParameter(newBinding, newPropertyValue, bpmnFactory);
      } else {
        propertyName = 'outputParameters';

        newInputOrOutput = createOutputParameter(newBinding, newPropertyValue, bpmnFactory);
      }

      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: inputOutput,
        propertyName: propertyName,
        objectsToAdd: [ newInputOrOutput ],
        objectsToRemove: []
      });
    }
  });

  // (4) Remove old inputs and outputs
  if (oldInputs.length) {
    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: inputOutput,
      propertyName: 'inputParameters',
      objectsToAdd: [],
      objectsToRemove: oldInputs
    });
  }

  if (oldOutputs.length) {
    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: inputOutput,
      propertyName: 'outputParameters',
      objectsToAdd: [],
      objectsToRemove: oldOutputs
    });
  }
};

ChangeElementTemplateHandler.prototype._updateCamundaModelerTemplate = function(element, newTemplate) {
  var modeling = this._modeling;

  modeling.updateProperties(element, {
    'camunda:modelerTemplate': newTemplate && newTemplate.id,
    'camunda:modelerTemplateVersion': newTemplate && newTemplate.version
  });
};

/**
 * Update `camunda:Property` properties of specified business object. `camunda:Property` can only
 * exist in `camunda:Properties`.
 *
 * @param {djs.model.Base} element
 * @param {Object} oldTemplate
 * @param {Object} newTemplate
 * @param {ModdleElement} businessObject
 */
ChangeElementTemplateHandler.prototype._updateCamundaPropertyProperties = function(element, oldTemplate, newTemplate, businessObject) {
  var bpmnFactory = this._bpmnFactory,
      commandStack = this._commandStack;

  var newProperties = newTemplate.properties.filter(function(newProperty) {
    var newBinding = newProperty.binding,
        newBindingType = newBinding.type;

    return newBindingType === 'camunda:property';
  });

  // (1) Do not override old properties if no new properties specified
  if (!newProperties.length) {
    return;
  }

  if (businessObject) {
    businessObject = this._getOrCreateExtensionElements(businessObject);
  } else {
    businessObject = this._getOrCreateExtensionElements(element);
  }

  var camundaProperties = findExtension(businessObject, 'camunda:Properties');

  if (!camundaProperties) {
    camundaProperties = bpmnFactory.create('camunda:Properties');

    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: businessObject,
      propertyName: 'values',
      objectsToAdd: [ camundaProperties ],
      objectsToRemove: []
    });
  }

  var oldCamundaProperties = camundaProperties.get('camunda:values')
    ? camundaProperties.get('camunda:values').slice()
    : [];

  newProperties.forEach(function(newProperty) {
    var oldProperty = findOldProperty(oldTemplate, newProperty),
        oldCamundaProperty = oldProperty && findOldBusinessObject(businessObject, oldProperty),
        newPropertyValue = newProperty.value,
        newBinding = newProperty.binding;

    // (2) Update old properties
    if (oldProperty && oldCamundaProperty) {

      if (!propertyChanged(oldCamundaProperty, oldProperty)) {
        commandStack.execute('properties-panel.update-businessobject', {
          element: element,
          businessObject: oldCamundaProperty,
          properties: {
            value: newPropertyValue
          }
        });
      }

      remove(oldCamundaProperties, oldCamundaProperty);
    }

    // (3) Add new properties
    else {
      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: camundaProperties,
        propertyName: 'values',
        objectsToAdd: [ createCamundaProperty(newBinding, newPropertyValue, bpmnFactory) ],
        objectsToRemove: []
      });
    }
  });

  // (4) Remove old properties
  if (oldCamundaProperties.length) {
    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: camundaProperties,
      propertyName: 'values',
      objectsToAdd: [],
      objectsToRemove: oldCamundaProperties
    });
  }
};

/**
 * Update `bpmn:conditionExpression` property of specified element. Since condition expression is
 * is not primitive it needs special handling.
 *
 * @param {djs.model.Base} element
 * @param {Object} oldProperty
 * @param {Object} newProperty
 */
ChangeElementTemplateHandler.prototype._updateConditionExpression = function(element, oldProperty, newProperty) {
  var bpmnFactory = this._bpmnFactory,
      commandStack = this._commandStack,
      modeling = this._modeling;

  var newBinding = newProperty.binding,
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

  var oldBinding = oldProperty.binding,
      oldPropertyValue = oldProperty.value;

  var businessObject = getBusinessObject(element),
      conditionExpression = businessObject.get('bpmn:conditionExpression');

  var properties = {};

  if (conditionExpression.get('body') === oldPropertyValue) {
    properties.body = newPropertyValue;
  }

  if (conditionExpression.get('language') === oldBinding.scriptFormat) {
    properties.language = newBinding.scriptFormat;
  }

  if (!keys(properties).length) {
    return;
  }

  commandStack.execute('properties-panel.update-businessobject', {
    element: element,
    businessObject: conditionExpression,
    properties: properties
  });
};

ChangeElementTemplateHandler.prototype._updateProperties = function(element, oldTemplate, newTemplate, businessObject) {
  var self = this;

  var commandStack = this._commandStack;

  var newProperties = newTemplate.properties.filter(function(newProperty) {
    var newBinding = newProperty.binding,
        newBindingType = newBinding.type;

    return newBindingType === 'property';
  });

  if (!newProperties.length) {
    return;
  }

  if (!businessObject) {
    businessObject = getBusinessObject(element);
  }

  newProperties.forEach(function(newProperty) {
    var oldProperty = findOldProperty(oldTemplate, newProperty),
        newBinding = newProperty.binding,
        newBindingName = newBinding.name,
        newPropertyValue = newProperty.value,
        changedElement,
        properties;

    if (newBindingName === 'conditionExpression') {
      self._updateConditionExpression(element, oldProperty, newProperty);
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

      // Only one of `camunda:class`, `camunda:delegateExpression` and `camunda:expression` can be
      // set
      // TODO(philippfromme): ensuring only one of these properties is set at a time should be
      // implemented in a behavior and not in this handler and properties panel UI
      if (CAMUNDA_SERVICE_TASK_LIKE.indexOf(newBindingName) !== -1) {
        CAMUNDA_SERVICE_TASK_LIKE.forEach(function(camundaServiceTaskLikeProperty) {
          if (camundaServiceTaskLikeProperty !== newBindingName) {
            properties[ camundaServiceTaskLikeProperty ] = undefined;
          }
        });
      }

      commandStack.execute('properties-panel.update-businessobject', {
        element: element,
        businessObject: businessObject,
        properties: properties
      });
    }
  });
};

/**
 * Update properties for a specified scope.
 *
 * @param {djs.model.Base} element
 * @param {Object} oldTemplate
 * @param {Object} newScopeTemplate
 * @param {Object} newTemplate
 */
ChangeElementTemplateHandler.prototype._updateScopeProperties = function(element, oldTemplate, newScopeTemplate, newTemplate) {
  var bpmnFactory = this._bpmnFactory,
      commandStack = this._commandStack;

  var scopeName = newScopeTemplate.type;

  var scopeElement;

  scopeElement = findOldScopeElement(element, newScopeTemplate, newTemplate);

  if (!scopeElement) {

    scopeElement = bpmnFactory.create(scopeName);
  }

  var oldScopeTemplate = findOldScopeTemplate(newScopeTemplate, oldTemplate);

  // Update properties
  this._updateProperties(element, oldScopeTemplate, newScopeTemplate, scopeElement);

  // Update camunda:ExecutionListener properties
  this._updateCamundaExecutionListenerProperties(element, newScopeTemplate);

  // Update camunda:In and camunda:Out properties
  this._updateCamundaInOutProperties(element, oldScopeTemplate, newScopeTemplate);

  // Update camunda:InputParameter and camunda:OutputParameter properties
  this._updateCamundaInputOutputParameterProperties(element, oldScopeTemplate, newScopeTemplate, scopeElement);

  // Update camunda:Field properties
  this._updateCamundaFieldProperties(element, oldScopeTemplate, newScopeTemplate, scopeElement);

  // Update camunda:Property properties
  this._updateCamundaPropertyProperties(element, oldScopeTemplate, newScopeTemplate, scopeElement);

  // Assume: root elements were already been created in root by referenced event
  // definition binding
  if (isRootElementScope(scopeName)) {
    return;
  }

  var extensionElements = this._getOrCreateExtensionElements(element);

  commandStack.execute('properties-panel.update-businessobject-list', {
    element: element,
    currentObject: extensionElements,
    propertyName: 'values',
    objectsToAdd: [ scopeElement ],
    objectsToRemove: []
  });
};

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
  var businessObject = getBusinessObject(element),
      propertyName;

  var oldBinding = oldProperty.binding,
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
        var definition;

        if (oldBinding.scriptFormat) {
          definition = oldBusinessObject.get('camunda:definition');

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

  var oldProperties = oldTemplate.properties,
      newBinding = newProperty.binding,
      newBindingName = newBinding.name,
      newBindingType = newBinding.type;

  if (newBindingType === 'property') {
    return find(oldProperties, function(oldProperty) {
      var oldBinding = oldProperty.binding,
          oldBindingName = oldBinding.name,
          oldBindingType = oldBinding.type;

      return oldBindingType === 'property' && oldBindingName === newBindingName;
    });
  }

  if (newBindingType === 'camunda:field') {
    return find(oldProperties, function(oldProperty) {
      var oldBinding = oldProperty.binding,
          oldBindingName = oldBinding.name,
          oldBindingType = oldBinding.type;

      return oldBindingType === 'camunda:field' && oldBindingName === newBindingName;
    });
  }

  if (newBindingType === 'camunda:in') {
    return find(oldProperties, function(oldProperty) {
      var oldBinding = oldProperty.binding,
          oldBindingType = oldBinding.type;

      if (oldBindingType !== 'camunda:in') {
        return;
      }

      // Always override if change from source to source expression or vice versa
      if ((oldBinding.expression && !newBinding.expression) ||
        !oldBinding.expression && newBinding.expression) {
        return;
      }

      return oldBinding.target === newBinding.target;
    });
  }

  if (newBindingType === 'camunda:in:businessKey') {
    return find(oldProperties, function(oldProperty) {
      var oldBinding = oldProperty.binding,
          oldBindingType = oldBinding.type;

      return oldBindingType === 'camunda:in:businessKey';
    });
  }

  if (newBindingType === 'camunda:out') {
    return find(oldProperties, function(oldProperty) {
      var oldBinding = oldProperty.binding,
          oldBindingType = oldBinding.type;

      return oldBindingType === 'camunda:out' && (
        oldBinding.source === newBinding.source ||
        oldBinding.sourceExpression === newBinding.sourceExpression
      );
    });
  }

  if (newBindingType === 'camunda:inputParameter') {
    return find(oldProperties, function(oldProperty) {
      var oldBinding = oldProperty.binding,
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
      var oldBinding = oldProperty.binding,
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
      var oldBinding = oldProperty.binding,
          oldBindingName = oldBinding.name,
          oldBindingType = oldBinding.type;

      return oldBindingType === 'camunda:property' && oldBindingName === newBindingName;
    });
  }

  if (newBindingType === 'camunda:errorEventDefinition') {
    return find(oldProperties, function(oldProperty) {
      var newBindingRef = newBinding.errorRef,
          oldBinding = oldProperty.binding,
          oldBindingRef = oldBinding.errorRef,
          oldBindingType = oldBinding.type;

      return oldBindingType === 'camunda:errorEventDefinition'
        && oldBindingRef === newBindingRef;
    });
  }
}

function findOldScopeElement(element, scopeTemplate, template) {
  var scopeName = scopeTemplate.type,
      id = scopeTemplate.id;

  if (scopeName === 'camunda:Connector') {
    return findExtension(element, 'camunda:Connector');
  }

  if (scopeName === 'bpmn:Error') {

    // (1) find by error event definition binding
    var errorEventDefinitionBinding = findErrorEventDefinitionBinding(template, id);

    if (!errorEventDefinitionBinding) {
      return;
    }

    // (2) find error event definition
    var errorEventDefinition = findOldBusinessObject(element, errorEventDefinitionBinding);

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
  var scopeName = scopeTemplate.type,
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
  var businessObject = getBusinessObject(element);

  var oldBinding = oldProperty.binding,
      oldBindingName = oldBinding.name,
      oldBindingType = oldBinding.type,
      oldPropertyValue = oldProperty.value,
      conditionExpression,
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