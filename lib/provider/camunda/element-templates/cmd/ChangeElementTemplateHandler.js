'use strict';

var findExtension = require('../Helper').findExtension;

var createCamundaProperty = require('../CreateHelper').createCamundaProperty,
    createInputParameter = require('../CreateHelper').createInputParameter,
    createOutputParameter = require('../CreateHelper').createOutputParameter;

var CAMUNDA_SERVICE_TASK_LIKE = [
  'camunda:class',
  'camunda:delegateExpression',
  'camunda:expression'
];

/**
 * A handler that changes the modeling template of
 * template of a BPMN element.
 */
function ChangeElementTemplateHandler(modeling, commandStack, bpmnFactory) {

  function getExtensionElements(element) {

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

  function updateIoMappings(element, newTemplate) {

    var extensionElements;

    var newMappings = createInputOutputMappings(newTemplate, bpmnFactory),
        oldMappings;

    if (newMappings) {
      extensionElements = getExtensionElements(element);

      oldMappings = findExtension(element, 'camunda:InputOutput');

      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: extensionElements,
        propertyName: 'values',
        objectsToAdd: [ newMappings ],
        objectsToRemove: oldMappings ? [ oldMappings ] : []
      });
    }
  }

  function updateCamundaProperties(element, newTemplate) {

    var extensionElements;

    var newProperties = createCamundaProperties(newTemplate, bpmnFactory),
        oldProperties;

    if (newProperties) {
      extensionElements = getExtensionElements(element);

      oldProperties = findExtension(element, 'camunda:Properties');

      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: extensionElements,
        propertyName: 'values',
        objectsToAdd: [ newProperties ],
        objectsToRemove: oldProperties ? [ oldProperties ] : []
      });
    }
  }

  function updateProperties(element, newTemplate) {

    var newProperties = createBpmnPropertyUpdates(newTemplate, bpmnFactory);

    if (Object.keys(newProperties).length > 0) {
      modeling.updateProperties(element, newProperties);
    }
  }

  /**
   * Compose a element template change action, updating all
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

      // update camunda:inputOutput
      updateIoMappings(element, newTemplate);

      // update camunda:properties
      updateCamundaProperties(element, newTemplate);

      // update other properties (bpmn:condition, camunda:async, ...)
      updateProperties(element, newTemplate);
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
        bindingTarget = binding.target,
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