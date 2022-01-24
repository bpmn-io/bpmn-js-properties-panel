import {
  isString,
  isUndefined
} from 'min-dash';

import {
  getTemplateId,
  getTemplateVersion
} from './Helper';

import { default as DefaultElementTemplates } from '../element-templates/ElementTemplates';

/**
 * Registry for element templates.
 */
export default class ElementTemplates extends DefaultElementTemplates {
  constructor() {
    super();
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
      return this.get(getTemplateId(element), getTemplateVersion(element));
    }
  }
}
