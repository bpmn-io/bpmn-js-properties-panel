import { Validator } from './Validator';

import { default as TemplatesLoader } from '../element-templates/ElementTemplatesLoader';

export default class ElementTemplatesLoader extends TemplatesLoader {
  constructor(loadTemplates, eventBus, elementTemplates) {

    super(loadTemplates, eventBus, elementTemplates);

    this._elementTemplates = elementTemplates;
  }

  setTemplates(templates) {
    const elementTemplates = this._elementTemplates;

    const validator = new Validator().addAll(templates);

    const errors = validator.getErrors(),
          validTemplates = validator.getValidTemplates();

    elementTemplates.set(validTemplates);

    if (errors.length) {
      this.templateErrors(errors);
    }

    this.templatesChanged();
  }
}

ElementTemplatesLoader.$inject = [
  'config.elementTemplates',
  'eventBus',
  'elementTemplates'
];