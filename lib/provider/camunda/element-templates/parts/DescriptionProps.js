var escapeHTML = require('../../../../Utils').escapeHTML;

var getTemplateId = require('../Helper').getTemplateId,
    getTemplateVersion = require('../Helper').getTemplateVersion;

var domClasses = require('min-dom').classes,
    domEvent = require('min-dom').event,
    domify = require('min-dom').domify,
    domQuery = require('min-dom').query;

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var MAX_DESCRIPTION_LENGTH = 200;

module.exports = function(element, elementTemplates, modeling, replace, selection, translate) {
  var elementTemplate = elementTemplates.get(element);

  var entries = [];

  var description;

  if (elementTemplate) {
    description = elementTemplate.description;

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

  var version = getTemplateVersion(element);

  if (version) {
    entries.push({
      id: 'element-template-version',
      html: '<p>' + translate('Version') + ': ' + version + '</p>'
    });
  }

  return {
    id: 'elementTemplateDescription',
    label: elementTemplate ? elementTemplate.name : translate('Missing Template'),
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