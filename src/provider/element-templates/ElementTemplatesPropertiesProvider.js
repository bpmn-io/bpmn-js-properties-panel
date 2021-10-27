import ElementTemplatesGroup from './components/ElementTemplatesGroup';

import { CustomProperties } from './properties';

const LOWER_PRIORITY = 300;


export default class ElementTemplatesPropertiesProvider {

  constructor(elementTemplates, propertiesPanel) {
    propertiesPanel.registerProvider(LOWER_PRIORITY, this);

    this._elementTemplates = elementTemplates;
  }

  getGroups(element) {
    return (groups) => {

      // (0) Copy provided groups
      groups = groups.slice();

      const templatesGroup = {
        element,
        id: 'template',
        label: 'Template',
        component: ElementTemplatesGroup,
        entries: []
      };

      const customPropertiesGroups = CustomProperties({ element, elementTemplates: this._elementTemplates });

      // (1) Add templates group
      addGroupsAfter('documentation', groups, [ templatesGroup, ...customPropertiesGroups ]);

      // @TODO(barmac): add template-specific groups and remove according to entriesVisible

      return groups;
    };
  }

}

ElementTemplatesPropertiesProvider.$inject = [ 'elementTemplates', 'propertiesPanel' ];


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
    groups.splice(index, 0, ...groupsToAdd);
  } else {

    // add in the beginning if group with provided id is missing
    groups.unshift(...groupsToAdd);
  }
}
