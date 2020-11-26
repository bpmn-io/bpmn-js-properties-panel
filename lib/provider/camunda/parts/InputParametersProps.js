'use strict';

var inputParameters = require('./implementation/InputParameters');

module.exports = function(group, element, bpmnFactory, elementTemplates, translate) {

  var template = elementTemplates.get(element);

  if (template) {
    return;
  }

  var inputParametersEntry = inputParameters(element, bpmnFactory, {}, translate);

  group.entries = group.entries.concat(inputParametersEntry.entries);
};
