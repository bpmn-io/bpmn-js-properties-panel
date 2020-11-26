'use strict';

var entryFactory = require('../../../../factory/EntryFactory');

var getOption = require('./Helper').getOption,
    getOptions = require('./Helper').getOptions,
    getTemplateId = require('../Helper').getTemplateId,
    ELEMENT_TEMPLATE_OPTION_EMPTY = require('../Helper').ELEMENT_TEMPLATE_OPTION_EMPTY;

var isNull = require('lodash/isNull'),
    isUndefined = require('lodash/isUndefined'),
    pick = require('lodash/pick');

module.exports = function(group, element, elementTemplates, translate) {
  if (!isUndefined(getTemplateId(element)) && !isNull(getTemplateId(element))) {
    return;
  }

  var options = getOptions(element, elementTemplates, translate);

  // Return if empty option is only option
  if (options.length === 1) {
    return;
  }

  var selectOptions = options.map(function(option) {
    return pick(option, [ 'name', 'value' ]);
  });

  // select element template (via dropdown)
  group.entries.push(entryFactory.selectBox(translate, {
    id: 'elementTemplate-chooser',
    label: translate('Element Template'),
    modelProperty: 'elementTemplateOption',
    selectOptions: selectOptions,
    get: function(element) {
      return {
        elementTemplateOption: ELEMENT_TEMPLATE_OPTION_EMPTY
      };
    },
    set: function(element, properties) {
      var optionId = properties['elementTemplateOption'];

      var option = getOption(optionId, options);

      var id = option.id,
          version = option.version;

      var newTemplate = elementTemplates.get(id, version);

      return applyTemplate(element, newTemplate, elementTemplates);
    }
  }));

};


// helpers //////////

function applyTemplate(element, newTemplate, elementTemplates) {
  var oldTemplate = elementTemplates.get(element);

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