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

  _getTemplateId(element) {
    return getTemplateId(element);
  }

  _getTemplateVersion(element) {
    return getTemplateVersion(element);
  }

}
