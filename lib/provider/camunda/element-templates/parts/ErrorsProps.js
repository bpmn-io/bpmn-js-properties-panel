'use strict';

var forEach = require('min-dash').forEach,
    filter = require('min-dash').filter,
    flatten = require('min-dash').flatten,
    findIndex = require('min-dash').findIndex;

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var findExtensions = require('../Helper').findExtensions,
    findCamundaErrorEventDefinition = require('../Helper').findCamundaErrorEventDefinition;

var ErrorEntries = require('../../parts/implementation/ErrorsEntries');

var entryFactory = require('../../../../factory/EntryFactory');

var domQuery = require('min-dom').query;

var CAMUNDA_ERROR_EVENT_DEFINITION_TYPE = 'camunda:errorEventDefinition';

var EMPTY_ERROR = {
  get: function() {},
  set: function() {},
  errorRef: {}
};

/**
 * Injects element template errors into the given group.
 *
 * @param {Object} group
 * @param {djs.model.Base} element
 * @param {ElementTemplates} elementTemplates
 * @param {BpmnFactory} bpmnFactory
 * @param {Function} translate
 */
module.exports = function(group, element, elementTemplates, bpmnFactory, translate) {
  var template = elementTemplates.get(element);

  if (!template) {
    return [];
  }

  var errorEntries = [];

  function onToggle(value, entryNode) {
    if (!value) {
      return;
    }

    var currentEntryId = entryNode.dataset.entry;

    // collapse all other items
    errorEntries.forEach(function(entries) {
      var collapsible = entries[0];

      if (collapsible.id === currentEntryId) {
        return;
      }

      var entryNode = domQuery('[data-entry="' + collapsible.id + '"]');
      collapsible.setOpen(false, entryNode);
    });
  }


  function renderError(id, templateProperty) {
    var binding = templateProperty.binding,
        bindingErrorRef = binding.errorRef,
        errorEntries = [],
        collapsibleEntry;

    // find error event definition first
    var bo = getBusinessObject(element),
        errorEventDefinitions = findExtensions(bo, [ 'camunda:ErrorEventDefinition' ]);

    if (!errorEventDefinitions) {
      return errorEntries;
    }

    var getError = function() {
      var definition = findCamundaErrorEventDefinition(element, bindingErrorRef);

      if (!definition) {
        return EMPTY_ERROR;
      }

      return definition;
    };

    var error = getError();

    var isOpen = function() {
      return collapsibleEntry.isOpen();
    };

    var options = {
      idPrefix: id + '-',
      onToggle: onToggle,
      getError: getError,
      isOpen: function() {
        return isOpen();
      }
    };

    // (1) use errors implementation
    var errorImplementation = ErrorEntries(error, bpmnFactory, element, options, translate);
    errorEntries = errorImplementation.entries;

    var errorReferenceIdx = findEntry(errorEntries, id + '-error-reference');

    collapsibleEntry = errorEntries[findEntry(errorEntries, id + '-collapsible')];

    // (2) replace validated expression entry by a simple, disabled entry
    var expressionIdx = findEntry(errorEntries, id + '-error-expression');
    removeEntry(errorEntries, expressionIdx);

    var expressionEntry = entryFactory.textField(translate, {
      id: id + '-error-expression',
      label: translate('Throw Expression'),
      modelProperty: 'expression',

      get: function() {
        return { expression: getError().expression };
      },

      buttonShow: {
        method: function() {
          return false;
        }
      },

      hidden: function() {
        return !isOpen();
      },
      disabled: function() {
        return true;
      }
    });

    errorEntries.splice(expressionIdx, 0, expressionEntry);

    // (3) remove error selection
    removeEntry(errorEntries, errorReferenceIdx);

    return errorEntries;
  }

  // filter specific errors from template
  var errors = filter(template.properties, function(p) {
    return !p.type && p.binding.type === CAMUNDA_ERROR_EVENT_DEFINITION_TYPE;
  });

  forEach(errors, function(property, idx) {
    var id = 'template-errors-' + template.id + '-' + idx;
    errorEntries.push(renderError(id, property));
  });

  group.entries = group.entries.concat(flatten(errorEntries));
};


// helper //////////////////////////

function findEntry(entries, id) {
  return findIndex(entries, function(entry) {
    return entry.id === id;
  });
}

function removeEntry(entries, idx) {
  entries.splice(idx, 1);
}