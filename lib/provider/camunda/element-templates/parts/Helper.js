'use strict';

var find = require('lodash/find');

var isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;

var ELEMENT_TEMPLATE_OPTION_EMPTY = 'element-template-option-empty';

module.exports.ELEMENT_TEMPLATE_OPTION_EMPTY = ELEMENT_TEMPLATE_OPTION_EMPTY;

var emptyOption = {
  name: '',
  value: ELEMENT_TEMPLATE_OPTION_EMPTY
};

/**
 * Get options for given element and templates.
 *
 * @param {dj.model.Base} element
 * @param {ElementTemplates} elementTemplates
 * @param {Translate} translate
 */
function getOptions(element, elementTemplates, translate) {
  var options = [ emptyOption ];

  var defaultTemplate = elementTemplates.getDefault(element);

  if (defaultTemplate) {
    options.push(option('element-template-option-0', defaultTemplate, translate));

    return options;
  }

  var index = 0;

  elementTemplates.getAll().forEach(function(template) {
    if (!isAny(element, template.appliesTo)) {
      return;
    }

    options.push(option('element-template-option-' + index, template, translate));

    index++;
  });

  return options;
}

module.exports.getOptions = getOptions;

function getOption(optionId, options) {
  return find(options, function(option) {
    return optionId === option.value;
  });
}

module.exports.getOption = getOption;

function option(value, template, translate) {
  var name = translate(template.name);

  if (template.version) {
    name += ' (v' + template.version + ')';
  }

  var option = {
    id: template.id,
    name: name,
    value: value
  };

  if (template.version) {
    option.version = template.version;
  }

  return option;
}