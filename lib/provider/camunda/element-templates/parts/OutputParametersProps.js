'use strict';

var flatten = require('min-dash').flatten,
    filter = require('min-dash').filter,
    forEach = require('min-dash').forEach;

var entryFactory = require('../../../../factory/EntryFactory'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    getTemplate = require('../Helper').getTemplate,
    cmdHelper = require('../../../../helper/CmdHelper');

var findExtension = require('../Helper').findExtension,
    findOutputParameter = require('../Helper').findOutputParameter;

var domClasses = require('min-dom').classes,
    domEvent = require('min-dom').event,
    domify = require('min-dom').domify,
    domQuery = require('min-dom').query;

var escapeHTML = require('../../../../Utils').escapeHTML;

var utils = require('../../../../Utils');

var CAMUNDA_OUTPUT_PARAMETER_TYPE = 'camunda:outputParameter';

var MAX_DESCRIPTION_LENGTH = 200;

/**
 * Injects element template output parameters into the given group.
 *
 * @param {Object} group
 * @param {djs.model.Base} element
 * @param {ElementTemplates} elementTemplates
 * @param {BpmnFactory} bpmnFactory
 * @param {Function} translate
 */
module.exports = function(group, element, elementTemplates, bpmnFactory, translate) {

  var template = getTemplate(element, elementTemplates);

  if (!template) {
    return [];
  }

  var outputEntries = [];


  function onToggle(value, entryNode) {
    if (!value) {
      return;
    }

    var currentEntryId = entryNode.dataset.entry;

    // collapse all other items
    outputEntries.forEach(function(entries) {
      var collapsible = entries[0];

      if (collapsible.id === currentEntryId) {
        return;
      }

      var entryNode = domQuery('[data-entry="' + collapsible.id + '"]');
      collapsible.setOpen(false, entryNode);
    });
  }

  function renderOutputParameter(id, templateProperty) {

    var parameterEntries = [];

    // find input parameter first
    var bo = getBusinessObject(element),
        inputOutput = findExtension(bo, 'camunda:InputOutput');

    if (!inputOutput) {
      return parameterEntries;
    }

    // assumption: input parameter got created once template is applied
    var parameter = findOutputParameter(inputOutput, templateProperty.binding);

    if (!parameter) {
      return parameterEntries;
    }

    // (1) add collapsible header
    var collapsible = entryFactory.collapsible({
      id: id + '-collapsible',
      title: translate(templateProperty.label),
      cssClasses: [
        'bpp-collapsible--with-mapping',
        'bpp-collapsible--with-template-out'
      ],
      onToggle: onToggle,
      open: false,
      get: function() {
        return {
          title: translate(templateProperty.label),
          description: parameter.name
        };
      }
    });
    parameterEntries.push(collapsible);

    var isOpen = collapsible.isOpen;

    // (2) add description
    if (templateProperty.description) {
      parameterEntries.push(createDescriptionEntry(
        templateProperty.description,
        id,
        isOpen,
        translate
      ));
    }

    // (3) add process variable name field
    parameterEntries.push(entryFactory.validationAwareTextField({
      id: id + '-variableName',
      label: translate('Assign to Process Variable'),
      modelProperty: 'variableName',
      getProperty: function(element) {
        return parameter.name;
      },
      setProperty: function(element, values) {
        return cmdHelper.updateBusinessObject(element, parameter, { name: values.variableName });
      },
      validate: function(element, values) {
        var validation = {},
            nameValue = values.variableName;

        if (nameValue) {
          if (utils.containsSpace(nameValue)) {
            validation.variableName = translate('Process Variable Name must not contain spaces.');
          }
        } else {
          validation.variableName = translate('Process Variable Name must not be empty.');
        }

        return validation;
      },
      hidden: function(element, node) {
        return !isOpen();
      }
    }));

    return parameterEntries;
  }

  // filter specific output parameters from template
  var outputParameters = filter(template.properties, function(p) {
    return !p.type && p.binding.type === CAMUNDA_OUTPUT_PARAMETER_TYPE;
  });

  forEach(outputParameters, function(property, idx) {
    var id = 'template-outputs-' + template.id + '-' + idx;
    outputEntries.push(renderOutputParameter(id, property));
  });

  group.entries = group.entries.concat(flatten(outputEntries));
};

// helpers ///////////////

function createDescriptionEntry(description, id, show, translate) {
  description = escapeHTML(description);

  var html = domify('<p class="description description--expanded" data-show="show"></p>');

  var descriptionText = domify('<span class="description__text">' + description + '</span>');

  html.appendChild(descriptionText);

  function toggleExpanded(expanded) {
    if (expanded) {
      domClasses(html).add('description--expanded');

      descriptionText.textContent = description + ' ';

      expand.textContent = translate('Less');
    } else {
      domClasses(html).remove('description--expanded');

      descriptionText.textContent = descriptionShortened + ' ... ';

      expand.textContent = translate('More');
    }
  }

  var descriptionShortened,
      expand,
      expanded = false;

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    descriptionShortened = description.slice(0, MAX_DESCRIPTION_LENGTH);

    expand = domify(
      '<span class="bpp-entry-link description__expand">' +
        translate('More') +
      '</span>'
    );

    domEvent.bind(expand, 'click', function() {
      expanded = !expanded;

      toggleExpanded(expanded);
    });

    html.appendChild(expand);

    toggleExpanded(expanded);
  }

  return {
    id: id + '-description',
    html: html,
    show: show
  };
}