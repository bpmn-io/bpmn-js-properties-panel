import {
  filter,
  find,
  flatten,
  isObject,
  isString,
  isUndefined,
  values
} from 'min-dash';

import {
  getTemplateId,
  getTemplateVersion
} from './Helper';

import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

/**
 * Registry for element templates.
 */
export default class ElementTemplates {
  constructor(commandStack) {
    this._commandStack = commandStack;

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
   * @param {String|djs.model.Base} [id]
   * @return {Array<ElementTemplate>}
   */
  getAll(id) {
    return this._getTemplateVerions(id, false);
  }


  /**
   * Get all templates (with given ID or applicable to element) with the latest
   * version.
   *
   * @param {String|djs.model.Base} [id]
   * @return {Array<ElementTemplate>}
   */
  getLatest(id) {
    return this._getTemplateVerions(id, true);
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

  _getTemplateVerions(id, latestOnly) {
    if (typeof id === 'boolean') {
      latestOnly = id;
      id = undefined;
    }

    const templates = this._templates;
    const getVersions = (template) => {
      const { latest, ...versions } = template;
      return latestOnly ? [ latest ] : values(versions) ;
    };

    if (isUndefined(id)) {
      return flatten(values(templates).map(getVersions));
    }

    if (isObject(id)) {
      const element = id;

      return filter(this._getTemplateVerions(latestOnly), function(template) {
        return isAny(element, template.appliesTo);
      }) || [];
    }

    if (isString(id)) {
      return templates[ id ] && getVersions(templates[ id ]);
    }

    throw new Error('argument must be of type {String|djs.model.Base|Undefined}');
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

    const oldTemplate = this.get(element);

    const context = {
      element,
      newTemplate,
      oldTemplate
    };

    this._commandStack.execute('propertiesPanel.camunda.changeTemplate', context);

    return context.element;
  }
}

ElementTemplates.$inject = [ 'commandStack' ];