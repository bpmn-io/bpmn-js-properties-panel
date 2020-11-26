'use strict';

var outputParameters = require('./implementation/OutputParameters');

module.exports = function(group, element, bpmnFactory, elementTemplates, translate) {

  var template = elementTemplates.get(element);

  if (template) {
    return;
  }

  var outputParametersEntry = outputParameters(element, bpmnFactory, {}, translate);

  group.entries = group.entries.concat(outputParametersEntry.entries);
};
