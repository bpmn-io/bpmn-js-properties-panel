'use strict';

var findExtension = require('../Helper').findExtension,
    findExtensions = require('../Helper').findExtensions;

var createCamundaProperty = require('../CreateHelper').createCamundaProperty,
    createInputParameter = require('../CreateHelper').createInputParameter,
    createOutputParameter = require('../CreateHelper').createOutputParameter,
    createCamundaIn = require('../CreateHelper').createCamundaIn,
    createCamundaOut = require('../CreateHelper').createCamundaOut,
    createCamundaInWithBusinessKey = require('../CreateHelper').createCamundaInWithBusinessKey,
    createCamundaExecutionListenerScript = require('../CreateHelper').createCamundaExecutionListenerScript;

var CAMUNDA_SERVICE_TASK_LIKE = [
  'camunda:class',
  'camunda:delegateExpression',
  'camunda:expression'
];

/**
 * A handler that changes the modeling template of a BPMN element.
 */
function ChangeElementTemplateHandler(modeling, commandStack, bpmnFactory) {

  function getOrCreateExtensionElements(element) {

    var bo = element.businessObject;

    var extensionElements = bo.extensionElements;

    // add extension elements
    if (!extensionElements) {
      extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
        values: []
      });

      modeling.updateProperties(element, {
        extensionElements: extensionElements
      });
    }

    return extensionElements;
  }

  function updateModelerTemplate(element, newTemplate) {
    modeling.updateProperties(element, {
      'camunda:modelerTemplate': newTemplate && newTemplate.id
    });
  }

  function updateIoMappings(element, newTemplate, context) {

    var newMappings = createInputOutputMappings(newTemplate, bpmnFactory),
        oldMappings;

    if (newMappings) {
      if (!context) {
        context = getOrCreateExtensionElements(element);
        oldMappings = findExtension(element, 'camunda:InputOutput');
        commandStack.execute('properties-panel.update-businessobject-list', {
          element: element,
          currentObject: context,
          propertyName: 'values',
          objectsToAdd: [ newMappings ],
          objectsToRemove: oldMappings ? [ oldMappings ] : []
        });
      }
      else {
        commandStack.execute('properties-panel.update-businessobject', {
          element: element,
          businessObject: context,
          properties: { inputOutput: newMappings }
        });
      }
    }
  }

  function updateCamundaProperties(element, newTemplate, context) {

    var newProperties = createCamundaProperties(newTemplate, bpmnFactory),
        oldProperties;

    if (newProperties) {
      if (!context) {
        context = getOrCreateExtensionElements(element);
        oldProperties = findExtension(element, 'camunda:Properties');

        commandStack.execute('properties-panel.update-businessobject-list', {
          element: element,
          currentObject: context,
          propertyName: 'values',
          objectsToAdd: [ newProperties ],
          objectsToRemove: oldProperties ? [ oldProperties ] : []
        });
      }
      else {
        commandStack.execute('properties-panel.update-businessobject', {
          element: element,
          businessObject: context,
          properties: { properties: newProperties }
        });
      }
    }
  }

  function updateProperties(element, newTemplate, context) {

    var newProperties = createBpmnPropertyUpdates(newTemplate, bpmnFactory);

    if (Object.keys(newProperties).length > 0) {
      modeling.updateProperties(element, newProperties);
    }
  }

  function updateInOut(element, newTemplate, context) {

    var newInOut = createCamundaInOut(newTemplate, bpmnFactory),
        oldInOut;

    if (newInOut) {
      if (!context) {
        context = getOrCreateExtensionElements(element);
        oldInOut = findExtensions(context, [ 'camunda:In', 'camunda:Out' ]);

        commandStack.execute('properties-panel.update-businessobject-list', {
          element: element,
          currentObject: context,
          propertyName: 'values',
          objectsToAdd: newInOut,
          objectsToRemove: oldInOut
        });
      }
      else {
        commandStack.execute('properties-panel.update-businessobject', {
          element: element,
          businessObject: context,
          properties: { inout: newInOut }
        });
      }
    }
  }

  function updateExecutionListener(element, newTemplate, context) {

    var newExecutionListeners = createCamundaExecutionListener(newTemplate, bpmnFactory),
        oldExecutionsListeners;

    if (newExecutionListeners.length) {
      if (!context) {
        context = getOrCreateExtensionElements(element);
        oldExecutionsListeners = findExtensions(context, [ 'camunda:ExecutionListener' ]);

        commandStack.execute('properties-panel.update-businessobject-list', {
          element: element,
          currentObject: context,
          propertyName: 'values',
          objectsToAdd: newExecutionListeners,
          objectsToRemove: oldExecutionsListeners
        });
      }
      else {
        commandStack.execute('properties-panel.update-businessobject', {
          element: element,
          businessObject: context,
          properties: { executionListener: newExecutionListeners }
        });
      }
    }
  }

  function updateScopeElements(element, scopeName, scope) {

    var scopeElement = bpmnFactory.create(scopeName, {
      values: []
    });
    // Set businessObject and extensionElements as itself to look like a root element
    scopeElement.businessObject = scopeElement;
    scopeElement.extensionElements = scopeElement;
    scopeElement.set('extensionElements', scopeElement);

    // update camunda:inputOutput
    updateIoMappings(scopeElement, scope, scopeElement);

    // update camunda:properties
    updateCamundaProperties(scopeElement, scope, scopeElement);

    // update other properties (bpmn:condition, camunda:async, ...)
    updateProperties(scopeElement, scope, scopeElement);

    // update camunda:in and camunda:out
    updateInOut(scopeElement, scope, scopeElement);

    // update camunda:executionListener
    updateExecutionListener(scopeElement, scope, scopeElement);

    var extensionElements = getOrCreateExtensionElements(element);
    var oldScope = findExtension(extensionElements, scopeName);
    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: extensionElements,
      propertyName: 'values',
      objectsToAdd: [ scopeElement ],
      objectsToRemove: oldScope ? [ oldScope ] : []
    });
  }

  /**
   * Compose an element template change action, updating all
   * necessary underlying properties.
   *
   * @param {Object} context
   * @param {Object} context.element
   * @param {Object} context.oldTemplate
   * @param {Object} context.newTemplate
   */
  this.preExecute = function(context) {

    var element = context.element,
        newTemplate = context.newTemplate;

    // update camunda:modelerTemplate attribute
    updateModelerTemplate(element, newTemplate);

    if (newTemplate) {

      var extensionElements = getOrCreateExtensionElements(element);

      // update camunda:inputOutput
      updateIoMappings(element, newTemplate, extensionElements);

      // update camunda:properties
      updateCamundaProperties(element, newTemplate, extensionElements);

      // update other properties (bpmn:condition, camunda:async, ...)
      updateProperties(element, newTemplate, extensionElements);

      // update camunda:in and camunda:out
      updateInOut(element, newTemplate, extensionElements);

      // update camunda:executionListener
      updateExecutionListener(element, newTemplate, extensionElements);

      // Loop on scopes properties
      if (newTemplate.scopes) {
        for (var scopeName in newTemplate.scopes) {

          updateScopeElements(element, scopeName, newTemplate.scopes[ scopeName ]);

        }
      }
    }
  };
}

