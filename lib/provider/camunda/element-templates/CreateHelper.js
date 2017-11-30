'use strict';

/**
 * Create an input parameter representing the given
 * binding and value.
 *
 * @param {PropertyBinding} binding
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 * @param {String} type
 *
 * @return {ModdleElement}
 */
function createInputParameter(binding, value, bpmnFactory, type) {
  var scriptFormat = binding.scriptFormat,
      parameterValue,
      parameterDefinition;

  if (type == 'Map') {

    var entries = [];
    if (value) {
      value.forEach(function(item) {
        entries.push(bpmnFactory.create('camunda:Entry', item));
      });
    }

    parameterDefinition = bpmnFactory.create('camunda:Map', {
      scriptFormat: scriptFormat,
      entries: entries
    });
  }
  else if (type == 'List') {

    var items = [];
    if (value) {
      value.forEach(function(item) {
        items.push(bpmnFactory.create('camunda:Value', {
          value: item
        }));
      });
    }

    parameterDefinition = bpmnFactory.create('camunda:List', {
      scriptFormat: scriptFormat,
      items: items
    });

  }
  else {
    if (scriptFormat) {
      parameterDefinition = bpmnFactory.create('camunda:Script', {
        scriptFormat: scriptFormat,
        value: value
      });
    } else {
      parameterValue = value;
    }
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
 * @param {String} type
 *
 * @return {ModdleElement}
 */
function createOutputParameter(binding, value, bpmnFactory, type) {
  var scriptFormat = binding.scriptFormat,
      parameterValue,
      parameterDefinition;

  if (type == 'Map') {

    var entries = [];
    if (value) {
      value.forEach(function(item) {
        entries.push(bpmnFactory.create('camunda:Entry', item));
      });
    }

    parameterDefinition = bpmnFactory.create('camunda:Map', {
      scriptFormat: scriptFormat,
      entries: entries
    });
  }
  else if (type == 'List') {

    var items = [];
    if (value) {
      value.forEach(function(item) {
        items.push(bpmnFactory.create('camunda:Value', {
          value: item
        }));
      });
    }

    parameterDefinition = bpmnFactory.create('camunda:List', {
      scriptFormat: scriptFormat,
      items: items
    });

  }
  else {
    if (scriptFormat) {
      parameterDefinition = bpmnFactory.create('camunda:Script', {
        scriptFormat: scriptFormat,
        value: binding.source
      });
    } else {
      parameterValue = binding.source;
    }
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


/////////// helpers ////////////////////////////

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
