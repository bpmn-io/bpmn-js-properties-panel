'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
    is = require('bpmn-js/lib/util/ModelUtil').is,
    getTemplate = require('../Helper').getTemplate,
    getTemplateId = require('../Helper').getTemplateId;


var TEMPLATE_ATTR = require('../Helper').TEMPLATE_ATTR;

function isAny(element, types) {
  return types.reduce(function(result, type) {
    return result || is(element, type);
  }, false);
}


module.exports = function(group, element, elementTemplates) {

  var options = getTemplateOptions(element, elementTemplates);

  if (options.length === 1) {
    return;
  }

  // select element template (via dropdown)

  group.entries.push(entryFactory.selectBox({
    id: 'elementTemplate-chooser',
    label: 'Element Template',
    modelProperty: 'camunda:modelerTemplate',
    selectOptions: options,
    set: function(element, properties) {
      return applyTemplate(element, properties[TEMPLATE_ATTR], elementTemplates);
    }
  }));

};


////// helpers //////////////////////////////////////

function applyTemplate(element, newTemplateId, elementTemplates) {

  // cleanup
  // clear input output mappings
  // undo changes to properties defined in template

  // re-establish
  // set input output mappings
  // apply changes to properties as defined in new template

  var oldTemplate = getTemplate(element, elementTemplates),
      newTemplate = elementTemplates.get(newTemplateId);

  if (oldTemplate === newTemplate) {
    return;
  }

  return {
    cmd: 'propertiesPanel.camunda.changeTemplate',
    context: {
      element: element,
      oldTemplate: oldTemplate,
      newTemplate: newTemplate
    }
  };
}

function getTemplateOptions(element, elementTemplates) {

  var currentTemplateId = getTemplateId(element);

  var options = [ {
    name: '',
    value: ''
  } ];

  var found;

  elementTemplates.forEach(function(t) {
    if (isAny(element, t.appliesTo)) {
      if (t.id === currentTemplateId) {
        found = true;
      }

      options.push({
        name: t.label,
        value: t.id
      });
    }
  });

  if (currentTemplateId && !found) {
    options.push({
      name: '[unknown template: ' + currentTemplateId + ']',
      value: currentTemplateId
    });
  }

  return options;
}