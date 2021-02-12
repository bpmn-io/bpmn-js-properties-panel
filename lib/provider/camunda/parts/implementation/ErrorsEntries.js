'use strict';

var cmdHelper = require('../../../../helper/CmdHelper');

var entryFactory = require('../../../../factory/EntryFactory');

var eventDefinitionReference = require('../../../bpmn/parts/implementation/EventDefinitionReference'),
    elementReferenceProperty = require('../../../bpmn/parts/implementation/ElementReferenceProperty');

var domQuery = require('min-dom').query;

module.exports = function(error, bpmnFactory, element, options, translate) {

  options = options || {};

  var idPrefix = options.idPrefix || '';

  var getError =
    (options.getError && typeof options.getError === 'function') ?
      function() {
        return options.getError();
      } :
      function() {
        return error;
      };

  var result = {},
      entries = [];

  result.entries = entries;

  var getCollapsibleTitle = function() {
    var error = getError();
    var title = 'No Error referenced';

    if (error.errorRef) {
      title = error.errorRef.name;
      if (error.errorRef.errorCode) {
        title += ' (code = ' + error.errorRef.errorCode + ')';
      }
    }
    return title;
  };

  // heading ////////////////////////////////////////////////////////
  var collapsible = entryFactory.collapsible({
    id: idPrefix + 'collapsible',
    title: getCollapsibleTitle(),
    description: getError().expression || '',
    cssClasses: [ 'bpp-collapsible-error' ],
    open: false,
    onRemove: options.onRemove,
    onToggle: options.onToggle,
    get: function() {
      return {
        title: getCollapsibleTitle(),
        description: getError().expression || '',
      };
    }
  });

  var isOpen = options.isOpen || collapsible.isOpen;

  result.setOpen = function(value) {
    var entryNode = domQuery('[data-entry="' + collapsible.id + '"]');
    collapsible.setOpen(value, entryNode);
  };

  entries.push(collapsible);

  entries.push(entryFactory.validationAwareTextField(translate, {
    id: idPrefix + 'error-expression',
    label: translate('Throw Expression'),
    modelProperty: 'expression',

    getProperty: function(element, node) {
      return error.expression;
    },

    setProperty: function(element, values, node) {
      return cmdHelper.updateBusinessObject(element, error, values);
    },

    validate: function(element, values, node) {
      var validation = {};
      var expressionValue = values.expression;

      if (!expressionValue) {
        validation.expression = translate('Error must have an expression');
      }

      return validation;
    },

    hidden: function(element, node) {
      return !isOpen();
    }
  }));


  entries.push.apply(entries, eventDefinitionReference(element, error, bpmnFactory, {
    id: idPrefix + 'error-reference',
    label: translate('Global Error referenced'),
    elementName: 'error',
    elementType: 'bpmn:Error',
    referenceProperty: 'errorRef',
    newElementIdPrefix: 'Error_',

    hidden: function(element, node) {
      return !isOpen();
    }
  }));


  entries.push.apply(entries, elementReferenceProperty(element, error, bpmnFactory, translate, {
    id: idPrefix + 'error-element-name',
    label: translate('Name'),
    referenceProperty: 'errorRef',
    modelProperty: 'name',
    shouldValidate: true,

    hidden: function(element, node) {
      return !isOpen();
    }
  }));


  entries.push.apply(entries, elementReferenceProperty(element, error, bpmnFactory, translate, {
    id: idPrefix + 'error-element-code',
    label: translate('Code'),
    referenceProperty: 'errorRef',
    modelProperty: 'errorCode',
    shouldValidate: true,

    hidden: function(element, node) {
      return !isOpen();
    }
  }));


  entries.push.apply(entries, elementReferenceProperty(element, error, bpmnFactory, translate, {
    id: idPrefix + 'error-element-message',
    label: translate('Message'),
    referenceProperty: 'errorRef',
    modelProperty: 'errorMessage',

    hidden: function(element, node) {
      return !isOpen();
    }
  }));

  return result;
};
