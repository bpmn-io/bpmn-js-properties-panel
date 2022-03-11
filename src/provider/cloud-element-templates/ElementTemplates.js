import {
  getTemplateId,
  getTemplateVersion
} from './Helper';

import { default as DefaultElementTemplates } from '../element-templates/ElementTemplates';

/**
 * Registry for element templates.
 */
export default class ElementTemplates extends DefaultElementTemplates {
  constructor(templateElementFactory) {
    super();
    this._templates = {};
    this._templateElementFactory = templateElementFactory;
  }

  _getTemplateId(element) {
    return getTemplateId(element);
  }

  _getTemplateVersion(element) {
    return getTemplateVersion(element);
  }

  /**
   * Create an element based on an element template.
   *
   * @param {ElementTemplate} template
   * @returns {djs.model.Base}
   */
  createElement(template) {
    if (!template) {
      throw new Error('template is missing');
    }

    const element = this._templateElementFactory.create(template);

    return element;
  }

}

ElementTemplates.$inject = [ 'templateElementFactory' ];
