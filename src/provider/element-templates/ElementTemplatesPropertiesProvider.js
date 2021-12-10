import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import { ListGroup } from '@bpmn-io/properties-panel';

import {
  ElementTemplatesGroup,
  TemplateProps
} from './components';

import {
  CustomProperties,
  ErrorProperties,
  InputProperties,
  OutputProperties
} from './properties';

import { getTemplateId } from './Helper';

const CAMUNDA_ERROR_EVENT_DEFINITION_TYPE = 'camunda:errorEventDefinition',
      CAMUNDA_INPUT_PARAMETER_TYPE = 'camunda:inputParameter',
      CAMUNDA_OUTPUT_PARAMETER_TYPE = 'camunda:outputParameter';

const LOWER_PRIORITY = 300;


export default class ElementTemplatesPropertiesProvider {

  constructor(elementTemplates, propertiesPanel, injector) {
    propertiesPanel.registerProvider(LOWER_PRIORITY, this);

    this._elementTemplates = elementTemplates;
    this._injector = injector;
  }

  getGroups(element) {
    return (groups) => {
      const injector = this._injector;

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
          createInputGroup(element, elementTemplate, injector) || [],
          createOutputGroup(element, elementTemplate, injector) || [],
          createErrorGroup(element, elementTemplate, injector) || [],
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

function createInputGroup(element, elementTemplate, injector) {
  const translate = injector.get('translate');

  const group = {
    label: translate('Inputs'),
    id: 'ElementTemplates__Input',
    component: ListGroup,
    items: []
  };

  const properties = elementTemplate.properties.filter(({ binding, type }) => {
    return !type && binding.type === CAMUNDA_INPUT_PARAMETER_TYPE;
  });

  properties.forEach((property, index) => {
    const item = InputProperties({ element, index, property });

    if (item) {
      group.items.push(item);
    }
  });

  // remove if empty
  if (!group.items.length) {
    return null;
  }

  return group;
}

function createOutputGroup(element, elementTemplate, injector) {
  const translate = injector.get('translate');

  const group = {
    label: translate('Outputs'),
    id: 'ElementTemplates__Output',
    component: ListGroup,
    items: []
  };

  const properties = elementTemplate.properties.filter(({ binding, type }) => {
    return !type && binding.type === CAMUNDA_OUTPUT_PARAMETER_TYPE;
  });

  properties.forEach((property, index) => {
    const item = OutputProperties({ element, index, property, injector });

    if (item) {
      group.items.push(item);
    }
  });

  // remove if empty
  if (!group.items.length) {
    return null;
  }

  return group;
}

function createErrorGroup(element, elementTemplate, injector) {
  const translate = injector.get('translate');

  const group = {
    label: translate('Errors'),
    id: 'ElementTemplates__Error',
    component: ListGroup,
    items: []
  };

  const properties = elementTemplate.properties.filter(({ binding, type }) => {
    return !type && binding.type === CAMUNDA_ERROR_EVENT_DEFINITION_TYPE;
  });

  properties.forEach((property, index) => {
    const item = ErrorProperties({ element, index, property });

    if (item) {
      group.items.push(item);
    }
  });

  // remove if empty
  if (!group.items.length) {
    return null;
  }

  return group;
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
