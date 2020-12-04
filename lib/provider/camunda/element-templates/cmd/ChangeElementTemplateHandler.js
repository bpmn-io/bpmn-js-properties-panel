'use strict';

var findExtension = require('../Helper').findExtension,
    findExtensions = require('../Helper').findExtensions;

var createCamundaExecutionListenerScript = require('../CreateHelper').createCamundaExecutionListenerScript,
    createCamundaFieldInjection = require('../CreateHelper').createCamundaFieldInjection,
    createCamundaIn = require('../CreateHelper').createCamundaIn,
    createCamundaInWithBusinessKey = require('../CreateHelper').createCamundaInWithBusinessKey,
    createCamundaOut = require('../CreateHelper').createCamundaOut,
    createCamundaProperty = require('../CreateHelper').createCamundaProperty,
    createInputParameter = require('../CreateHelper').createInputParameter,
    createOutputParameter = require('../CreateHelper').createOutputParameter;

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var forEach = require('lodash/forEach'),
    keys = require('lodash/keys');

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
    this._updateCamundaExecutionListenerProperties(element, oldTemplate, newTemplate);

    // Update camunda:Field properties
    this._updateCamundaFieldProperties(element, oldTemplate, newTemplate);

    // Update camunda:In and camunda:Out properties
    this._updateCamundaInOutProperties(element, oldTemplate, newTemplate);

    // Update camunda:InputParameter and camunda:OutputParameter properties
    this._updateCamundaInputOutputParameterProperties(element, oldTemplate, newTemplate);

    // Update camunda:Property properties
    this._updateCamundaPropertyProperties(element, oldTemplate, newTemplate);

    // Update properties for each scope
    forEach(newTemplate.scopes, function(scopeTemplate, scopeName) {
      self._updateScopeProperties(element, scopeName, scopeTemplate);
    });

  }
};

ChangeElementTemplateHandler.prototype._createPropertyUpdates = function(template) {
  var bpmnFactory = this._bpmnFactory;

  var propertyUpdates = {};

  template.properties.forEach(function(property) {

    var binding = property.binding,
        bindingName = binding.name,
        value;

    if (binding.type === 'property') {

      if (bindingName === 'conditionExpression') {
        value = bpmnFactory.create('bpmn:FormalExpression', {
          body: property.value,
          language: binding.scriptFormat
        });
      } else {
        value = property.value;
      }

      propertyUpdates[ bindingName ] = value;

      // Only one of `camunda:class`, `camunda:delegateExpression` and `camunda:expression` can be
      // set
      if (CAMUNDA_SERVICE_TASK_LIKE.indexOf(bindingName) !== -1) {
        CAMUNDA_SERVICE_TASK_LIKE.forEach(function(camundaServiceTaskLikeProperty) {
          if (camundaServiceTaskLikeProperty !== bindingName) {
            propertyUpdates[ camundaServiceTaskLikeProperty ] = undefined;
          }
        });
      }
    }
  });

  return propertyUpdates;
};

ChangeElementTemplateHandler.prototype._createCamundaExecutionListenerProperties = function(template) {
  var bpmnFactory = this._bpmnFactory;

  var executionListenerProperties = [];

  template.properties.forEach(function(property) {
    var binding = property.binding,
        bindingType = binding.type;

    if (bindingType === 'camunda:executionListener') {
      executionListenerProperties.push(
        createCamundaExecutionListenerScript(binding, property.value, bpmnFactory)
      );
    }
  });

  if (executionListenerProperties.length) {
    return executionListenerProperties;
  }
};

ChangeElementTemplateHandler.prototype._createCamundaFieldProperties = function(template) {
  var bpmnFactory = this._bpmnFactory;

  var fieldProperties = [];

  template.properties.forEach(function(property) {
    var binding = property.binding,
        bindingType = binding.type;

    if (bindingType === 'camunda:field') {
      fieldProperties.push(createCamundaFieldInjection(binding, property.value, bpmnFactory));
    }
  });

  if (fieldProperties.length) {
    return fieldProperties;
  }
};

