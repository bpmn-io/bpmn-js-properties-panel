'use strict';

var assign = require('lodash/assign');

var nextId = require('../../../Utils').nextId;

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
function createInputParameter(binding, value, bpmnFactory) {
  var scriptFormat = binding.scriptFormat,
      parameterValue,
      parameterDefinition;

  if (scriptFormat) {
    parameterDefinition = bpmnFactory.create('camunda:Script', {
      scriptFormat: scriptFormat,
      value: value
    });
  } else {
    parameterValue = value;
  }

  return bpmnFactory.create('camunda:InputParameter', {
    name: binding.name,
    value: parameterValue,
    definition: parameterDefinition
  });
}

module.exports.createInputParameter = createInputParameter;


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
function createOutputParameter(binding, value, bpmnFactory) {
  var scriptFormat = binding.scriptFormat,
      parameterValue,
      parameterDefinition;

  if (scriptFormat) {
    parameterDefinition = bpmnFactory.create('camunda:Script', {
      scriptFormat: scriptFormat,
      value: binding.source
    });
  } else {
    parameterValue = binding.source;
  }

  return bpmnFactory.create('camunda:OutputParameter', {
    name: value,
    value: parameterValue,
    definition: parameterDefinition
  });
}

module.exports.createOutputParameter = createOutputParameter;


/**
 * Create camunda property from the given binding.
 *
 * @param {PropertyBinding} binding
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
function createCamundaProperty(binding, value, bpmnFactory) {
  return bpmnFactory.create('camunda:Property', {
    name: binding.name,
    value: value || ''
  });
}

module.exports.createCamundaProperty = createCamundaProperty;


/**
 * Create camunda:in element from given binding.
 *
 * @param {PropertyBinding} binding
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
function createCamundaIn(binding, value, bpmnFactory) {

  var properties = createCamundaInOutAttrs(binding, value);

  return bpmnFactory.create('camunda:In', properties);
}

module.exports.createCamundaIn = createCamundaIn;


/**
 * Create camunda:in with businessKey element from given binding.
 *
 * @param {PropertyBinding} binding
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
function createCamundaInWithBusinessKey(binding, value, bpmnFactory) {
  return bpmnFactory.create('camunda:In', {
    businessKey: value
  });
}

module.exports.createCamundaInWithBusinessKey = createCamundaInWithBusinessKey;


/**
 * Create camunda:out element from given binding.
 *
 * @param {PropertyBinding} binding
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
function createCamundaOut(binding, value, bpmnFactory) {
  var properties = createCamundaInOutAttrs(binding, value);

  return bpmnFactory.create('camunda:Out', properties);
}

module.exports.createCamundaOut = createCamundaOut;


/**
 * Create camunda:executionListener element containing an inline script from given binding.
 *
 * @param {PropertyBinding} binding
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
function createCamundaExecutionListenerScript(binding, value, bpmnFactory) {
  var scriptFormat = binding.scriptFormat,
      parameterValue,
      parameterDefinition;

  if (scriptFormat) {
    parameterDefinition = bpmnFactory.create('camunda:Script', {
      scriptFormat: scriptFormat,
      value: value
    });
  } else {
    parameterValue = value;
  }

  return bpmnFactory.create('camunda:ExecutionListener', {
    event: binding.event,
    value: parameterValue,
    script: parameterDefinition
  });
}

module.exports.createCamundaExecutionListenerScript = createCamundaExecutionListenerScript;

/**
 * Create camunda:field element containing string or expression from given binding.
 *
 * @param {PropertyBinding} binding
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
function createCamundaFieldInjection(binding, value, bpmnFactory) {
  var DEFAULT_PROPS = {
    'string': undefined,
    'expression': undefined,
    'name': undefined
  };

  var props = assign({}, DEFAULT_PROPS);

  if (!binding.expression) {
    props.string = value;
  } else {
    props.expression = value;
  }
  props.name = binding.name;

  return bpmnFactory.create('camunda:Field', props);
}

module.exports.createCamundaFieldInjection = createCamundaFieldInjection;

/**
 * Create camunda:errorEventDefinition element containing expression and errorRef
 * from given binding.
 *
 * @param {PropertyBinding} binding
 * @param {String} value
 * @param {ModdleElement} error
 * @param {ModdleElement} parent
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
function createCamundaErrorEventDefinition(binding, value, error, parent, bpmnFactory) {
  var errorRef = error,
      expression = value;

  var newErrorEventDefinition = bpmnFactory.create('camunda:ErrorEventDefinition', {
    expression: expression,
    errorRef: errorRef
  });

  newErrorEventDefinition.$parent = parent;

  return newErrorEventDefinition;
}

module.exports.createCamundaErrorEventDefinition = createCamundaErrorEventDefinition;

/**
 * Create bpmn:error element containing a specific error id given by a binding.
 *
 * @param {String} bindingErrorRef
 * @param {ModdleElement} parent
 * @param {BpmnFactory} bpmnFactory
 *
 * @return { ModdleElement }
 */
function createError(bindingErrorRef, parent, bpmnFactory) {
  var error = bpmnFactory.create('bpmn:Error', {

    // we need to later retrieve the error from a binding
    id: nextId('Error_' + bindingErrorRef + '_')
  });

  error.$parent = parent;

  return error;
}

module.exports.createError = createError;

// helpers ////////////////////////////

/**
 * Create properties for camunda:in and camunda:out types.
 */
function createCamundaInOutAttrs(binding, value) {

  var properties = {};

  // camunda:in source(Expression) target
  if (binding.target) {

    properties.target = binding.target;

    if (binding.expression) {
      properties.sourceExpression = value;
    } else {
      properties.source = value;
    }
  } else

  // camunda:(in|out) variables local
  if (binding.variables) {
    properties.variables = 'all';

    if (binding.variables === 'local') {
      properties.local = true;
    }
  }

  // camunda:out source(Expression) target
  else {
    properties.target = value;

    [ 'source', 'sourceExpression' ].forEach(function(k) {
      if (binding[k]) {
        properties[k] = binding[k];
      }
    });
  }

  return properties;
}
