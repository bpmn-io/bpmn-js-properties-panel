'use strict';

var entryFactory = require('../../../../factory/EntryFactory'),
    is = require('bpmn-js/lib/util/ModelUtil').is,
    getTemplate = require('../Helper').getTemplate,
    getTemplateId = require('../Helper').getTemplateId;

var find = require('lodash/collection/find');

var TEMPLATE_ATTR = require('../Helper').TEMPLATE_ATTR;

function isAny(element, types) {
  return types.reduce(function(result, type) {
    return result || is(element, type);
  }, false);
}


module.exports = function(group, element, elementTemplates, translate) {

  var options = getTemplateOptions(element, elementTemplates);

  if (options.length === 1 && !options[0].isDefault) {
    return;
  }

  // select element template (via dropdown)
  group.entries.push(entryFactory.selectBox({
    id: 'elementTemplate-chooser',
    label: translate('Element Template'),
    modelProperty: 'camunda:modelerTemplate',
    selectOptions: options,
    set: function(element, properties) {
      return applyTemplate(element, properties[TEMPLATE_ATTR], elementTemplates);
    },
    disabled: function() {
      var template = getTemplate(element, elementTemplates);

      return template && isDefaultTemplate(template);
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

  var emptyOption = {
    name: '',
    value: ''
  };

  var allOptions = elementTemplates.getAll().reduce(function(templates, t) {
    if (!isAny(element, t.appliesTo)) {
      return templates;
    }

    return templates.concat({
      name: t.name,
      value: t.id,
      isDefault: t.isDefault
    });
  }, [ emptyOption ]);


  var defaultOption = find(allOptions, function(option) {
    return isDefaultTemplate(option);
  });

  var currentOption = find(allOptions, function(option) {
    return option.value === currentTemplateId;
  });

  if (currentTemplateId && !currentOption) {
    currentOption = unknownTemplate(currentTemplateId);

    allOptions.push(currentOption);
  }

  if (!defaultOption) {

    // return all options, including empty
    // and optionally unknownTemplate option
    return allOptions;
  }

  // special limited handling for
  // default options

  var options = [];

  // current template not set
  if (!currentTemplateId) {
    options.push({
      name: '',
      value: ''
    });
  }

  // current template not default
  if (currentOption && currentOption !== defaultOption) {
    options.push(currentOption);
  }

  options.push(defaultOption);

  // [ (empty), (current), defaultOption ]
  return options;
}

function unknownTemplate(templateId) {
  return {
    name: '[unknown template: ' + templateId + ']',
    value: templateId
  };
}

function isDefaultTemplate(elementTemplate) {
  return elementTemplate.isDefault;
}