ChangeElementTemplateHandler.prototype._createCamundaInOutProperties = function(template) {
  var bpmnFactory = this._bpmnFactory;

  var inOutProperties = [];

  template.properties.forEach(function(property) {
    var binding = property.binding,
        bindingType = binding.type;

    if (bindingType === 'camunda:in') {
      inOutProperties.push(createCamundaIn(binding, property.value, bpmnFactory));
    } else if (bindingType === 'camunda:out') {
      inOutProperties.push(createCamundaOut(binding, property.value, bpmnFactory));
    } else if (bindingType === 'camunda:in:businessKey') {
      inOutProperties.push(createCamundaInWithBusinessKey(binding, property.value, bpmnFactory));
    }
  });

  if (inOutProperties.length) {
    return inOutProperties;
  }
};

ChangeElementTemplateHandler.prototype._createCamundaInputOutputParameterProperties = function(template) {
  var bpmnFactory = this._bpmnFactory;

  var inputParameterProperties = [],
      outputParameterProperties = [];

  template.properties.forEach(function(property) {
    var binding = property.binding,
        bindingType = binding.type;

    if (bindingType === 'camunda:inputParameter') {
      inputParameterProperties.push(createInputParameter(binding, property.value, bpmnFactory));
    }

    if (bindingType === 'camunda:outputParameter') {
      outputParameterProperties.push(createOutputParameter(binding, property.value, bpmnFactory));
    }
  });

  if (outputParameterProperties.length || inputParameterProperties.length) {
    return bpmnFactory.create('camunda:InputOutput', {
      inputParameters: inputParameterProperties,
      outputParameters: outputParameterProperties
    });
  }
};

ChangeElementTemplateHandler.prototype._createCamundaPropertyProperties = function(template) {
  var bpmnFactory = this._bpmnFactory;

  var propertyProperties = [];

  template.properties.forEach(function(property) {
    var binding = property.binding,
        bindingType = binding.type;

    if (bindingType === 'camunda:property') {
      propertyProperties.push(createCamundaProperty(binding, property.value, bpmnFactory));
    }
  });

  if (propertyProperties.length) {
    return bpmnFactory.create('camunda:Properties', {
      values: propertyProperties
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

    modeling.updateProperties(element, {
      extensionElements: extensionElements
    });
  }

  return extensionElements;
};

ChangeElementTemplateHandler.prototype._updateCamundaExecutionListenerProperties = function(element, oldTemplate, newTemplate, context) {
  var commandStack = this._commandStack;

  var newExecutionListenerProperties = this._createCamundaExecutionListenerProperties(newTemplate),
      oldExecutionListenerProperties;

  if (!newExecutionListenerProperties) {
    return;
  }

  if (context) {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: context,
      properties: { executionListener: newExecutionListenerProperties }
    });
  } else {
    context = this._getOrCreateExtensionElements(element);

    oldExecutionListenerProperties = findExtensions(context, [ 'camunda:ExecutionListener' ]);

    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: context,
      propertyName: 'values',
      objectsToAdd: newExecutionListenerProperties,
      objectsToRemove: oldExecutionListenerProperties
    });
  }
};

ChangeElementTemplateHandler.prototype._updateCamundaFieldProperties = function(element, oldTemplate, newTemplate, context) {
  var commandStack = this._commandStack;

  var newFieldProperties = this._createCamundaFieldProperties(newTemplate),
      oldFieldProperties;

  if (!newFieldProperties) {
    return;
  }

  if (context) {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: context,
      properties: { field: newFieldProperties }
    });
  } else {
    context = this._getOrCreateExtensionElements(element);

    oldFieldProperties = findExtensions(element, [ 'camunda:Field' ]);

    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: context,
      propertyName: 'values',
      objectsToAdd: newFieldProperties,
      objectsToRemove: oldFieldProperties ? oldFieldProperties : []
    });
  }
};

