'use strict';

var inherits = require('inherits');

var getTemplateId = require('./Helper').getTemplateId;

var isBoolean = require('lodash/isBoolean');

var find = require('min-dash').find,
    isNumber = require('min-dash').isNumber;

var handleLegacyScopes = require('./util/handleLegacyScopes');

var PropertiesActivator = require('../../../PropertiesActivator');

var HIGHER_PRIORITY = 1100;

/**
 * Decides what entries are visible and editable. When an element template is applied only entries
 * in the element template tab are visible. Override this behavior through a properties activator
 * with higher priority or by specifying `entriesVisible`.
 *
 * @param {EventBus} eventBus
 * @param {ElementTemplates} elementTemplates
 */
function CustomElementsPropertiesActivator(eventBus, elementTemplates) {
  PropertiesActivator.call(this, eventBus, HIGHER_PRIORITY);

  this.isEntryVisible = function(element, entry, group, tab) {
    var template = elementTemplates.get(element),
        templateId = getTemplateId(element);

    if (templateId && !isEntryVisible(entry, tab, template)) {
      return false;
    }
  };

  this.isPropertyEditable = function(propertyName, element, entry, group, tab) {
    var template = elementTemplates.get(element);

    if (template && !isEntryEditable(entry, template)) {
      return false;
    }
  };
}

CustomElementsPropertiesActivator.$inject = [ 'eventBus', 'elementTemplates' ];

inherits(CustomElementsPropertiesActivator, PropertiesActivator);

module.exports = CustomElementsPropertiesActivator;



// helpers //////////


var CUSTOM_PROPERTIES_PATTERN = /^custom-/;

var DEFAULT_ENTRIES_VISIBLE = {
  _all: false
};

function isCustomEntry(entry) {
  return CUSTOM_PROPERTIES_PATTERN.test(entry.id);
}

function isEntryVisible(entry, tab, template) {
  var entryId = entry.id;

  if (tab.id === 'element-template') {
    return true;
  }

  var entriesVisible = template && template.entriesVisible || DEFAULT_ENTRIES_VISIBLE;

  if (isBoolean(entriesVisible)) {
    return entriesVisible;
  }

  var defaultVisible = entriesVisible._all || false,
      entryVisible = entriesVisible[ entryId ];

  if (defaultVisible) {
    return entryVisible !== false;
  } else {
    return entryVisible === true;
  }
}

function isEntryEditable(entry, template) {

  var property;

  if (isCustomEntry(entry)) {
    property = getProperty(template, entry);

    return property && property.editable !== false;
  }

  return true;
}

function getProperty(template, entry) {

  var idxAsNumber,
      scope,
      scopeName;

  var throwError = function() {
    throw new Error('cannot extract property index for entry <' + entry.id + '>');
  };

  // (0) retrieve raw property idx from entry
  var idxOrScope = entry.id.replace('custom-' + template.id + '-', '');

  // (1) handle custom props entries
  // e.g. custom-com.example.template-{idx}
  if (!idxOrScope.includes('-')) {
    idxAsNumber = parseInt(idxOrScope, 10);

    if (!isNumber(idxAsNumber)) {
      throwError();
    }

    return template.properties[idxAsNumber];
  }

  // (2) handle scope entries
  // e.g. custom-com.example.template-camunda_Connector-{idx}
  var entryParts = idxOrScope.split('-');

  if (entryParts.length == 2) {
    scopeName = entryParts[0].replace(/_/g, ':');

    idxAsNumber = parseInt(entryParts[1], 10);

    if (scopeName && isNumber(idxAsNumber)) {
      scope = findScopeForName(handleLegacyScopes(template.scopes), scopeName);

      return scope.properties[idxAsNumber];
    }

  }

  throwError();
}

function findScopeForName(scopes, scopeName) {
  return find(scopes, function(scope) {
    return scope.type === scopeName;
  });
}
