import {
  filter,
  find,
  flatten,
  isNil,
  isObject,
  isString,
  isUndefined,
  values
} from 'min-dash';

import {
  getTemplateId,
  getTemplateVersion
} from './Helper';

import { getBusinessObject, is, isAny } from 'bpmn-js/lib/util/ModelUtil';
import { getLabel, setLabel } from 'bpmn-js/lib/features/label-editing/LabelUtil';

/**
 * Registry for element templates.
 */
export default class ElementTemplates {
  constructor(commandStack, eventBus, modeling, injector) {
    this._commandStack = commandStack;
    this._eventBus = eventBus;
    this._injector = injector;
    this._modeling = modeling;

    this._templates = {};
  }

  /**
   * Get template with given ID and optional version or for element.
   *
   * @param {String|djs.model.Base} id
   * @param {number} [version]
   *
   * @return {ElementTemplate}
   */
  get(id, version) {
    const templates = this._templates;

    let element;

    if (isUndefined(id)) {
      return null;
    } else if (isString(id)) {

      if (isUndefined(version)) {
        version = '_';
      }

      if (templates[ id ] && templates[ id ][ version ]) {
        return templates[ id ][ version ];
      } else {
        return null;
      }
    } else {
      element = id;

      return this.get(this._getTemplateId(element), this._getTemplateVersion(element));
    }
  }

  /**
   * Get default template for given element.
   *
   * @param {djs.model.Base} element
   *
   * @return {ElementTemplate}
   */
  getDefault(element) {
    return find(this.getAll(element), function(template) {
      return template.isDefault;
    }) || null;
  }

  /**
   * Get all templates (with given ID or applicable to element).
   *
   * @param {string|djs.model.Base} [id]
   * @return {Array<ElementTemplate>}
   */
  getAll(id) {
    return this._getTemplateVerions(id, { includeDeprecated: true });
  }


  /**
   * Get all templates (with given ID or applicable to element) with the latest
   * version.
   *
   * @param {String|djs.model.Base} [id]
   * @param {{ deprecated?: boolean }} [options]
   *
   * @return {Array<ElementTemplate>}
   */
  getLatest(id, options = {}) {
    return this._getTemplateVerions(id, {
      ...options,
      latest: true
    });
  }

  /**
   * Set templates.
   *
   * @param {Array<ElementTemplate>} templates
   */
  set(templates) {
    this._templates = {};

    templates.forEach((template) => {
      const id = template.id,
            version = isUndefined(template.version) ? '_' : template.version;

      if (!this._templates[ id ]) {
        this._templates[ id ] = {
          latest: template
        };
      }

      this._templates[ id ][ version ] = template;

      const latestVerions = this._templates[ id ].latest.version;
      if (isUndefined(latestVerions) || template.version > latestVerions) {
        this._templates[ id ].latest = template;
      }
    });
  }

  /**
   * @param {object|string|null} id
   * @param { { latest?: boolean, deprecated?: boolean } [options]
   *
   * @return {Array<ElementTemplate>}
   */
  _getTemplateVerions(id, options = {}) {

    const {
      latest: latestOnly,
      deprecated: includeDeprecated
    } = options;

    const templates = this._templates;
    const getVersions = (template) => {
      const { latest, ...versions } = template;
      return latestOnly ? (
        !includeDeprecated && latest.deprecated ? [] : [ latest ]
      ) : values(versions) ;
    };

    if (isNil(id)) {
      return flatten(values(templates).map(getVersions));
    }

    if (isObject(id)) {
      const element = id;

      return filter(this._getTemplateVerions(null, options), function(template) {
        return isAny(element, template.appliesTo);
      }) || [];
    }

    if (isString(id)) {
      return templates[ id ] && getVersions(templates[ id ]);
    }

    throw new Error('argument must be of type {string|djs.model.Base|undefined}');
  }

  _getTemplateId(element) {
    return getTemplateId(element);
  }

  _getTemplateVersion(element) {
    return getTemplateVersion(element);
  }

  /**
   * Apply element template to a given element.
   *
   * @param {djs.model.Base} element
   * @param {ElementTemplate} newTemplate
   *
   * @return {djs.model.Base} the updated element
   */
  applyTemplate(element, newTemplate) {

    let action = 'apply';
    let payload = { element, newTemplate };
    const oldTemplate = this.get(element);

    if (oldTemplate && !newTemplate) {
      action = 'unlink';
      payload = { element };
    }

    if (newTemplate && oldTemplate && (newTemplate.id === oldTemplate.id)) {
      action = 'update';
    }

    const context = {
      element,
      newTemplate,
      oldTemplate
    };

    this._commandStack.execute('propertiesPanel.camunda.changeTemplate', context);

    this._eventBus.fire(`elementTemplates.${action}`, payload);

    return context.element;
  }

  /**
   * Remove template from a given element.
   *
   * @param {djs.model.Base} element
   *
   * @return {djs.model.Base} the updated element
   */
  removeTemplate(element) {
    const replace = this._injector.get('replace'),
          eventBus = this._injector.get('eventBus');

    eventBus.fire('elementTemplates.remove', { element });

    const businessObject = getBusinessObject(element);

    const type = businessObject.$type,
          eventDefinitionType = getEventDefinitionType(businessObject);

    const newBusinessObject = createBlankBusinessObject(element, this._injector);

    return replace.replaceElement(element, {
      type: type,
      businessObject: newBusinessObject,
      eventDefinitionType: eventDefinitionType
    });
  }

  /**
   * Unlink template from a given element.
   *
   * @param {djs.model.Base} element
   *
   * @return {djs.model.Base} the updated element
   */
  unlinkTemplate(element) {
    return this.applyTemplate(element, null);
  }

}

ElementTemplates.$inject = [
  'commandStack',
  'eventBus',
  'modeling',
  'injector'
];


// helper ///////////

function getEventDefinitionType(businessObject) {
  if (!businessObject.eventDefinitions) {
    return null;
  }

  const eventDefinition = businessObject.eventDefinitions[ 0 ];

  if (!eventDefinition) {
    return null;
  }

  return eventDefinition.$type;
}

function createBlankBusinessObject(element, injector) {
  const bpmnFactory = injector.get('bpmnFactory');

  const bo = getBusinessObject(element),
        newBo = bpmnFactory.create(bo.$type),
        label = getLabel(element);

  if (!label) {
    return newBo;
  }

  if (is(element, 'bpmn:Group')) {
    newBo.categoryValueRef = bpmnFactory.create('bpmn:CategoryValue');
  }

  setLabel({ businessObject: newBo }, label);

  return newBo;
}