'use strict';

var getTemplate = require('../element-templates/Helper').getTemplate;

var inputParameters = require('./implementation/InputParameters');

module.exports = function(group, element, bpmnFactory, elementTemplates, translate) {

  var template = getTemplate(element, elementTemplates);

  if (template) {
    return;
  }

  var inputParametersEntry = inputParameters(element, bpmnFactory, {}, translate);

  group.entries = group.entries.concat(inputParametersEntry.entries);
};
