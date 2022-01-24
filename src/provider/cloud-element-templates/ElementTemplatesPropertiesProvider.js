import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import {
  TemplateProps
} from '../element-templates/components';

import { ElementTemplatesGroup } from './components';

import {
  CustomProperties
} from './properties';

import { getTemplateId } from './Helper';

const LOWER_PRIORITY = 300;


export default class ElementTemplatesPropertiesProvider {

  constructor(elementTemplates, propertiesPanel, injector) {
    propertiesPanel.registerProvider(LOWER_PRIORITY, this);

    this._elementTemplates = elementTemplates;
    this._injector = injector;
  }

  getGroups(element) {
    return (groups) => {
      if (!this._shouldShowTemplateProperties(element)) {
        return groups;
      }

      // (0) Copy provided groups
      groups = groups.slice();

      const templatesGroup = {
        element,
        id: 'ElementTemplates__Template',
        label: 'Template',
        component: ElementTemplatesGroup,
        entries: TemplateProps({ element, elementTemplates: this._elementTemplates })
      };

      // (1) Add templates group
      addGroupsAfter('documentation', groups, [ templatesGroup ]);

      const elementTemplate = this._elementTemplates.get(element);

      if (elementTemplate) {
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
    return getTemplateId(element) || this._elementTemplates.getAll().some(template => {
      return isAny(element, template.appliesTo);
    });
  }
}

ElementTemplatesPropertiesProvider.$inject = [
  'elementTemplates',
  'propertiesPanel',
  'injector'
];


// helper /////////////////////

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
