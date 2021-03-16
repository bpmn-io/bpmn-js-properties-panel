'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var is = require('bpmn-js/lib/util/ModelUtil').is,
    isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;

var find = require('lodash/find');

var TEMPLATE_ID_ATTR = 'camunda:modelerTemplate',
    TEMPLATE_VERSION_ATTR = 'camunda:modelerTemplateVersion';

/**
 * The BPMN 2.0 extension attribute name under
 * which the element template ID is stored.
 *
 * @type {String}
 */
module.exports.TEMPLATE_ID_ATTR = TEMPLATE_ID_ATTR;

/**
 * The BPMN 2.0 extension attribute name under
 * which the element template version is stored.
 *
 * @type {String}
 */
module.exports.TEMPLATE_VERSION_ATTR = TEMPLATE_VERSION_ATTR;


/**
 * Get template id for a given diagram element.
 *
 * @param {djs.model.Base} element
 *
 * @return {String}
 */
function getTemplateId(element) {

  var bo = getBusinessObject(element);

  if (bo) {
    return bo.get(TEMPLATE_ID_ATTR);
  }
}

module.exports.getTemplateId = getTemplateId;

/**
 * Get template version for a given diagram element.
 *
 * @param {djs.model.Base} element
 *
 * @return {String}
 */
function getTemplateVersion(element) {

  var bo = getBusinessObject(element);

  if (bo) {
    return bo.get(TEMPLATE_VERSION_ATTR);
  }
}

module.exports.getTemplateVersion = getTemplateVersion;


/**
 * Find extension with given type in
 * BPMN element, diagram element or ExtensionElement.
 *
 * @param {ModdleElement|djs.model.Base} element
 * @param {String} type
 *
 * @return {ModdleElement} the extension
 */
function findExtension(element, type) {
  var bo = getBusinessObject(element);

  var extensionElements;

  if (is(bo, 'bpmn:ExtensionElements')) {
    extensionElements = bo;
  } else {
    extensionElements = bo.extensionElements;
  }

  if (!extensionElements) {
    return null;
  }

  return find(extensionElements.get('values'), function(e) {
    return is(e, type);
  });
}

module.exports.findExtension = findExtension;


function findExtensions(element, types) {
  var extensionElements = getExtensionElements(element);

  if (!extensionElements) {
    return [];
  }

  return extensionElements.get('values').filter(function(e) {
    return isAny(e, types);
  });
}

module.exports.findExtensions = findExtensions;


function findCamundaInOut(element, binding) {

  var extensionElements = getExtensionElements(element);

  if (!extensionElements) {
    return;
  }

  var matcher;

  if (binding.type === 'camunda:in') {
    matcher = function(e) {
      return is(e, 'camunda:In') && isInOut(e, binding);
    };
  } else
  if (binding.type === 'camunda:out') {
    matcher = function(e) {
      return is(e, 'camunda:Out') && isInOut(e, binding);
    };
  } else
  if (binding.type === 'camunda:in:businessKey') {
    matcher = function(e) {
      return is(e, 'camunda:In') && 'businessKey' in e;
    };
  }

  return find(extensionElements.get('values'), matcher);
}

module.exports.findCamundaInOut = findCamundaInOut;

function findCamundaProperty(camundaProperties, binding) {
  return find(camundaProperties.get('values'), function(p) {
    return p.name === binding.name;
  });
}

module.exports.findCamundaProperty = findCamundaProperty;


function findInputParameter(inputOutput, binding) {
  var parameters = inputOutput.get('inputParameters');

  return find(parameters, function(p) {
    return p.name === binding.name;
  });
}

module.exports.findInputParameter = findInputParameter;


function findOutputParameter(inputOutput, binding) {
  var parameters = inputOutput.get('outputParameters');

  return find(parameters, function(p) {
    var value = p.value;

    if (!binding.scriptFormat) {
      return value === binding.source;
    }

    var definition = p.definition;

    if (!definition || binding.scriptFormat !== definition.scriptFormat) {
      return false;
    }

    return definition.value === binding.source;
  });
}

module.exports.findOutputParameter = findOutputParameter;


function findCamundaErrorEventDefinition(element, bindingErrorRef) {
  var errorEventDefinitions = findExtensions(element, [ 'camunda:ErrorEventDefinition' ]),
      error;

  // error id has to start with <Error_${binding.errorRef}_>
  return find(errorEventDefinitions, function(definition) {
    error = definition.errorRef;

    if (error) {
      return error.id.indexOf('Error_' + bindingErrorRef) == 0;
    }
  });
}

module.exports.findCamundaErrorEventDefinition = findCamundaErrorEventDefinition;



// helpers /////////////////////////////////

function getExtensionElements(element) {
  var bo = getBusinessObject(element);

  if (is(bo, 'bpmn:ExtensionElements')) {
    return bo;
  } else {
    return bo.extensionElements;
  }
}


function isInOut(element, binding) {

  if (binding.type === 'camunda:in') {

    // find based on target attribute
    if (binding.target) {
      return element.target === binding.target;
    }
  }

  if (binding.type === 'camunda:out') {

    // find based on source / sourceExpression
    if (binding.source) {
      return element.source === binding.source;
    }

    if (binding.sourceExpression) {
      return element.sourceExpression === binding.sourceExpression;
    }
  }

  // find based variables / local combination
  if (binding.variables) {
    return element.variables === 'all' && (
      binding.variables !== 'local' || element.local
    );
  }
}
