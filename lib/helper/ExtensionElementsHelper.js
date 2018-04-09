'use strict';

var cmdHelper = require('./CmdHelper'),
    elementHelper = require('./ElementHelper');

var is = require('bpmn-js/lib/util/ModelUtil').is;

var ExtensionElementsHelper = {};

var getExtensionElements = function(bo) {
  return bo.get('extensionElements');
};

ExtensionElementsHelper.getExtensionElements = function(bo, type) {
  var extensionElements = getExtensionElements(bo);
  if (typeof extensionElements !== 'undefined') {
    var extensionValues = extensionElements.get('values');
    if (typeof extensionValues !== 'undefined') {
      var elements = extensionValues.filter(function(value) {
        return is(value, type);
      });
      if (elements.length) {
        return elements;
      }
    }
  }
};

ExtensionElementsHelper.addEntry = function(bo, element, entry, bpmnFactory) {
  var extensionElements = bo.get('extensionElements');

  // if there is no extensionElements list, create one
  if (!extensionElements) {
    // TODO: Ask Daniel which operation costs more
    extensionElements = elementHelper.createElement('bpmn:ExtensionElements', { values: [entry] }, bo, bpmnFactory);
    return { extensionElements : extensionElements };
  } else {
    // add new failedJobRetryExtensionElement to existing extensionElements list
    return cmdHelper.addElementsTolist(element, extensionElements, 'values', [entry]);
  }
};

ExtensionElementsHelper.removeEntry = function(bo, element, entry) {
  var extensionElements = bo.get('extensionElements');

  if (!extensionElements) {

    // return an empty command when there is no extensionElements list
    return {};
  }

  return cmdHelper.removeElementsFromList(element, extensionElements, 'values', 'extensionElements', [entry]);
};

module.exports = ExtensionElementsHelper;
