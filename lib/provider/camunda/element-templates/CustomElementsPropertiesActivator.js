'use strict';

var inherits = require('inherits');

var getTemplate = require('./Helper').getTemplate,
    getTemplateId = require('./Helper').getTemplateId;

var PropertiesActivator = require('../../../PropertiesActivator');

var HIGHER_PRIORITY = 1100;

/**
 * Decides what entries are visible and editable. When an element template is applied only entries
 * in the element template tab are visible. Override this behavior through a properties activator
 * with higher priority.
 *
 * @param {EventBus} eventBus
 * @param {ElementTemplates} elementTemplates
 */
function CustomElementsPropertiesActivator(eventBus, elementTemplates) {
  PropertiesActivator.call(this, eventBus, HIGHER_PRIORITY);

  this.isEntryVisible = function(element, entry, group, tab) {
    var templateId = getTemplateId(element);

    return isEntryVisible(tab, templateId);
  };

  this.isPropertyEditable = function(propertyName, element, entry, group, tab) {
    var template = getTemplate(element, elementTemplates);

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

function isCustomEntry(entry) {
  return CUSTOM_PROPERTIES_PATTERN.test(entry.id);
}

function isEntryVisible(tab, template) {
  if (template) {
    return tab.id === 'element-template';
  } else {
    return tab.id !== 'element-template';
  }
}

function isEntryEditable(entry, templateId) {
  var property;

  if (isCustomEntry(entry)) {
    property = getProperty(templateId, entry);

    return property && property.editable !== false;
  }

  return true;
}

function getProperty(template, entry) {

  var index;
  var idx = entry.id.replace('custom-' + template.id + '-', '');
  if (idx.indexOf('-') !== -1) {
    var indexes = idx.split('-');
    if (indexes.length == 2) {
      var scopeName = indexes[0].replace(/_/g, ':');
      index = parseInt(indexes[1], 10);
      if (scopeName && !isNaN(index)) {
        return template.scopes[scopeName].properties[index];
      }
    }
  } else {
    index = parseInt(idx, 10);
    if (!isNaN(index)) {
      return template.properties[index];
    }
  }

  throw new Error('cannot extract property index for entry <' + entry.id + '>');
}
