'use strict';

var errors = require('./implementation/Errors');

module.exports = function(group, element, bpmnFactory, elementTemplates, translate) {

  var template = elementTemplates.get(element);

  if (template) {
    return;
  }

  var errorsEntry = errors(element, bpmnFactory, {}, translate);

  group.entries = group.entries.concat(errorsEntry.entries);
};