ChangeElementTemplateHandler.prototype._updateCamundaInOutProperties = function(element, oldTemplate, newTemplate, context) {
  var commandStack = this._commandStack;

  var newInOutProperties = this._createCamundaInOutProperties(newTemplate),
      oldInOutProperties;

  if (!newInOutProperties) {
    return;
  }

  if (context) {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: context,
      properties: { inout: newInOutProperties }
    });
  } else {
    context = this._getOrCreateExtensionElements(element);

    oldInOutProperties = findExtensions(context, [ 'camunda:In', 'camunda:Out' ]);

    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: context,
      propertyName: 'values',
      objectsToAdd: newInOutProperties,
      objectsToRemove: oldInOutProperties
    });
  }
};

ChangeElementTemplateHandler.prototype._updateCamundaInputOutputParameterProperties = function(element, oldTemplate, newTemplate, context) {
  var commandStack = this._commandStack;

  var newInputOutputParameterProperties = this._createCamundaInputOutputParameterProperties(newTemplate),
      oldInputOutputParameterProperties;

  if (!newInputOutputParameterProperties) {
    return;
  }

  if (context) {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: context,
      properties: {
        inputOutput: newInputOutputParameterProperties
      }
    });
  } else {
    context = this._getOrCreateExtensionElements(element);

    oldInputOutputParameterProperties = findExtension(element, 'camunda:InputOutput');

    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: context,
      propertyName: 'values',
      objectsToAdd: [ newInputOutputParameterProperties ],
      objectsToRemove: oldInputOutputParameterProperties ? [ oldInputOutputParameterProperties ] : []
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

ChangeElementTemplateHandler.prototype._updateCamundaPropertyProperties = function(element, oldTemplate, newTemplate, context) {
  var commandStack = this._commandStack;

  var newPropertyProperties = this._createCamundaPropertyProperties(newTemplate),
      oldPropertyProperties;

  if (!newPropertyProperties) {
    return;
  }

  if (context) {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: context,
      properties: { properties: newPropertyProperties }
    });
  } else {
    context = this._getOrCreateExtensionElements(element);

    oldPropertyProperties = findExtension(element, 'camunda:Properties');

    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: context,
      propertyName: 'values',
      objectsToAdd: [ newPropertyProperties ],
      objectsToRemove: oldPropertyProperties ? [ oldPropertyProperties ] : []
    });
  }
};

ChangeElementTemplateHandler.prototype._updateProperties = function(element, oldTemplate, newTemplate, context) {
  var bpmnFactory = this._bpmnFactory,
      commandStack = this._commandStack,
      modeling = this._modeling;

  var newProperties = this._createPropertyUpdates(newTemplate, bpmnFactory);

  if (!keys(newProperties).length) {
    return;
  }

  if (context) {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: context,
      properties: newProperties
    });
  } else {
    modeling.updateProperties(element, newProperties);
  }
};

/**
 * Update properties for a specified scope.
 *
 * @param {djs.model.Base} element
 * @param {string} scopeName
 * @param {Object} scopeTemplate
 */
ChangeElementTemplateHandler.prototype._updateScopeProperties = function(element, scopeName, scopeTemplate) {
  var bpmnFactory = this._bpmnFactory,
      commandStack = this._commandStack;

  var scopeElement = bpmnFactory.create(scopeName);

  // Update properties
  this._updateProperties(element, null, scopeTemplate, scopeElement);

  // Update camunda:ExecutionListener properties
  this._updateCamundaExecutionListenerProperties(element, null, scopeTemplate, scopeElement);

  // Update camunda:In and camunda:Out properties
  this._updateCamundaInOutProperties(element, null, scopeTemplate, scopeElement);

  // Update camunda:InputParameter and camunda:OutputParameter properties
  this._updateCamundaInputOutputParameterProperties(element, null, scopeTemplate, scopeElement);

  // Update camunda:Field properties
  this._updateCamundaFieldProperties(element, null, scopeTemplate, scopeElement);

  // Update camunda:Property properties
  this._updateCamundaPropertyProperties(element, null, scopeTemplate, scopeElement);

  var extensionElements = this._getOrCreateExtensionElements(element);

  var oldScope = findExtension(extensionElements, scopeName);

  commandStack.execute('properties-panel.update-businessobject-list', {
    element: element,
    currentObject: extensionElements,
    propertyName: 'values',
    objectsToAdd: [ scopeElement ],
    objectsToRemove: oldScope ? [ oldScope ] : []
  });
};
