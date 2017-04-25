'use strict';

var ImplementationTypeHelper = require('../../../helper/ImplementationTypeHelper');

var fieldInjection = require('./implementation/FieldInjection');

module.exports = function(group, element, bpmnFactory, translate) {

  var bo = ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);

  if (!bo) {
    return;
  }

  var fieldInjectionEntry = fieldInjection(element, bpmnFactory, translate, { businessObject: bo });

  if (fieldInjectionEntry && fieldInjectionEntry.length > 0) {
    group.entries = group.entries.concat(fieldInjectionEntry);
  }

};
