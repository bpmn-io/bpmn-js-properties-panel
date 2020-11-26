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

var findExtension = require('../Helper').findExtension,
    findInputParameter = require('../Helper').findInputParameter;

var createInputParameter = require('../CreateHelper').createInputParameter;

var escapeHTML = require('../../../../Utils').escapeHTML;

var entryFactory = require('../../../../factory/EntryFactory');

var cmdHelper = require('../../../../helper/CmdHelper'),
    elementHelper = require('../../../../helper/ElementHelper');

var InputOutputParameter = require('../../parts/implementation/InputOutputParameter');

var CAMUNDA_INPUT_PARAMETER_TYPE = 'camunda:inputParameter';

var MAX_DESCRIPTION_LENGTH = 200;

var EMPTY_PARAMETER = {
  get: function() {},
  set: function() {}
};


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

  var template = elementTemplates.get(element);

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

    var parameterEntries = [],
        collapsibleEntry;

    var bo = getBusinessObject(element),
        inputOutput = findExtension(bo, 'camunda:InputOutput');

    if (!inputOutput) {
      return parameterEntries;
    }

    var getParameter = function() {
      return findInputParameter(inputOutput, templateProperty.binding) || EMPTY_PARAMETER;
    };

    var parameter = getParameter();

    var isOpen = function() {
      return collapsibleEntry.isOpen();
    };

    var assignmentIsOn = function() {
      var inputOutput = findExtension(getBusinessObject(element), 'camunda:InputOutput'),
          parameter = findInputParameter(inputOutput, templateProperty.binding);

      return !!parameter;
    };

    var options = {
      idPrefix: id + '-',
      onToggle: onToggle,
      getParameter: getParameter,
      isOpen: function() {
        return isOpen() && assignmentIsOn();
      }
    };


    // (1) use input parameter implementation
    var inputImplementation = InputOutputParameter(parameter, bpmnFactory, options, translate);
    parameterEntries = inputImplementation.entries;

    var nameIdx = findEntry(parameterEntries, id + '-parameterName');

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

    // (5) add parameter toggle
    parameterEntries.splice(templateProperty.description ? 2 : 1, 0, entryFactory.toggleSwitch(translate, {
      id: id + '-assignment-toggle',
      label: translate('Local Variable Assignment'),
      modelProperty: 'isActive',
      labelOn: translate('On'),
      labelOff: translate('Off'),
      descriptionOff: translate('The parameter won\'t be created as local variable.'),
      isOn: assignmentIsOn,
      get: function(element, node) {
        return { isActive: assignmentIsOn() };
      },
      set: function(element, values, node) {
        var isActive = values.isActive || false;

        if (isActive) {
          return createNewInputParameter(element, templateProperty.binding, bpmnFactory);
        } else {
          return removeInputParameter(element, templateProperty.binding);
        }

      },
      hidden: function(element, node) {
        return !isOpen();
      }
    }));

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

function removeInputParameter(element, binding) {
  var bo = getBusinessObject(element),
      updates = [],
      extensionElements = bo.get('extensionElements');

  if (!extensionElements) {
    return updates;
  }

  var inputOutput = findExtension(extensionElements, 'camunda:InputOutput');

  if (!inputOutput) {
    return updates;
  }

  var inputParameter = findInputParameter(inputOutput, binding);

  if (!inputParameter) {
    return updates;
  }

  updates.push(cmdHelper.removeElementsFromList(element, inputOutput, 'inputParameters', null, [inputParameter]));

  return updates;
}

function createNewInputParameter(element, binding, bpmnFactory) {
  var bo = getBusinessObject(element),
      updates = [],
      extensionElements = bo.get('extensionElements');

  // (1) ensure extension elements
  if (!extensionElements) {
    extensionElements = elementHelper.createElement('bpmn:ExtensionElements', null, element, bpmnFactory);

    updates.push(cmdHelper.updateBusinessObject(
      element, bo, { extensionElements: extensionElements }
    ));
  }

  var inputOutput = findExtension(extensionElements, 'camunda:InputOutput');

  // (2) ensure inputOutput element
  if (!inputOutput) {
    inputOutput = elementHelper.createElement('camunda:InputOutput', null, bo, bpmnFactory);

    updates.push(cmdHelper.addElementsTolist(
      element, extensionElements, 'values', inputOutput
    ));
  }

  // (3) create input parameter
  var inputParameter = createInputParameter(binding, null, bpmnFactory);

  updates.push(cmdHelper.addAndRemoveElementsFromList(
    element,
    inputOutput,
    'inputParameters',
    null,
    [ inputParameter ],
    [ ]
  ));

  return updates;
}


