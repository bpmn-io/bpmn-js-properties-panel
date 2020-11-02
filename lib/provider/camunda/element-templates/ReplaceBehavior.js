'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is;

/**
 * This function catches the <moddleCopy.canCopyProperty> event
 * and only allows the copy of the modelerTemplate property
 * if the element's type or its parent's is in
 * the list of elements the template applies to.
 */
function ReplaceBehavior(elementTemplates, eventBus) {
  eventBus.on('moddleCopy.canCopyProperty', function(context) {
    var parent = context.parent;
    var property = context.property;
    var propertyName = context.propertyName;

    if (propertyName !== 'modelerTemplate') {
      return;
    }

    var elementTemplate = elementTemplates.get(property);

    if (!elementTemplate) {
      return false;
    }

    var appliesTo = elementTemplate.appliesTo;

    var allowed = appliesTo.reduce(function(allowed, type) {
      return allowed || is(parent, type);
    }, false);

    if (!allowed) {
      return false;
    }
  });
}

ReplaceBehavior.$inject = ['elementTemplates', 'eventBus'];

module.exports = ReplaceBehavior;