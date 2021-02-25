var escapeHTML = require('../../../../Utils').escapeHTML;

var getTemplateId = require('../Helper').getTemplateId;

var domClasses = require('min-dom').classes,
    domEvent = require('min-dom').event,
    domify = require('min-dom').domify,
    domQuery = require('min-dom').query;

var isUndefined = require('lodash/isUndefined');

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var getVersionOrDateFromTemplate = require('./Helper').getVersionOrDateFromTemplate;

var MAX_DESCRIPTION_LENGTH = 200;

module.exports = function(
    element,
    commandStack,
    elementTemplates,
    modeling,
    replace,
    selection,
    translate) {
  var currentElementTemplate = elementTemplates.get(element);

  var entries = [];

  var description,
      newestElementTemplate;

  if (currentElementTemplate) {
    newestElementTemplate = findNewestElementTemplate(elementTemplates, currentElementTemplate);

    if (newestElementTemplate) {
      entries.push({
        id: 'element-template-update',
        cssClasses: [ 'bpp-entry--warning' ],
        html: createUpdateTemplateEntry(element, currentElementTemplate, newestElementTemplate, commandStack, translate)
      });
    }

    description = currentElementTemplate.description;

    if (description) {
      entries.push(createDescriptionEntry(description, translate));
    }
  } else {
    entries.push({
      id: 'element-template-not-found',
      cssClasses: [ 'bpp-entry--warning' ],
      html: createTemplateNotFoundEntry(element, modeling, translate)
    });
  }

  if (currentElementTemplate && currentElementTemplate.version) {
    entries.push({
      id: 'element-template-version',
      html: '<p>' + getVersionOrDateFromTemplate(currentElementTemplate) + '</p>'
    });
  }

  return {
    id: 'elementTemplateDescription',
    label: currentElementTemplate ? currentElementTemplate.name : translate('Missing Template'),
    dropdown: {
      menu: [
        {
          id: 'element-template-unlink',
          label: translate('Unlink'),
          onClick: function() {
            modeling.updateProperties(element, {
              'camunda:modelerTemplate': null,
              'camunda:modelerTemplateVersion': null
            });
          }
        },
        {
          id: 'element-template-remove',
          label: translate('Remove'),
          onClick: function() {
            var businessObject = getBusinessObject(element);

            var type = businessObject.$type,
                eventDefinitionType = getEventDefinitionType(businessObject);

            var newElement = replace.replaceElement(element, {
              type: type,
              eventDefinitionType: eventDefinitionType
            });

            selection.select(newElement);
          }
        }
      ]
    },
    entries: entries
  };
};

// helpers //////////

function createDescriptionEntry(description, translate) {
  description = escapeHTML(description);

  var html = domify('<p class="description description--expanded"></p>');

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
    id: 'element-template-description',
    html: html
  };
}

function getEventDefinitionType(businessObject) {
  if (!businessObject.eventDefinitions) {
    return null;
  }

  var eventDefinition = businessObject.eventDefinitions[ 0 ];

  if (!eventDefinition) {
    return null;
  }

  return eventDefinition.$type;
}

function createTemplateNotFoundEntry(element, modeling, translate) {
  var templateId = getTemplateId(element);

  var html = domify(
    '<p>' +
    translate(
      'The applied Template &lt;{templateId}&gt; was not found and therefore its data is not accessible.' +
      '<br />' +
      '<br />' +
      'Unlink in order to access the data.', { templateId: templateId }
    ) +
    '</p>' +
    '<p style="text-align: right;">' +
    '<a class="bpp-entry-link bpp-entry-link-button">Unlink</a>' +
    '</p>'
  );

  domQuery('.bpp-entry-link', html).addEventListener('click', function() {
    modeling.updateProperties(element, {
      'camunda:modelerTemplate': null
    });
  });

  return html;
}

function createUpdateTemplateEntry(element, oldElementTemplate, newElementTemplate, commandStack, translate) {
  var newElementTemplateVersion = getVersionOrDateFromTemplate(newElementTemplate);

  var html = domify(
    '<p>' +
    translate(
      'A new version of the Template ({newElementTemplateVersion}) is available.',
      { newElementTemplateVersion: newElementTemplateVersion }
    ) +
    '</p>' +
    '<p style="text-align: right;">' +
    '<a class="bpp-entry-link bpp-entry-link-button">Update</a>' +
    '</p>'
  );

  domQuery('.bpp-entry-link', html).addEventListener('click', function() {
    commandStack.execute('propertiesPanel.camunda.changeTemplate', {
      element: element,
      newTemplate: newElementTemplate,
      oldTemplate: oldElementTemplate
    });
  });

  return html;
}

function findNewestElementTemplate(elementTemplates, currentElementTemplate) {
  if (isUndefined(currentElementTemplate.version)) {
    return null;
  }

  return elementTemplates
    .getAll()
    .filter(function(elementTemplate) {
      return currentElementTemplate.id === elementTemplate.id && !isUndefined(elementTemplate.version);
    })
    .reduce(function(newestElementTemplate, elementTemplate) {
      if (currentElementTemplate.version < elementTemplate.version) {
        return elementTemplate;
      }

      if (newestElementTemplate && newestElementTemplate.version < elementTemplate.version) {
        return elementTemplate;
      }

      return newestElementTemplate;
    }, null);
}