ChangeElementTemplateHandler.$inject = [ 'modeling', 'commandStack', 'bpmnFactory' ];

module.exports = ChangeElementTemplateHandler;



/////// helpers /////////////////////////////

function createBpmnPropertyUpdates(template, bpmnFactory) {

  var propertyUpdates = {};

  template.properties.forEach(function(p) {

    var binding = p.binding,
        bindingTarget = binding.name,
        propertyValue;

    if (binding.type === 'property') {

      if (bindingTarget === 'conditionExpression') {
        propertyValue = bpmnFactory.create('bpmn:FormalExpression', {
          body: p.value,
          language: binding.scriptFormat
        });
      } else {
        propertyValue = p.value;
      }

      // assigning camunda:async to true|false
      // assigning bpmn:conditionExpression to { $type: 'bpmn:FormalExpression', ... }
      propertyUpdates[bindingTarget] = propertyValue;

      // make sure we unset other "implementation types"
      // when applying a camunda:class template onto a preconfigured
      // camunda:delegateExpression element
      if (CAMUNDA_SERVICE_TASK_LIKE.indexOf(bindingTarget) !== -1) {
        CAMUNDA_SERVICE_TASK_LIKE.forEach(function(prop) {
          if (prop !== bindingTarget) {
            propertyUpdates[prop] = undefined;
          }
        });
      }
    }
  });

  return propertyUpdates;
}

function createCamundaProperties(template, bpmnFactory) {

  var properties = [];

  template.properties.forEach(function(p) {
    var binding = p.binding,
        bindingType  = binding.type;

    if (bindingType === 'camunda:property') {
      properties.push(createCamundaProperty(
        binding, p.value, bpmnFactory
      ));
    }
  });

  if (properties.length) {
    return bpmnFactory.create('camunda:Properties', {
      values: properties
    });
  }
}

function createInputOutputMappings(template, bpmnFactory) {

  var inputParameters = [],
      outputParameters = [];

  template.properties.forEach(function(p) {
    var binding = p.binding,
        bindingType = binding.type;

    if (bindingType === 'camunda:inputParameter') {
      inputParameters.push(createInputParameter(
        binding, p.value, bpmnFactory
      ));
    }

    if (bindingType === 'camunda:outputParameter') {
      outputParameters.push(createOutputParameter(
        binding, p.value, bpmnFactory
      ));
    }
  });

  // do we need to create new ioMappings (?)
  if (outputParameters.length || inputParameters.length) {
    return bpmnFactory.create('camunda:InputOutput', {
      inputParameters: inputParameters,
      outputParameters: outputParameters
    });
  }
}

function createCamundaInOut(template, bpmnFactory) {

  var inOuts = [];

  template.properties.forEach(function(p) {
    var binding = p.binding,
        bindingType  = binding.type;

    if (bindingType === 'camunda:in') {
      inOuts.push(createCamundaIn(
        binding, p.value, bpmnFactory
      ));
    } else
    if (bindingType === 'camunda:out') {
      inOuts.push(createCamundaOut(
        binding, p.value, bpmnFactory
      ));
    } else
    if (bindingType === 'camunda:in:businessKey') {
      inOuts.push(createCamundaInWithBusinessKey(
        binding, p.value, bpmnFactory
      ));
    }
  });

  return inOuts;
}


function createCamundaExecutionListener(template, bpmnFactory) {

  var executionListener = [];

  template.properties.forEach(function(p) {
    var binding = p.binding,
        bindingType  = binding.type;

    if (bindingType === 'camunda:executionListener') {
      executionListener.push(createCamundaExecutionListenerScript(
        binding, p.value, bpmnFactory
      ));
    }
  });

  return executionListener;
}