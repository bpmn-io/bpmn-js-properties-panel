'use strict';
var getTemplate = require('../element-templates/Helper').getTemplate;

var outputParameters = require('./implementation/OutputParameters');

module.exports = function(group, element, bpmnFactory, elementTemplates, translate) {

  var template = getTemplate(element, elementTemplates);

  if (template) {
    return;
  }

  var outputParametersEntry = outputParameters(element, bpmnFactory, {}, translate);

  group.entries = group.entries.concat(outputParametersEntry.entries);
};
