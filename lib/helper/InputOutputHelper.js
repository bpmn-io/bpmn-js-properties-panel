'use strict';

var ModelUtil         = require('bpmn-js/lib/util/ModelUtil'),
    is                = ModelUtil.is,
    getBusinessObject = ModelUtil.getBusinessObject;

var extensionElementsHelper = require('./ExtensionElementsHelper');

var InputOutputHelper = {};

module.exports = InputOutputHelper;

function getElements(bo, type, prop) {
  var elems = extensionElementsHelper.getExtensionElements(bo, type) || [];
  return !prop ? elems : (elems[0] || {})[prop] || [];
}

function getParameters(element, prop) {
  var inputOutput = InputOutputHelper.getInputOutput(element);
  return (inputOutput && inputOutput.get(prop)) || [];
}

InputOutputHelper.getInputOutput = function(element) {
  var bo = getBusinessObject(element);
  return (getElements(bo, 'camunda:InputOutput') || [])[0];
};

InputOutputHelper.getInputParameters = function(element) {
  return getParameters.apply(this, [ element, 'inputParameters' ]);
};

InputOutputHelper.getOutputParameters = function(element) {
  return getParameters.apply(this, [ element, 'outputParameters' ]);
};

InputOutputHelper.getInputParameter = function(element, idx) {
  return this.getInputParameters(element)[idx];
};

InputOutputHelper.getOutputParameter = function(element, idx) {
  return this.getOutputParameters(element)[idx];
};

InputOutputHelper.isInputOutputSupported = function(element) {
  var bo = getBusinessObject(element);
  return is(bo, 'bpmn:FlowNode') &&
         !is(bo, 'bpmn:StartEvent') &&
         !is(bo, 'bpmn:BoundaryEvent') &&
         !(is(bo, 'bpmn:SubProcess') && bo.get('triggeredByEvent'));
};

InputOutputHelper.areOutputParametersSupported = function(element) {
  var bo = getBusinessObject(element);
  return !is(bo, 'bpmn:EndEvent') && !bo.loopCharacteristics;
};
