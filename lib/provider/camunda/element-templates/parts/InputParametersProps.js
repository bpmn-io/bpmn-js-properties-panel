'use strict';

var assign = require('min-dash').assign,
    flatten = require('min-dash').flatten,
    filter = require('min-dash').filter,
    findIndex = require('min-dash').findIndex,
    forEach = require('min-dash').forEach;

var domClasses = require('min-dom').classes,
    domEvent = require('min-dom').event,
    domify = require('min-dom').domify,
    domQuery = require('min-dom').query;

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var getTemplate = require('../Helper').getTemplate;

var findExtension = require('../Helper').findExtension,
    findInputParameter = require('../Helper').findInputParameter;

var escapeHTML = require('../../../../Utils').escapeHTML;

var InputOutputParameter = require('../../parts/implementation/InputOutputParameter');

var CAMUNDA_INPUT_PARAMETER_TYPE = 'camunda:inputParameter';

var MAX_DESCRIPTION_LENGTH = 200;


/**
 * Injects element template input parameters into the given group.
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

  var inputEntries = [];


  function onToggle(value, entryNode) {
    if (!value) {
      return;
    }

    var currentEntryId = entryNode.dataset.entry;

    // collapse all other items
    inputEntries.forEach(function(entries) {
      var collapsible = entries[0];

      if (collapsible.id === currentEntryId) {
        return;
      }

      var entryNode = domQuery('[data-entry="' + collapsible.id + '"]');
      collapsible.setOpen(false, entryNode);
    });
  }

  function renderInputParameter(id, templateProperty) {

    var parameterEntries = [];

    // find input parameter first
    var bo = getBusinessObject(element),
        inputOutput = findExtension(bo, 'camunda:InputOutput');

    if (!inputOutput) {
      return parameterEntries;
    }

    // assumption: input parameter got created once template is applied
    var parameter = findInputParameter(inputOutput, templateProperty.binding);

    if (!parameter) {
      return parameterEntries;
    }

    var options = {
      idPrefix: id + '-',
      onToggle: onToggle
    };

    // (1) use input parameter implementation
    var inputImplementation = InputOutputParameter(parameter, bpmnFactory, options, translate);

    parameterEntries = inputImplementation.entries;

    var nameIdx = findEntry(parameterEntries, id + '-parameterName'),
        collapsibleEntry = parameterEntries[findEntry(parameterEntries, id + '-collapsible')];

    // (2) update title getter
    var defaultGet = collapsibleEntry.get;
    collapsibleEntry.get = function() {
      return assign(defaultGet(), {
        title: templateProperty.label ?
          translate(templateProperty.label) :
          templateProperty.binding.name
      });
    };

    // (3) remove name property entry
    removeEntry(parameterEntries, nameIdx);

    // (4) add description entry
    if (templateProperty.description) {
      parameterEntries.splice(1, 0, createDescriptionEntry(
        templateProperty.description,
        id,
        collapsibleEntry.isOpen,
        translate
      ));
    }

    return parameterEntries;
  }


  // filter specific input parameters from template
  var inputParameters = filter(template.properties, function(p) {
    return !p.type && p.binding.type === CAMUNDA_INPUT_PARAMETER_TYPE;
  });

  forEach(inputParameters, function(property, idx) {
    var id = 'template-inputs-' + template.id + '-' + idx;
    inputEntries.push(renderInputParameter(id, property));
  });

  group.entries = group.entries.concat(flatten(inputEntries));
};


// helper ///////////////////////

function findEntry(entries, id) {
  return findIndex(entries, function(entry) {
    return entry.id === id;
  });
}

function removeEntry(entries, idx) {
  entries.splice(idx, 1);
}

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

