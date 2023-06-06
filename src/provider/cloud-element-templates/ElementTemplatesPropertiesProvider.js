import {
  createElementTemplatesGroup,
  TemplateProps
} from '../element-templates/components';

import {
  CustomProperties,
  MessageProps
} from './properties';

import { getTemplateId } from './Helper';

import { applyConditions } from './Condition';
import { getPropertyValue } from './util/propertyUtil';

const LOWER_PRIORITY = 300;


export default class ElementTemplatesPropertiesProvider {

  constructor(elementTemplates, propertiesPanel, injector) {
    propertiesPanel.registerProvider(LOWER_PRIORITY, this);

    this._elementTemplates = elementTemplates;
    this._injector = injector;
  }

  getGroups(element) {
    return (groups) => {

      updateMessageGroup(groups, element);

      if (!this._shouldShowTemplateProperties(element)) {
        return groups;
      }

      // (0) Copy provided groups
      groups = groups.slice();

      const templatesGroup = {
        element,
        id: 'ElementTemplates__Template',
        label: 'Template',
        component: createElementTemplatesGroup({
          getTemplateId
        }),
        entries: TemplateProps({ element, elementTemplates: this._elementTemplates })
      };

      // (1) Add templates group
      addGroupsAfter('documentation', groups, [ templatesGroup ]);

      let elementTemplate = this._elementTemplates.get(element);

      if (elementTemplate) {
        elementTemplate = applyConditions(element, elementTemplate, getPropertyValue);

        const templateSpecificGroups = [].concat(
          CustomProperties({ element, elementTemplate })
        );

        // (2) add template-specific properties groups
        addGroupsAfter('ElementTemplates__Template', groups, templateSpecificGroups);
      }

      // (3) apply entries visible
      if (getTemplateId(element)) {
        groups = filterWithEntriesVisible(elementTemplate || {}, groups);
      }

      return groups;
    };
  }

  _shouldShowTemplateProperties(element) {
    return getTemplateId(element) || this._elementTemplates.getAll(element).length;
  }
}

ElementTemplatesPropertiesProvider.$inject = [
  'elementTemplates',
  'propertiesPanel',
  'injector'
];


// helper /////////////////////

function updateMessageGroup(groups, element) {
  const messageGroup = findGroup(groups, 'message');

  if (!messageGroup) {
    return;
  }

  messageGroup.entries = overrideGenericEntries(
    messageGroup.entries,
    MessageProps({ element })
  );
}

function findGroup(groups, id) {
  return groups.find(g => g.id === id);
}

function overrideGenericEntries(oldEntries, newEntries) {
  return oldEntries.map(oldEntry => (
    newEntries.find(newEntry => newEntry.id === oldEntry.id) || oldEntry
  ));
}

/**
 *
 * @param {string} id
 * @param {Array<{ id: string }} groups
 * @param {Array<{ id: string }>} groupsToAdd
 */
function addGroupsAfter(id, groups, groupsToAdd) {
  const index = groups.findIndex(group => group.id === id);

  if (index !== -1) {
    groups.splice(index + 1, 0, ...groupsToAdd);
  } else {

    // add in the beginning if group with provided id is missing
    groups.unshift(...groupsToAdd);
  }
}

function filterWithEntriesVisible(template, groups) {
  if (!template.entriesVisible) {
    return groups.filter(group => {
      return (
        group.id === 'general' ||
        group.id.startsWith('ElementTemplates__')
      );
    });
  }

  return groups;
}
