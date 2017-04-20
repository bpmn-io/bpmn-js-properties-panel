'use strict';

var ImplementationTypeHelper = require('../../../helper/ImplementationTypeHelper');

var fieldInjection = require('./implementation/FieldInjection');

module.exports = function(group, element, bpmnFactory, translate) {

  if (!ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element)) {
    return;
  }

  var fieldInjectionEntry = fieldInjection(element, bpmnFactory, {}, translate);

  if (fieldInjectionEntry && fieldInjectionEntry.length > 0) {
    group.entries = group.entries.concat(fieldInjectionEntry);
  }

};
